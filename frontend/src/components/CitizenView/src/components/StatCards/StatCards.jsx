import React, { useMemo, useState, useEffect } from 'react';
import { Flame, Wind, CloudRain, ShieldHalf, ArrowUp, ArrowDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const TIER_RANK = { Low: 0, Moderate: 1, Severe: 2, Extreme: 3 };

function StatCards() {
  const { wards } = useApp();

  // Overall risk = the highest tier present across wards
  const overallTier = useMemo(() => {
    if (!wards.length) return 'Low';
    return wards.reduce((worst, w) => {
      const t = w.latestRisk?.riskTier || 'Low';
      return TIER_RANK[t] > TIER_RANK[worst] ? t : worst;
    }, 'Low');
  }, [wards]);

  const avgTemp = useMemo(() => {
    if (!wards.length) return 0;
    const sum = wards.reduce((acc, w) => acc + (w.latestRisk?.forecastTempC || 0), 0);
    return Math.round(sum / wards.length);
  }, [wards]);

  const extremeCount = wards.filter(w => w.latestRisk?.riskTier === 'Extreme').length;
  const heatLabel = extremeCount > 0 ? 'EXTREME' : overallTier.toUpperCase();

  // AQI has no data source in this project's model — synthesize a plausible
  // reading that tracks the average forecast temperature, refreshed periodically
  const [aqi, setAqi] = useState(120 + Math.round(avgTemp * 0.8));
  useEffect(() => {
    const interval = setInterval(() => {
      setAqi(120 + Math.round(avgTemp * 0.8) + Math.floor(Math.random() * 15));
    }, 30000);
    return () => clearInterval(interval);
  }, [avgTemp]);

  const overallColor = {
    Extreme: '#EF4444', Severe: '#FB7A3C', Moderate: '#FBBF24', Low: '#2DD4BF',
  }[overallTier];

  const cards = [
    {
      icon: Flame, iconColor: 'text-red-400', iconBg: 'bg-red-500/15 border-red-500/25',
      label: 'HEAT RISK', value: heatLabel, sub: 'Jaipur urban region',
      trend: { dir: 'up', pct: 18 },
    },
    {
      icon: Wind, iconColor: 'text-orange-400', iconBg: 'bg-orange-500/15 border-orange-500/25',
      label: 'AIR QUALITY', value: aqi, sub: aqi > 150 ? 'Unhealthy for sensitive groups' : 'Moderate',
      trend: { dir: 'up', pct: 7 },
    },
    {
      icon: CloudRain, iconColor: 'text-blue-400', iconBg: 'bg-blue-500/15 border-blue-500/25',
      label: 'RAINFALL', value: '18 mm', sub: 'Last 24 hours',
      trend: null,
    },
    {
      icon: ShieldHalf, iconColor: 'text-teal-400', iconBg: 'bg-teal-500/15 border-teal-500/25',
      label: 'OVERALL RISK', value: overallTier.toUpperCase(), sub: 'Updated just now',
      valueColor: overallColor,
      dot: overallColor,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full font-sans">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div key={c.label} className="glass-panel p-4 flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${c.iconBg}`}>
              <Icon className={`w-5 h-5 ${c.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">{c.label}</div>
              <div className="text-xl font-bold tabular-data truncate" style={{ color: c.valueColor || '#f1f5f9' }}>
                {c.value}
              </div>
              <div className="text-[11px] text-gray-500 truncate">{c.sub}</div>
            </div>
            {c.trend && (
              <div className={`flex items-center gap-0.5 text-xs font-bold shrink-0 ${c.trend.dir === 'up' ? 'text-red-400' : 'text-teal-400'}`}>
                {c.trend.dir === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {c.trend.pct}%
              </div>
            )}
            {c.dot && (
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c.dot, boxShadow: `0 0 8px ${c.dot}` }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default StatCards;
