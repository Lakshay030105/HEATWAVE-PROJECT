import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ThermometerSun, CloudRain, CheckCircle2, ArrowRight, Smartphone, PhoneCall, Radio } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const TIER_STYLE = {
  Extreme: { icon: ThermometerSun, color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', label: 'Extreme Heat Warning' },
  Severe: { icon: ThermometerSun, color: '#FB7A3C', bg: 'rgba(251,122,60,0.1)', border: 'rgba(251,122,60,0.25)', label: 'Severe Heat Advisory' },
  Moderate: { icon: CloudRain, color: '#FBBF24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)', label: 'Elevated Risk Notice' },
  Low: { icon: CheckCircle2, color: '#2DD4BF', bg: 'rgba(45,212,191,0.1)', border: 'rgba(45,212,191,0.25)', label: 'Status Update' },
};

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.max(1, Math.round(diffMs / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  return `${hrs}h ago`;
}

function LiveAlerts() {
  const { alerts, wards } = useApp();
  const navigate = useNavigate();
  const feed = [...alerts]
    .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
    .slice(0, 4);

  return (
    <div className="glass-panel p-5 font-sans flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <h3 className="text-sm font-bold text-white">Live Dispatched Alerts</h3>
          </div>
          {feed.length > 0 && (
            <span className="text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 rounded-full px-2 py-0.5">
              {feed.length} Active
            </span>
          )}
        </div>
        <p className="text-[11px] text-gray-400 mb-3">Real-time risk warnings dispatched to citizens & field units</p>

        {/* Alerts List */}
        <div className="flex flex-col gap-2">
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
                  className="flex items-center justify-between p-2.5 rounded-lg border transition-colors hover:border-white/20"
                  style={{ background: style.bg, borderColor: style.border }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${style.color}25` }}>
                      <Icon className="w-3.5 h-3.5" style={{ color: style.color }} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{style.label}</div>
                      <div className="text-[10px] text-gray-400 truncate">{wardName}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono">
                      {alert.channel === 'sms' && <Smartphone className="w-3 h-3 text-blue-400" />}
                      {alert.channel === 'voice' && <PhoneCall className="w-3 h-3 text-green-400" />}
                      {alert.channel === 'push' && <Radio className="w-3 h-3 text-purple-400" />}
                      <span>{timeAgo(alert.sentAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer link to Alerts hub */}
      <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
        <span className="text-[11px] text-gray-500 font-mono">Multilingual SMS/Voice active</span>
        <button
          onClick={() => navigate('/alerts')}
          className="flex items-center gap-1 text-xs font-bold text-teal-400 hover:text-teal-300 transition-colors"
        >
          <span>Broadcast Hub</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default LiveAlerts;
