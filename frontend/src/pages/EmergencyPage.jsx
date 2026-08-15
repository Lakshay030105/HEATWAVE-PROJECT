import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import {
  Ambulance, Truck, HeartPulse, PhoneCall, ShieldAlert,
  Send, Navigation, CheckCircle2, AlertTriangle, Radio, Activity, Clock
} from 'lucide-react';

const UNIT_ICONS = {
  ambulance: Ambulance,
  water_tanker: Truck,
  mobile_clinic: HeartPulse
};

function EmergencyPage() {
  const { emergencyUnits, wards, dispatchUnit } = useApp();
  const { showToast } = useToast();

  const [selectedUnit, setSelectedUnit] = useState(null);
  const [targetWardId, setTargetWardId] = useState(wards[0]?.wardId || 'JAI-W01');

  const availableCount = emergencyUnits.filter(u => u.status === 'available').length;
  const dispatchedCount = emergencyUnits.filter(u => u.status === 'dispatched').length;
  const onSceneCount = emergencyUnits.filter(u => u.status === 'on_scene').length;

  const handleDispatch = async (e) => {
    e.preventDefault();
    if (!selectedUnit) return;

    await dispatchUnit(selectedUnit.id, targetWardId);
    const wardName = wards.find(w => w.wardId === targetWardId)?.name || targetWardId;
    showToast(`Dispatched ${selectedUnit.code} to ${wardName} (ETA ~5 mins)`, 'warning');
    setSelectedUnit(null);
  };

  const handleSOSDispatch = (callerName, wardId) => {
    const availableAmb = emergencyUnits.find(u => u.type === 'ambulance' && u.status === 'available') || emergencyUnits[0];
    dispatchUnit(availableAmb.id, wardId);
    showToast(`Emergency 108 unit dispatched for ${callerName} at ${wardId}`, 'warning');
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto p-6 md:p-8 flex flex-col gap-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider mb-1">
            <Radio className="w-4 h-4 animate-pulse" /> Emergency Coordination & Rapid Dispatch
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Emergency Fleet & Heat-Stroke Triage Hub
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Coordinated 108 Ambulance response, PHED water tankers, and mobile cooling medical units
          </p>
        </div>

        {/* Emergency Call Box */}
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 p-3 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
            <PhoneCall className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-red-300 uppercase tracking-wider">Disaster Control Room</div>
            <div className="text-lg font-bold text-white tabular-data">112 / 108</div>
          </div>
        </div>
      </div>

      {/* Fleet Status Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-500/15 border border-teal-500/25 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Available Fleet</div>
            <div className="text-2xl font-bold text-teal-300 tabular-data">{availableCount} Units</div>
            <div className="text-xs text-gray-400">Ready for instant dispatch</div>
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center shrink-0">
            <Navigation className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">En Route / Dispatched</div>
            <div className="text-2xl font-bold text-orange-400 tabular-data">{dispatchedCount} Units</div>
            <div className="text-xs text-gray-400">Average ETA 4-8 mins</div>
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/15 border border-red-500/25 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Active On Scene</div>
            <div className="text-2xl font-bold text-red-400 tabular-data">{onSceneCount} Units</div>
            <div className="text-xs text-gray-400">Treating heat casualties</div>
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Water Tankers</div>
            <div className="text-2xl font-bold text-blue-300 tabular-data">20,000 L</div>
            <div className="text-xs text-gray-400">Municipal PHED reserve</div>
          </div>
        </div>
      </div>

      {/* Fleet Dispatch Grid */}
      <div className="glass-panel p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Ambulance className="w-5 h-5 text-teal-400" /> Rapid Response Fleet Deployment Board
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Click "Deploy Unit" to assign vehicles to extreme risk zones</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {emergencyUnits.map(unit => {
            const Icon = UNIT_ICONS[unit.type] || Ambulance;
            const assignedWardObj = wards.find(w => w.wardId === unit.assignedWard);
            const isAvailable = unit.status === 'available';

            return (
              <div key={unit.id} className="p-4 rounded-xl bg-black/30 border border-white/10 flex flex-col justify-between hover:border-white/20 transition-all">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center
                        ${unit.type === 'ambulance' ? 'bg-red-500/20 text-red-400' : unit.type === 'water_tanker' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}
                      `}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{unit.code}</div>
                        <div className="text-[10px] text-gray-400">{unit.baseStation}</div>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                      ${unit.status === 'available' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' :
                        unit.status === 'dispatched' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                        'bg-red-500/20 text-red-400 border border-red-500/30'}
                    `}>
                      {unit.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-gray-300 my-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Crew:</span>
                      <span>{unit.crew}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Assigned Zone:</span>
                      <span className="font-bold text-white">{assignedWardObj ? `${assignedWardObj.name} (${unit.assignedWard})` : 'Unassigned'}</span>
                    </div>
                    {unit.status === 'dispatched' && (
                      <div className="flex justify-between text-orange-400 font-bold">
                        <span>ETA:</span>
                        <span>~{unit.etaMins || 5} minutes</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedUnit(unit)}
                  disabled={!isAvailable}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5
                    ${isAvailable
                      ? 'bg-teal-500 hover:bg-teal-400 text-black shadow-md shadow-teal-500/20'
                      : 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5'}
                  `}
                >
                  <Send className="w-3.5 h-3.5" /> {isAvailable ? 'Dispatch Vehicle' : 'Currently Deployed'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Heat Stroke Triage Emergency Hotline Feed */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-red-400" />
            <h2 className="text-base font-bold text-white">Live Heat-Illness Triage Calls (108 Emergency Queue)</h2>
          </div>
          <span className="text-xs text-gray-400">Auto-prioritized by symptom severity</span>
        </div>

        <div className="space-y-3">
          {[
            { id: 't-1', name: 'Rameshwar Ji (68y)', phone: '+91 98290 33412', ward: 'JPR-W01', symptoms: 'Unconscious, core temp > 40.5°C, cessation of sweating (Heat Stroke)', level: 'Priority 1 (Red)', time: '4 mins ago' },
            { id: 't-2', name: 'Sunita Devi (45y)', phone: '+91 94140 55678', ward: 'JPR-W05', symptoms: 'Severe dizziness, vomiting, intense muscle cramps at construction site', level: 'Priority 2 (Orange)', time: '12 mins ago' },
            { id: 't-3', name: 'Abdul Karim (52y)', phone: '+91 97850 99876', ward: 'JPR-W02', symptoms: 'Dehydration, headache, low blood pressure', level: 'Priority 3 (Yellow)', time: '28 mins ago' }
          ].map(call => (
            <div key={call.id} className="p-4 rounded-xl bg-black/30 border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-white">{call.name}</span>
                  <span className="text-xs text-gray-500 font-mono">{call.phone}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase
                    ${call.level.includes('Red') ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      call.level.includes('Orange') ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                      'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}
                  `}>
                    {call.level}
                  </span>
                </div>
                <p className="text-xs text-gray-300">{call.symptoms}</p>
                <div className="text-[11px] text-teal-400 mt-1 font-mono">Location: {wards.find(w => w.wardId === call.ward)?.name || call.ward} · {call.time}</div>
              </div>

              <button
                onClick={() => handleSOSDispatch(call.name, call.ward)}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 font-bold text-white text-xs flex items-center gap-1.5 shadow-lg shadow-red-500/25 shrink-0"
              >
                <Ambulance className="w-3.5 h-3.5" /> Dispatch Nearest 108
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Dispatch Modal */}
      {selectedUnit && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0E131F] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-white mb-1">Dispatch Emergency Fleet Unit</h3>
            <p className="text-xs text-gray-400 mb-6">{selectedUnit.code} ({selectedUnit.type})</p>

            <form onSubmit={handleDispatch} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-bold uppercase tracking-wider mb-1.5 text-[10px]">Select Target Critical Ward</label>
                <select
                  value={targetWardId}
                  onChange={(e) => setTargetWardId(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-teal-500"
                >
                  {wards.map(w => (
                    <option key={w.wardId} value={w.wardId}>
                      {w.name} ({w.latestRisk?.riskTier} Risk - {w.latestRisk?.forecastTempC}°C)
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-lg bg-black/30 text-gray-400 text-[11px] space-y-1">
                <div>Base: <strong className="text-white">{selectedUnit.baseStation}</strong></div>
                <div>Crew: <strong className="text-white">{selectedUnit.crew}</strong></div>
                <div>Calculated ETA: <strong className="text-teal-400">~5 mins</strong></div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setSelectedUnit(null)}
                  className="px-4 py-2 rounded-lg text-gray-400 hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg shadow-red-500/25"
                >
                  Confirm Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default EmergencyPage;
