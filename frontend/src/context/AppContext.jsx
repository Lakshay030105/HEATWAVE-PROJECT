import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getWards, getAlerts, getResources, getLatestRisks } from '../services/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [rawWards, setRawWards] = useState([]);
  const [selectedWardId, setSelectedWardId] = useState(null);
  const [latestRisks, setLatestRisks] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulationActive, setSimulationActive] = useState(null);

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

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchWards(), fetchLatestRisks(), fetchAlerts(), fetchResources()]);
  }, [fetchWards, fetchLatestRisks, fetchAlerts, fetchResources]);

  const selectWard = useCallback((wardId) => {
    setSelectedWardId(wardId);
  }, []);

  // Compute active wards with simulation state applied dynamically
  const wards = useMemo(() => {
    if (!simulationActive) return rawWards;
    return rawWards.map(w => {
      if (w.wardId === simulationActive.wardId) {
        return {
          ...w,
          latestRisk: {
            ...w.latestRisk,
            riskTier: simulationActive.tier,
            forecastTempC: simulationActive.tier === 'Extreme' ? 47 : 44,
            hvi: simulationActive.tier === 'Extreme' ? 95 : 82,
          }
        };
      }
      return w;
    });
  }, [rawWards, simulationActive]);

  // Compute currently selected ward with updated simulation data
  const selectedWard = useMemo(() => {
    if (!selectedWardId) return null;
    return wards.find(w => w.wardId === selectedWardId) || null;
  }, [wards, selectedWardId]);

  // Auto-fetch on mount
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await refreshAll();
      setLoading(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll every 15 seconds to keep map up-to-date
  useEffect(() => {
    const interval = setInterval(refreshAll, 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    wards,
    selectedWard,
    latestRisks,
    alerts,
    resources,
    loading,
    simulationActive,
    setSimulationActive,
    fetchWards,
    fetchAlerts,
    fetchResources,
    selectWard,
    refreshAll,
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
