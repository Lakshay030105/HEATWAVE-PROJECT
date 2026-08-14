import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gauge, Ambulance, Truck, Building2, Users, ArrowRight, Activity, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

function ResponseReadiness() {
  const { wards, resources, emergencyUnits } = useApp();
  const navigate = useNavigate();

  // Aggregate real-time fleet numbers from emergencyUnits
  const ambulances = emergencyUnits.filter(u => u.type === 'ambulance');
  const tankers = emergencyUnits.filter(u => u.type === 'water_tanker');
  const clinics = emergencyUnits.filter(u => u.type === 'mobile_clinic');

  const availAmb = ambulances.filter(u => u.status === 'available').length;
  const deployedAmb = ambulances.length - availAmb;

  const availTankers = tankers.filter(u => u.status === 'available').length;
  const deployedTankers = tankers.length - availTankers;

  // Shelters
  const shelters = resources.filter(r => r.type === 'cooling_center');
  const openShelters = shelters.filter(r => r.status === 'open' || r.status === 'limited');

  // Wards with active Extreme / Severe risk load
  const criticalWards = wards.filter(w =>
    w.latestRisk?.riskTier === 'Extreme' || w.latestRisk?.riskTier === 'Severe'
  ).length;

  // Dynamic Readiness Metric Calculation
  const { readinessPct, statusLabel, statusColor } = useMemo(() => {
    const ambRatio = ambulances.length > 0 ? availAmb / ambulances.length : 0.7;
    const tankerRatio = tankers.length > 0 ? availTankers / tankers.length : 0.7;
    const shelterRatio = shelters.length > 0 ? openShelters.length / shelters.length : 0.9;

    const score = Math.round((ambRatio * 0.45 + tankerRatio * 0.35 + shelterRatio * 0.20) * 100);
    const boundedScore = Math.max(10, Math.min(100, score));

    let label = 'Optimal Buffer';
    let color = '#2DD4BF';

    if (boundedScore < 40) {
      label = 'Critical Depletion';
      color = '#EF4444';
    } else if (boundedScore < 70) {
      label = 'Heavy Load';
      color = '#FB7A3C';
    }

    return { readinessPct: boundedScore, statusLabel: label, statusColor: color };
  }, [ambulances.length, availAmb, tankers.length, availTankers, shelters.length, openShelters.length]);

  return (
    <div className="glass-panel p-5 font-sans flex flex-col justify-between h-full">
      
      {/* Top Header & Readiness Score */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-bold text-white">Emergency Response Readiness</h3>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{ background: `${statusColor}20`, color: statusColor, border: `1px solid ${statusColor}40` }}
            >
              {statusLabel}
            </span>
            <span className="text-base font-bold tabular-data" style={{ color: statusColor }}>
              {readinessPct}%
            </span>
          </div>
        </div>

        <p className="text-[11px] text-gray-400 mb-3">
          Real-time reserve buffer capacity across deployed emergency units & cooling shelters
        </p>

        {/* Global Progress Bar */}
        <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden mb-4">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${readinessPct}%`,
              background: `linear-gradient(90deg, #2DD4BF, ${statusColor})`
            }}
          />
        </div>
      </div>

      {/* Middle Section: Real-Time Telemetry Bars (Fills empty space beautifully) */}
      <div className="space-y-2.5 my-2">
        
        {/* Ambulance Telemetry */}
        <div className="bg-black/40 p-2.5 rounded-lg border border-white/5">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-300 flex items-center gap-1.5 font-medium">
              <Ambulance className="w-3.5 h-3.5 text-red-400" /> 108 Ambulance Fleet
            </span>
            <span className="text-[10px] font-bold text-teal-300">
              {availAmb} Standby · <span className="text-orange-400">{deployedAmb} Deployed</span>
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden flex">
            <div className="bg-teal-400 h-full" style={{ width: `${(availAmb / Math.max(1, ambulances.length)) * 100}%` }} />
            <div className="bg-orange-500 h-full" style={{ width: `${(deployedAmb / Math.max(1, ambulances.length)) * 100}%` }} />
          </div>
        </div>

        {/* Water Tankers Telemetry */}
        <div className="bg-black/40 p-2.5 rounded-lg border border-white/5">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-300 flex items-center gap-1.5 font-medium">
              <Truck className="w-3.5 h-3.5 text-blue-400" /> PHED Water Tankers
            </span>
            <span className="text-[10px] font-bold text-teal-300">
              {availTankers} Standby · <span className="text-blue-400">{deployedTankers} Active</span>
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden flex">
            <div className="bg-teal-400 h-full" style={{ width: `${(availTankers / Math.max(1, tankers.length)) * 100}%` }} />
            <div className="bg-blue-500 h-full" style={{ width: `${(deployedTankers / Math.max(1, tankers.length)) * 100}%` }} />
          </div>
        </div>

        {/* Shelters Telemetry */}
        <div className="bg-black/40 p-2.5 rounded-lg border border-white/5">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-300 flex items-center gap-1.5 font-medium">
              <Building2 className="w-3.5 h-3.5 text-teal-400" /> Cooling Relief Shelters
            </span>
            <span className="text-[10px] font-bold text-teal-300">
              {openShelters.length}/{shelters.length} Operational
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="bg-teal-400 h-full rounded-full" style={{ width: `${(openShelters.length / Math.max(1, shelters.length)) * 100}%` }} />
          </div>
        </div>

      </div>

      {/* Bottom Grid & Quick Action */}
      <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
        <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
          <span>Active emergency coverage for <strong>10 Jaipur Wards</strong></span>
        </div>

        <button
          onClick={() => navigate('/emergency')}
          className="flex items-center gap-1 text-xs font-bold text-teal-400 hover:text-teal-300 transition-colors"
        >
          <span>Fleet Hub</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}

export default ResponseReadiness;
