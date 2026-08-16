import React, { useMemo } from 'react';
import { Flame, Users, HousePlus, Radio, ArrowUp, ArrowDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const TIER_RANK = { Low: 0, Moderate: 1, Severe: 2, Extreme: 3 };

function StatCards() {
  const { wards, resources, alerts } = useApp();

  // Overall risk = the highest tier present across wards
  const overallTier = useMemo(() => {
    if (!wards.length) return 'Low';
    return wards.reduce((worst, w) => {
      const t = w.latestRisk?.riskTier || 'Low';
      return TIER_RANK[t] > TIER_RANK[worst] ? t : worst;
    }, 'Low');
  }, [wards]);

  // Peak temperature & ward
  const { maxTemp, maxHvi, peakWard } = useMemo(() => {
    if (!wards.length) return { maxTemp: 40, maxHvi: 50, peakWard: null };
    let maxT = -Infinity;
    let maxH = -Infinity;
    let pWard = wards[0];

    wards.forEach(w => {
      const t = w.latestRisk?.forecastTempC || 0;
      const h = w.latestRisk?.hvi || 0;
      if (t > maxT) {
        maxT = t;
        pWard = w;
      }
      if (h > maxH) maxH = h;
    });

    return { maxTemp: maxT, maxHvi: maxH, peakWard: pWard };
  }, [wards]);

  // Total and critical population
  const { totalPop, criticalPop } = useMemo(() => {
    const total = wards.reduce((sum, w) => sum + (w.population || 0), 0);
    const critical = wards
      .filter(w => w.latestRisk?.riskTier === 'Extreme' || w.latestRisk?.riskTier === 'Severe')
      .reduce((sum, w) => sum + (w.population || 0), 0);
    return { totalPop: total, criticalPop: critical };
  }, [wards]);

  // Shelter metrics
  const { totalCapacity, totalOccupancy, openSheltersCount, fillPct } = useMemo(() => {
    const cap = resources.reduce((sum, r) => sum + (r.capacity || 0), 0);
    const occ = resources.reduce((sum, r) => sum + (r.currentOccupancy || 0), 0);
    const openCount = resources.filter(r => r.status === 'open').length;
    const pct = cap > 0 ? Math.round((occ / cap) * 100) : 0;
    return { totalCapacity: cap, totalOccupancy: occ, openSheltersCount: openCount, fillPct: pct };
  }, [resources]);

  // Alert reach metrics
  const totalCitizensReached = useMemo(() => {
    if (!alerts.length) return 0;
    return alerts.reduce((sum, a) => sum + (a.recipientCount || 10000), 0);
  }, [alerts]);

  const overallColor = {
    Extreme: '#EF4444', Severe: '#FB7A3C', Moderate: '#FBBF24', Low: '#2DD4BF',
  }[overallTier] || '#2DD4BF';

  const cards = [
    {
      icon: Flame,
      iconColor: 'text-red-400',
      iconBg: 'bg-red-500/15 border-red-500/25',
      label: 'PEAK HEAT LEVEL',
      value: `${maxTemp}°C`,
      sub: `${peakWard?.name || 'Jaipur'} (HVI ${maxHvi})`,
      valueColor: overallColor,
      badge: `${overallTier.toUpperCase()} RISK`,
      badgeColor: overallColor,
    },
    {
      icon: Users,
      iconColor: 'text-teal-400',
      iconBg: 'bg-teal-500/15 border-teal-500/25',
      label: 'POPULATION MONITORED',
      value: totalPop ? totalPop.toLocaleString() : '316,000',
      sub: `${criticalPop.toLocaleString()} in high-risk zones`,
      badge: `${wards.length} Wards Active`,
      badgeColor: '#2DD4BF',
    },
    {
      icon: HousePlus,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/15 border-blue-500/25',
      label: 'SHELTER CAPACITY',
      value: `${totalOccupancy.toLocaleString()} / ${totalCapacity.toLocaleString()}`,
      sub: `${openSheltersCount} Facilities Operational`,
      badge: `${fillPct}% Occupied`,
      badgeColor: fillPct > 80 ? '#FB7A3C' : '#60A5FA',
    },
    {
      icon: Radio,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/15 border-purple-500/25',
      label: 'CITIZEN BROADCASTS',
      value: totalCitizensReached ? totalCitizensReached.toLocaleString() : `${alerts.length} Sent`,
      sub: `${alerts.length} Emergency Alerts Logged`,
      badge: '● Live Engine',
      badgeColor: '#A855F7',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 w-full font-sans">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div key={c.label} className="glass-panel p-3 md:p-4 flex items-center gap-2.5 md:gap-3.5 hover:border-white/20 transition-all">
            <div className={`w-9 h-9 md:w-11 md:h-11 rounded-xl border flex items-center justify-center shrink-0 ${c.iconBg}`}>
              <Icon className={`w-4 h-4 md:w-5 md:h-5 ${c.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">{c.label}</div>
              <div className="text-lg md:text-xl font-bold tabular-data truncate" style={{ color: c.valueColor || '#f1f5f9' }}>
                {c.value}
              </div>
              <div className="text-[11px] text-gray-400 truncate">{c.sub}</div>
            </div>
            {c.badge && (
              <span
                className="text-[9px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 rounded-full border uppercase tracking-wider shrink-0 hidden sm:block"
                style={{
                  color: c.badgeColor,
                  borderColor: `${c.badgeColor}40`,
                  background: `${c.badgeColor}15`
                }}
              >
                {c.badge}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default StatCards;

