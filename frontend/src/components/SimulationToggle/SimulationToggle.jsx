import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { simulateHeatwave } from '../../services/api';
import { Flame, RefreshCw, CheckCircle2, Radio, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function SimulationToggle() {
  const { 
    wards, 
    selectedWard, 
    selectWard, 
    setSimulationActive, 
    refreshAll, 
    dataStreamMode, 
    setDataStreamMode 
  } = useApp();
  
  const [tier, setTier] = useState('Extreme');
  const [isLoading, setIsLoading] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleSimulate = async () => {
    const targetWard = selectedWard || wards[0];
    if (!targetWard) return;
    setIsLoading(true);
    try {
      const res = await simulateHeatwave(targetWard.wardId, tier);
      setSimulationActive({ wardId: targetWard.wardId, tier });
      setIsSimulated(true);
      setToastMessage(`⚡ ${tier} Heat Spike (${targetWard.name})! SMS alert dispatched to phone.`);
      setTimeout(() => setToastMessage(''), 4000);
      await refreshAll();
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  const handleReset = async () => {
    setSimulationActive(null);
    setIsSimulated(false);
    await refreshAll();
    
    // Show toast
    setToastMessage('Simulation reset. Live data restored.');
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="glass-panel p-5 relative overflow-hidden font-sans">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 right-0 bg-[#2DD4BF]/20 text-[#2DD4BF] text-xs font-bold py-2 px-4 flex items-center justify-center gap-2 border-b border-[#2DD4BF]/30 z-10 backdrop-blur-md"
          >
            <CheckCircle2 className="w-4 h-4" /> {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with Mode Badge */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500" /> Datastream & Simulation
        </h3>
        <div className="flex items-center gap-2 text-xs font-semibold bg-black/40 px-3 py-1 rounded-full border border-white/10">
          <span className="relative flex h-2 w-2">
            {isSimulated && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isSimulated ? 'bg-orange-500' : 'bg-teal-500'}`}></span>
          </span>
          <span className="text-gray-300">{isSimulated ? 'Simulating' : 'Idle'}</span>
        </div>
      </div>

      {/* Mode Selector Toggle Pills */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-black/50 border border-white/10 rounded-xl mb-3.5 text-xs">
        <button
          onClick={() => setDataStreamMode('live')}
          className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 font-bold transition-all cursor-pointer ${
            dataStreamMode === 'live'
              ? 'bg-[#2DD4BF] text-black shadow-md shadow-teal-500/20'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Radio className="w-3.5 h-3.5" /> 🛰️ Live Real-Time
        </button>
        <button
          onClick={() => setDataStreamMode('demo')}
          className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 font-bold transition-all cursor-pointer ${
            dataStreamMode === 'demo'
              ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md shadow-red-500/20'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Flame className="w-3.5 h-3.5" /> 🔥 Peak Summer
        </button>
      </div>

      {/* Inputs */}
      <div className="flex flex-col gap-3 mb-4">
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Target Ward</label>
          <select 
            value={selectedWard?.wardId || (wards[0]?.wardId || '')} 
            onChange={(e) => selectWard(e.target.value)}
            className="app-select cursor-pointer text-xs"
            disabled={isSimulated}
          >
            {wards.map(w => (
              <option key={w.wardId} value={w.wardId} className="bg-[#0B0E14] text-white">
                {w.name} ({w.wardId}) — {w.latestRisk?.forecastTempC}°C
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Heatwave Stress Level</label>
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value)}
            className="app-select cursor-pointer text-xs"
            disabled={isSimulated}
          >
            <option value="Severe" className="bg-[#0B0E14] text-orange-400">Severe Heatwave (44°C)</option>
            <option value="Extreme" className="bg-[#0B0E14] text-red-400">Extreme Heatwave (48°C)</option>
          </select>
        </div>
      </div>

      {/* Button Row */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleSimulate}
          disabled={isLoading || isSimulated || wards.length === 0}
          className={`flex-1 h-10 flex items-center justify-center gap-2 rounded-lg text-xs font-bold text-white transition-all duration-200 cursor-pointer
            ${isSimulated || wards.length === 0
              ? 'opacity-50 cursor-not-allowed bg-gray-800 border border-white/10' 
              : 'bg-gradient-to-r from-orange-500 to-red-600 shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 border border-red-400/30'
            }
          `}
        >
          {isLoading ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Flame className="w-3.5 h-3.5" />}
          Inject Heatwave Spike
        </button>

        <button
          onClick={handleReset}
          disabled={!isSimulated || isLoading}
          className={`h-10 px-3 rounded-lg border transition-all duration-200 flex items-center justify-center cursor-pointer
            ${!isSimulated 
              ? 'opacity-30 border-white/10 bg-transparent text-gray-500 cursor-not-allowed' 
              : 'border-white/20 bg-white/5 text-white hover:bg-white/10'
            }
          `}
          title="Reset Simulation"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
}

export default SimulationToggle;

