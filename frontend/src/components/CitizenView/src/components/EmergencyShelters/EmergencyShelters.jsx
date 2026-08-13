import React, { useState } from 'react';
import { HousePlus, Building2, Droplets } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const TYPE_ICON = { cooling_center: Building2, water_station: Droplets };
const TYPE_LABEL = { cooling_center: 'Cooling Center', water_station: 'Water Station' };

function EmergencyShelters() {
  const { resources, wards } = useApp();
  const [showAll, setShowAll] = useState(false);

  const list = showAll ? resources : resources.slice(0, 3);

  return (
    <div className="glass-panel p-5 font-sans">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <HousePlus className="w-4 h-4 text-teal-400" /> Emergency Shelters
          </h3>
          <p className="text-[11px] text-gray-500 mt-0.5">Nearest safe locations</p>
        </div>
        {resources.length > 3 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-[11px] font-bold text-teal-400 hover:text-teal-300 transition-colors"
          >
            {showAll ? 'Show Less' : 'View All'}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2.5">
        {list.length === 0 ? (
          <p className="text-xs text-gray-500 italic py-2">No shelter data available.</p>
        ) : (
          list.map((r) => {
            const Icon = TYPE_ICON[r.type] || Building2;
            const fillPct = Math.round((r.currentOccupancy / r.capacity) * 100);
            const wardName = wards.find(w => w.wardId === r.wardId)?.name;
            const isLimited = fillPct >= 85;
            return (
              <div key={r._id} className="flex items-center gap-3 p-3 rounded-lg bg-black/30 border border-white/5">
                <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-teal-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate">{r.name}</div>
                  <div className="text-[10px] text-gray-500 truncate">{r.address || wardName}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] text-gray-500">Capacity</div>
                  <div className="text-xs font-bold text-white tabular-data">{fillPct}%</div>
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full shrink-0
                  ${isLimited ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-teal-500/20 text-teal-400 border border-teal-500/30'}
                `}>
                  {isLimited ? 'Limited' : 'Open'}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default EmergencyShelters;
