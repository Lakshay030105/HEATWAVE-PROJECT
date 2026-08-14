import React from 'react';
import { Zap, ThermometerSun, CloudRain, Construction, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const TIER_STYLE = {
  Extreme: { icon: ThermometerSun, color: '#EF4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)', label: 'Extreme Heat Warning' },
  Severe: { icon: ThermometerSun, color: '#FB7A3C', bg: 'rgba(251,122,60,0.12)', border: 'rgba(251,122,60,0.25)', label: 'Severe Heat Advisory' },
  Moderate: { icon: CloudRain, color: '#FBBF24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.25)', label: 'Elevated Risk Notice' },
  Low: { icon: CheckCircle2, color: '#2DD4BF', bg: 'rgba(45,212,191,0.12)', border: 'rgba(45,212,191,0.25)', label: 'Status Update' },
};

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.max(1, Math.round(diffMs / 60000));
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  return `${hrs} hr ago`;
}

function LiveAlerts() {
  const { alerts, wards } = useApp();
  const feed = [...alerts]
    .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
    .slice(0, 5);

  return (
    <div className="glass-panel p-5 font-sans flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" /> Live Alerts
          </h3>
          <p className="text-[11px] text-gray-500 mt-0.5">Real-time risk notifications</p>
        </div>
        {feed.length > 0 && (
          <span className="text-[10px] font-bold bg-red-500 text-white rounded-full px-2 py-0.5">
            {feed.length}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2.5 overflow-y-auto flex-1">
        {feed.length === 0 ? (
          <p className="text-xs text-gray-500 italic py-4 text-center">No active alerts.</p>
        ) : (
          feed.map((alert, i) => {
            const style = TIER_STYLE[alert.tier] || TIER_STYLE.Low;
            const Icon = style.icon;
            const wardName = wards.find(w => w.wardId === alert.wardId)?.name || alert.wardId;
            return (
              <div
                key={alert._id || i}
                className="flex items-start gap-3 p-3 rounded-lg border"
                style={{ background: style.bg, borderColor: style.border }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${style.color}25` }}>
                  <Icon className="w-4 h-4" style={{ color: style.color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white">{style.label}</div>
                  <div className="text-[11px] text-gray-400 truncate">{wardName}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{timeAgo(alert.sentAt)}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default LiveAlerts;
