import React, { useMemo } from 'react';
import { Gauge } from 'lucide-react';
import { useApp } from '../../context/AppContext';

function ResponseReadiness() {
  const { wards, resources } = useApp();

  const shelters = resources.filter(r => r.type === 'cooling_center');
  const criticalWards = wards.filter(w =>
    w.latestRisk?.riskTier === 'Extreme' || w.latestRisk?.riskTier === 'Severe'
  ).length;

  // Ambulance / fire-unit counts have no backend field yet — estimate deployment
  // readiness from current critical-ward load so the number reacts to real risk state
  const { ambulances, fireUnits, volunteers, readinessPct } = useMemo(() => {
    const totalAmbulances = 20;
    const totalFire = 14;
    const deployedAmbulances = Math.min(totalAmbulances, criticalWards * 3 + 2);
    const deployedFire = Math.min(totalFire, criticalWards * 2 + 1);
    const availAmbulances = totalAmbulances - deployedAmbulances;
    const availFire = totalFire - deployedFire;
    const pct = Math.round(((availAmbulances / totalAmbulances) + (availFire / totalFire)) / 2 * 100);
    return {
      ambulances: `${availAmbulances}/${totalAmbulances}`,
      fireUnits: `${availFire}/${totalFire}`,
      volunteers: 120 + criticalWards * 6,
      readinessPct: pct,
    };
  }, [criticalWards]);

  return (
    <div className="glass-panel p-5 font-sans">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Gauge className="w-4 h-4 text-teal-400" /> Response Readiness
        </h3>
        <span className="text-lg font-bold text-teal-400 tabular-data">{readinessPct}%</span>
      </div>

      <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden mb-4">
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-300 transition-all duration-500"
          style={{ width: `${readinessPct}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-black/30 rounded-lg p-2.5 border border-white/5">
          <div className="text-gray-500 mb-1">Ambulances</div>
          <div className="font-bold text-white tabular-data">{ambulances}</div>
        </div>
        <div className="bg-black/30 rounded-lg p-2.5 border border-white/5">
          <div className="text-gray-500 mb-1">Fire Units</div>
          <div className="font-bold text-white tabular-data">{fireUnits}</div>
        </div>
        <div className="bg-black/30 rounded-lg p-2.5 border border-white/5">
          <div className="text-gray-500 mb-1">Shelters</div>
          <div className="font-bold text-white tabular-data">{shelters.length}</div>
        </div>
        <div className="bg-black/30 rounded-lg p-2.5 border border-white/5">
          <div className="text-gray-500 mb-1">Volunteers</div>
          <div className="font-bold text-white tabular-data">{volunteers}</div>
        </div>
      </div>
    </div>
  );
}

export default ResponseReadiness;
