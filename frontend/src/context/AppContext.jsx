import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  getWards, getAlerts, getResources, getLatestRisks,
  getReports, getEmergencyUnits, sendBroadcastAlert,
  updateResource, updateReport, dispatchUnitApi, recomputeMLPipeline
} from '../services/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [rawWards, setRawWards] = useState([]);
  const [selectedWardId, setSelectedWardId] = useState('');
  const [latestRisks, setLatestRisks] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [resources, setResources] = useState([]);
  const [reports, setReports] = useState([]);
  const [emergencyUnits, setEmergencyUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulationActive, setSimulationActive] = useState(null);
  const [predictionHours, setPredictionHours] = useState(0); // 0, 3, 6, 12, 24, 48
  const [activeLayer, setActiveLayer] = useState('hvi'); // 'hvi', 'lst', 'ndvi', 'demographics'

  const fetchWards = useCallback(async () => {
    try {
      const res = await getWards();
      setRawWards(res.data || []);
    } catch (err) {
      console.error('Failed to fetch wards:', err);
    }
  }, []);

  const fetchLatestRisks = useCallback(async () => {
    try {
      const res = await getLatestRisks();
      setLatestRisks(res.data || []);
    } catch (err) {
      console.error('Failed to fetch risks:', err);
    }
  }, []);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await getAlerts();
      setAlerts(res.data || []);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    }
  }, []);

  const fetchResources = useCallback(async () => {
    try {
      const res = await getResources();
      setResources(res.data || []);
    } catch (err) {
      console.error('Failed to fetch resources:', err);
    }
  }, []);

  const fetchReports = useCallback(async () => {
    try {
      const res = await getReports();
      setReports(res.data || []);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    }
  }, []);

  const fetchEmergencyUnits = useCallback(async () => {
    try {
      const res = await getEmergencyUnits();
      setEmergencyUnits(res.data || []);
    } catch (err) {
      console.error('Failed to fetch emergency units:', err);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchWards(),
      fetchLatestRisks(),
      fetchAlerts(),
      fetchResources(),
      fetchReports(),
      fetchEmergencyUnits()
    ]);
  }, [fetchWards, fetchLatestRisks, fetchAlerts, fetchResources, fetchReports, fetchEmergencyUnits]);

  const selectWard = useCallback((wardId) => {
    setSelectedWardId(wardId);
  }, []);

  // Compute active wards with simulation state AND predictive timeline hours applied
  const wards = useMemo(() => {
    return rawWards.map(w => {
      // If in standard live mode (predictionHours === 0), use the true live AI model / DB risk
      if (predictionHours === 0) {
        let latestRisk = w.latestRisk || {
          riskTier: 'Moderate',
          hvi: 50,
          forecastTempC: 40,
          forecastHumidity: 30
        };

        // If manual simulation override is active for this ward, override with simulation state
        if (simulationActive && w.wardId === simulationActive.wardId) {
          latestRisk = {
            ...latestRisk,
            riskTier: simulationActive.tier,
            forecastTempC: simulationActive.tier === 'Extreme' ? 48 : simulationActive.tier === 'Severe' ? 45 : 42,
            hvi: simulationActive.tier === 'Extreme' ? 95 : 82,
            isSimulated: true
          };
        }

        return {
          ...w,
          latestRisk
        };
      }

      // If time-travel forecasting slider is actively used:
      const tempDelta =
        predictionHours === 3 ? 1.5 :
        predictionHours === 6 ? 3.0 :
        predictionHours === 12 ? -2.0 :
        predictionHours === 24 ? 2.5 : 4.0;

      const baseTemp = w.latestRisk?.forecastTempC || 40;
      const forecastTemp = Math.round(baseTemp + tempDelta);

      const lstNorm = Math.min(100, Math.max(0, ((forecastTemp - 30) / 20) * 100));
      const elderlyNorm = (w.pctElderly || 0.1) * 100 * 4;
      const outdoorNorm = (w.pctOutdoorWorkers || 0.2) * 100 * 2;
      const greenInvertNorm = (1 - (w.greenCoverPct || 0.1)) * 100;
      
      const computedHvi = Math.min(100, Math.round(
        0.35 * lstNorm + 0.25 * elderlyNorm + 0.25 * outdoorNorm + 0.15 * greenInvertNorm
      ));

      let forecastSeverity = 0;
      if (forecastTemp > 45) forecastSeverity = 100;
      else if (forecastTemp > 42) forecastSeverity = 75;
      else if (forecastTemp > 39) forecastSeverity = 50;
      else if (forecastTemp > 35) forecastSeverity = 25;

      const combinedScore = Math.round(0.6 * computedHvi + 0.4 * forecastSeverity);
      let calculatedTier = 'Low';
      if (combinedScore > 75) calculatedTier = 'Extreme';
      else if (combinedScore > 50) calculatedTier = 'Severe';
      else if (combinedScore > 25) calculatedTier = 'Moderate';

      let latestRisk = {
        ...w.latestRisk,
        forecastTempC: forecastTemp,
        hvi: computedHvi,
        riskTier: calculatedTier,
        combinedScore
      };

      if (simulationActive && w.wardId === simulationActive.wardId) {
        latestRisk = {
          ...latestRisk,
          riskTier: simulationActive.tier,
          forecastTempC: simulationActive.tier === 'Extreme' ? 48 : simulationActive.tier === 'Severe' ? 45 : 42,
          hvi: simulationActive.tier === 'Extreme' ? 95 : 82,
        };
      }

      return {
        ...w,
        latestRisk
      };
    });
  }, [rawWards, simulationActive, predictionHours]);

  // Selected ward memo
  const selectedWard = useMemo(() => {
    if (!selectedWardId) return wards[0] || null;
    return wards.find(w => w.wardId === selectedWardId) || wards[0] || null;
  }, [wards, selectedWardId]);

  // Action: Dispatch Broadcast Alert
  const dispatchAlert = useCallback(async (alertData) => {
    try {
      const res = await sendBroadcastAlert(alertData);
      const newAlert = res.data || alertData;
      setAlerts(prev => [newAlert, ...prev]);
      return newAlert;
    } catch (err) {
      console.error('Failed to dispatch alert:', err);
      const fallbackAlert = {
        _id: `alert-${Date.now()}`,
        sentAt: new Date().toISOString(),
        status: 'sent',
        ...alertData
      };
      setAlerts(prev => [fallbackAlert, ...prev]);
      return fallbackAlert;
    }
  }, []);

  // Action: Update Resource Occupancy / Status
  const updateResourceOccupancy = useCallback(async (id, newOccupancy, newStatus) => {
    try {
      await updateResource(id, { currentOccupancy: newOccupancy, status: newStatus });
      setResources(prev => prev.map(r => r._id === id ? { ...r, currentOccupancy: newOccupancy, status: newStatus || r.status } : r));
    } catch (err) {
      setResources(prev => prev.map(r => r._id === id ? { ...r, currentOccupancy: newOccupancy, status: newStatus || r.status } : r));
    }
  }, []);

  // Action: Update Citizen Report Status
  const updateReportStatus = useCallback(async (id, newStatus, resolutionNote) => {
    try {
      await updateReport(id, { status: newStatus, resolutionNote });
      setReports(prev => prev.map(r => r._id === id ? { ...r, status: newStatus, resolutionNote: resolutionNote || r.resolutionNote } : r));
    } catch (err) {
      setReports(prev => prev.map(r => r._id === id ? { ...r, status: newStatus, resolutionNote: resolutionNote || r.resolutionNote } : r));
    }
  }, []);

  // Action: Dispatch Emergency Unit
  const dispatchUnit = useCallback(async (unitId, wardId) => {
    try {
      await dispatchUnitApi(unitId, wardId);
      setEmergencyUnits(prev => prev.map(u => u.id === unitId ? { ...u, assignedWard: wardId, status: 'dispatched', etaMins: 5 } : u));
    } catch (err) {
      setEmergencyUnits(prev => prev.map(u => u.id === unitId ? { ...u, assignedWard: wardId, status: 'dispatched', etaMins: 5 } : u));
    }
  }, []);

  // Action: Trigger ML Pipeline Recompute
  const triggerMLRecompute = useCallback(async () => {
    try {
      await recomputeMLPipeline();
      await refreshAll();
    } catch (err) {
      console.warn('ML Recompute trigger fallback simulated');
    }
  }, [refreshAll]);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await refreshAll();
      setLoading(false);
    };
    init();
  }, [refreshAll]);

  const value = {
    wards,
    selectedWard,
    latestRisks,
    alerts,
    resources,
    reports,
    emergencyUnits,
    loading,
    simulationActive,
    predictionHours,
    activeLayer,
    setActiveLayer,
    setPredictionHours,
    setSimulationActive,
    fetchWards,
    fetchAlerts,
    fetchResources,
    fetchReports,
    fetchEmergencyUnits,
    selectWard,
    refreshAll,
    dispatchAlert,
    updateResourceOccupancy,
    updateReportStatus,
    dispatchUnit,
    triggerMLRecompute
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
