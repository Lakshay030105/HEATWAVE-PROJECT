import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import FeedbackForm from '../FeedbackForm/FeedbackForm';
import { MapPin, Thermometer, Droplets, Map, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TIER_COLORS = {
  Low: '#2DD4BF',
  Moderate: '#FBBF24',
  Severe: '#FB7A3C',
  Extreme: '#EF4444',
};

function CitizenView() {
  const { wards, resources } = useApp();
  const [selectedWardId, setSelectedWardId] = useState('');

  const selectedWard = wards.find(w => w.wardId === selectedWardId);
  const tier = selectedWard?.latestRisk?.riskTier;
  const tierColor = TIER_COLORS[tier] || '#94a3b8';
  
  // Find nearest cooling centers for this ward
  const wardResources = resources.filter(r => r.wardId === selectedWardId && r.type === 'cooling_center');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start font-sans">
      
      {/* Left Column: Heat Risk Check */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-panel p-6 md:p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-lg bg-teal-500/10 border border-teal-500/20">
            <Map className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Check Your Ward's Heat Risk</h2>
            <p className="text-sm text-gray-400 mt-0.5">Select your locality to see live conditions.</p>
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-xs font-bold text-gray-300 mb-2 uppercase tracking-wider">Select Your Ward</label>
          <select
            value={selectedWardId}
            onChange={(e) => setSelectedWardId(e.target.value)}
            className="app-select cursor-pointer text-base"
          >
            <option value="" className="bg-[#0B0E14] text-gray-400">-- Choose Ward --</option>
            {wards.map((w) => (
              <option key={w.wardId} value={w.wardId} className="bg-[#0B0E14] text-white">
                {w.name} ({w.wardId})
              </option>
            ))}
          </select>
        </div>

        <AnimatePresence mode="wait">
          {selectedWard ? (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Risk Status Card */}
              <div className="p-5 rounded-xl border relative overflow-hidden" style={{ borderColor: `${tierColor}40`, background: `${tierColor}10` }}>
                <div className="absolute top-0 right-0 p-4 opacity-20">
                  <AlertTriangle size={64} color={tierColor} />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: tierColor }}>Current Risk Level</h3>
                <div className="text-3xl font-black tabular-data mb-4 text-white">{tier} Risk</div>
                
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-200">Temp: <strong className="text-white">{selectedWard.latestRisk?.forecastTempC}°C</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-200">Humidity: <strong className="text-white">{selectedWard.latestRisk?.forecastHumidity}%</strong></span>
                  </div>
                </div>
              </div>

              {/* Cooling Centers */}
              <div>
                <h4 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-teal-400" /> Nearest Cooling Centers
                </h4>
                {wardResources.length > 0 ? (
                  <div className="space-y-3">
                    {wardResources.map(r => (
                      <div key={r._id} className="bg-black/40 border border-white/10 p-4 rounded-lg flex items-start justify-between">
                        <div>
                          <div className="font-bold text-gray-200 mb-1">{r.name}</div>
                          <div className="text-xs text-gray-400">{r.address}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-1">Open</div>
                          <div className="text-xs text-gray-400 tabular-data">{r.currentOccupancy} / {r.capacity} full</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-400 bg-black/40 p-4 rounded-lg border border-white/10 italic">
                    No active cooling centers registered for this ward.
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 text-center opacity-50"
            >
              <MapPin className="w-16 h-16 text-gray-600 mb-4" />
              <p className="text-gray-300 font-medium">Please select your ward from the dropdown<br/>to view live local updates.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Right Column: Report Issue Form */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <FeedbackForm />
      </motion.div>
    </div>
  );
}

export default CitizenView;
