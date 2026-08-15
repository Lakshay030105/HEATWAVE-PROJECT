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
  const [dataStreamMode, setDataStreamMode] = useState('demo'); // 'live' | 'demo'
  const [liveWeatherMap, setLiveWeatherMap] = useState({});

  const rawWardsRef = React.useRef([]);
  rawWardsRef.current = rawWards;

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

  const fetchLiveWeatherForAll = useCallback(async (wardsList) => {
    try {
      const targets = (wardsList && wardsList.length > 0) ? wardsList : rawWardsRef.current;
      if (!targets || targets.length === 0) return;

      const weatherMap = {};
      await Promise.all(
        targets.map(async (w) => {
          const coords = w.boundary?.coordinates?.[0] || [[75.8, 26.85]];
          const avgLng = coords.reduce((s, c) => s + c[0], 0) / coords.length;
          const avgLat = coords.reduce((s, c) => s + c[1], 0) / coords.length;

          const greenPct = w.greenCoverPct !== undefined ? w.greenCoverPct : 0.15;
          const uhiOffset = Math.round((0.18 - greenPct) * 10 * 10) / 10;

          let liveTemp = null;
          let prediction = 'Low (No Heatwave)';
          let status = 'Live';

          // 1. Attempt AI Service Live Prediction
          try {
            const res = await fetch('http://localhost:8000/api/predict', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ latitude: avgLat, longitude: avgLng })
            });
            if (res.ok) {
              const data = await res.json();
              if (data && typeof data.temperature_celsius === 'number') {
                liveTemp = data.temperature_celsius;
                prediction = data.prediction || 'Low (No Heatwave)';
                status = data.status || 'Live AI';
              }
            }
          } catch (aiErr) {
            // Fallback to direct Open-Meteo
          }

          // 2. Fallback to direct Open-Meteo Live API
          if (liveTemp === null) {
            try {
              const omRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${avgLat}&longitude=${avgLng}&current=temperature_2m,relative_humidity_2m`);
              if (omRes.ok) {
                const omData = await omRes.json();
                if (omData?.current?.temperature_2m !== undefined) {
                  liveTemp = omData.current.temperature_2m;
                  prediction = liveTemp >= 45 ? 'Extreme Heatwave' : liveTemp >= 40 ? 'Mild Heatwave' : 'Low (No Heatwave)';
                  status = 'Live Satellite';
                }
              }
            } catch (omErr) {
              console.warn('Open-Meteo direct fetch notice:', omErr);
            }
          }

          if (liveTemp === null) {
            liveTemp = 29.2;
          }

          // Apply microclimate UHI offset based on ward green cover and built environment
          const adjustedTemp = Math.round((liveTemp + uhiOffset) * 10) / 10;

          weatherMap[w.wardId] = {
            tempC: adjustedTemp,
            baseLiveTemp: liveTemp,
            uhiOffset,
            prediction,
            status
          };
        })
      );
      setLiveWeatherMap(weatherMap);
    } catch (e) {
      console.warn('Live weather background ingestion notice:', e);
    }
  }, []);

  const fetchWards = useCallback(async () => {
    try {
      const res = await getWards();
      const loadedWards = res.data || [];
      setRawWards(loadedWards);
      if (loadedWards.length > 0) {
        fetchLiveWeatherForAll(loadedWards);
      }
    } catch (err) {
      console.error('Failed to fetch wards:', err);
    }
  }, [fetchLiveWeatherForAll]);

  const refreshAll = useCallback(async () => {
    try {
      const [wRes, rRes, aRes, resRes, repRes, euRes] = await Promise.all([
        getWards(),
        getLatestRisks(),
        getAlerts(),
        getResources(),
        getReports(),
        getEmergencyUnits()
      ]);
      const loadedWards = wRes.data || [];
      setRawWards(loadedWards);
      setLatestRisks(rRes.data || []);
      setAlerts(aRes.data || []);
      setResources(resRes.data || []);
      setReports(repRes.data || []);
      setEmergencyUnits(euRes.data || []);
      if (loadedWards.length > 0) {
        fetchLiveWeatherForAll(loadedWards);
      }
    } catch (err) {
      console.error('Failed to refresh data:', err);
    }
  }, [fetchLiveWeatherForAll]);

  const selectWard = useCallback((wardId) => {
    setSelectedWardId(wardId);
  }, []);

  // Compute active wards according to dataStreamMode (Live vs Demo) AND predictive slider
  const wards = useMemo(() => {
    return rawWards.map(w => {
      const isLive = dataStreamMode === 'live';
      const greenPct = w.greenCoverPct !== undefined ? w.greenCoverPct : 0.15;
      const uhiOffset = Math.round((0.18 - greenPct) * 10 * 10) / 10;
      const fallbackLiveTemp = Math.round((29.2 + uhiOffset) * 10) / 10;

      const liveInfo = liveWeatherMap[w.wardId] || {
        tempC: fallbackLiveTemp,
        prediction: 'Low (No Heatwave)',
        status: 'Live'
      };

      // Base temperature selection:
      // In Live mode: use live weather with UHI microclimate
      // In Demo mode: use DB forecastTempC (or benchmark values)
      const baseTemp = isLive 
        ? (liveInfo.tempC ?? fallbackLiveTemp) 
        : (w.latestRisk?.forecastTempC || 41.5);

      // Time-travel temperature delta
      let tempDelta = 0;
      if (predictionHours === 3) tempDelta = isLive ? 2.5 : 1.5;
      else if (predictionHours === 6) tempDelta = isLive ? 7.0 : 3.0; // Peak afternoon solar heating
      else if (predictionHours === 12) tempDelta = isLive ? -3.5 : -2.0; // Night cooling
      else if (predictionHours === 24) tempDelta = isLive ? 6.0 : 2.5; // Next day
      else if (predictionHours === 48) tempDelta = isLive ? 10.5 : 4.0; // Multi-day heatwave escalation

      const forecastTemp = Math.round((baseTemp + tempDelta) * 10) / 10;

      // Dynamic HVI computation for the forecasted temperature
      const tempMin = isLive ? 20 : 30;
      const tempRange = isLive ? 22 : 20;
      const lstNorm = Math.min(100, Math.max(0, ((forecastTemp - tempMin) / tempRange) * 100));
      const elderlyNorm = (w.pctElderly || 0.1) * 100 * 4;
      const outdoorNorm = (w.pctOutdoorWorkers || 0.2) * 100 * 2;
      const greenInvertNorm = (1 - (w.greenCoverPct || 0.1)) * 100;

      const computedHvi = Math.min(100, Math.round(
        0.35 * lstNorm + 0.25 * elderlyNorm + 0.25 * outdoorNorm + 0.15 * greenInvertNorm
      ));

      // Calculate severity and risk tier
      let forecastSeverity = 0;
      if (forecastTemp >= (isLive ? 38 : 45)) forecastSeverity = 100;
      else if (forecastTemp >= (isLive ? 34 : 42)) forecastSeverity = 75;
      else if (forecastTemp >= (isLive ? 30 : 39)) forecastSeverity = 50;
      else if (forecastTemp >= (isLive ? 27 : 35)) forecastSeverity = 25;

      const combinedScore = Math.round(0.6 * computedHvi + 0.4 * forecastSeverity);

      let calculatedTier = 'Low';
      if (combinedScore > 75 || forecastTemp >= (isLive ? 42 : 45)) calculatedTier = 'Extreme';
      else if (combinedScore > 50 || forecastTemp >= (isLive ? 35 : 42)) calculatedTier = 'Severe';
      else if (combinedScore > 25 || forecastTemp >= (isLive ? 30 : 39)) calculatedTier = 'Moderate';

      // Default baseline when slider is at 0h (Current)
      let latestRisk = {
        ...w.latestRisk,
        forecastTempC: forecastTemp,
        hvi: computedHvi,
        riskTier: predictionHours === 0 && isLive ? 'Low' : calculatedTier,
        forecastHumidity: isLive ? 65 : 30,
        mlPrediction: isLive && predictionHours === 0 ? (liveInfo?.prediction || 'Low (No Heatwave)') : `${calculatedTier} Heat Forecast`,
        isSimulated: false,
        combinedScore
      };

      // Manual simulation override takes precedence if active (in demo mode or explicitly triggered)
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
    });
  }, [rawWards, simulationActive, predictionHours, dataStreamMode, liveWeatherMap]);

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
    let isMounted = true;
    const init = async () => {
      setLoading(true);
      await refreshAll();
      if (isMounted) setLoading(false);
    };
    init();
    return () => { isMounted = false; };
  }, [refreshAll]);

  // Auto-fetch live weather when switching to 'live' mode
  useEffect(() => {
    if (dataStreamMode === 'live') {
      fetchLiveWeatherForAll();
    }
  }, [dataStreamMode, fetchLiveWeatherForAll]);

  // Auto-select first ward by default
  useEffect(() => {
    if (!selectedWardId && rawWards.length > 0) {
      setSelectedWardId(rawWards[0].wardId);
    }
  }, [rawWards, selectedWardId]);

  const updateDataStreamMode = useCallback((mode) => {
    setDataStreamMode(mode);
    if (mode === 'live') {
      setSimulationActive(null);
    }
  }, []);

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
    dataStreamMode,
    setDataStreamMode: updateDataStreamMode,
    setActiveLayer,
    setPredictionHours,
    setSimulationActive,
    fetchWards,
    fetchAlerts,
    fetchResources,
    fetchReports,
    fetchEmergencyUnits,
    fetchLiveWeatherForAll,
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
