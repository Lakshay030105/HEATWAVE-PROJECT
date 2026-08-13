import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useApp } from '../../context/AppContext';
import { ThermometerSun, Building2, BellRing } from 'lucide-react';

const TIER_COLORS = { Low: '#2DD4BF', Moderate: '#FBBF24', Severe: '#FB7A3C', Extreme: '#EF4444' };

function Dashboard() {
  const { wards, alerts, resources } = useApp();

  // ---- Cooling Center Capacity Chart Data ----
  const coolingCenters = resources.filter(r => r.type === 'cooling_center');
  const coolingData = coolingCenters.map(c => ({
    name: c.name.length > 18 ? c.name.slice(0, 18) + '…' : c.name,
    fullName: c.name,
    capacity: c.capacity,
    occupied: c.currentOccupancy,
    fillPct: Math.round((c.currentOccupancy / c.capacity) * 100),
  }));

  // ---- Temperature by Ward Chart Data ----
  const tempData = wards.map(w => ({
    name: w.name,
    temp: w.latestRisk?.forecastTempC || 0,
    hvi: w.latestRisk?.hvi || 0,
    tier: w.latestRisk?.riskTier || 'Low',
  }));

  // ---- Recent Alerts Table ----
  const recentAlerts = alerts.slice(0, 8);

  // ---- Ward Risk Summary ----
  const riskSummary = {
    Extreme: wards.filter(w => w.latestRisk?.riskTier === 'Extreme').length,
    Severe: wards.filter(w => w.latestRisk?.riskTier === 'Severe').length,
    Moderate: wards.filter(w => w.latestRisk?.riskTier === 'Moderate').length,
    Low: wards.filter(w => w.latestRisk?.riskTier === 'Low').length,
  };

  const tooltipStyle = {
    contentStyle: { background: 'rgba(11, 14, 20, 0.95)', border: '1px solid var(--color-border)', borderRadius: '8px', color: '#f1f5f9', fontSize: '0.75rem', backdropFilter: 'blur(8px)' },
    labelStyle: { color: '#94a3b8', marginBottom: '4px' },
    itemStyle: { fontSize: '0.875rem', fontWeight: 600 }
  };

  return (
    <div className="w-full flex flex-col gap-8">
      
      {/* Risk Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {Object.entries(riskSummary).map(([tier, count]) => (
          <div key={tier} className="glass-panel text-center py-4 px-4 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold tabular-data drop-shadow-md" style={{ color: TIER_COLORS[tier] }}>{count}</div>
            <div className="text-xs mt-1 font-semibold uppercase tracking-wider text-gray-400">{tier} Risk Wards</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        
        {/* Cooling Center Capacity */}
        <div className="glass-panel p-6 w-full">
          <div className="flex items-center gap-2 mb-4 text-white font-bold">
            <Building2 className="w-5 h-5 text-teal-400" />
            <h3>Cooling Center Capacity</h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={coolingData} margin={{ top: 15, right: 20, bottom: 65, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#94a3b8', fontSize: 11 }} 
                angle={-45} 
                textAnchor="end" 
                height={65} 
                interval={0}
                axisLine={false} 
                tickLine={false} 
              />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar dataKey="capacity" fill="rgba(255,255,255,0.1)" name="Capacity" radius={[4,4,0,0]} barSize={24} />
              <Bar dataKey="occupied" name="Occupied" radius={[4,4,0,0]} barSize={24}>
                {coolingData.map((entry, i) => (
                  <Cell key={i} fill={entry.fillPct > 80 ? '#EF4444' : entry.fillPct > 50 ? '#FBBF24' : '#2DD4BF'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Temperature Trend by Ward */}
        <div className="glass-panel p-6 w-full">
          <div className="flex items-center gap-2 mb-4 text-white font-bold">
            <ThermometerSun className="w-5 h-5 text-orange-400" />
            <h3>Forecast Temperatures by Ward</h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={tempData} margin={{ top: 15, right: 20, bottom: 65, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#94a3b8', fontSize: 11 }} 
                angle={-45} 
                textAnchor="end" 
                height={65} 
                interval={0}
                axisLine={false} 
                tickLine={false} 
              />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[35, 50]} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar dataKey="temp" name="Forecast °C" radius={[4,4,0,0]} barSize={24}>
                {tempData.map((entry, i) => (
                  <Cell key={i} fill={TIER_COLORS[entry.tier]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Alerts Table */}
      <div className="glass-panel p-6 w-full">
        <div className="flex items-center gap-2 mb-4 text-white font-bold">
          <BellRing className="w-5 h-5 text-red-400" />
          <h3>Recent Dispatches & Alerts</h3>
        </div>
        {recentAlerts.length === 0 ? (
          <p className="text-xs text-gray-400 italic">No alerts dispatched yet.</p>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="py-3 px-4 text-gray-400 font-medium uppercase tracking-wider">Ward</th>
                  <th className="py-3 px-4 text-gray-400 font-medium uppercase tracking-wider">Tier</th>
                  <th className="py-3 px-4 text-gray-400 font-medium uppercase tracking-wider">Channel</th>
                  <th className="py-3 px-4 text-gray-400 font-medium uppercase tracking-wider">Time</th>
                  <th className="py-3 px-4 text-gray-400 font-medium uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentAlerts.map((alert, i) => {
                  const wardName = wards.find(w => w.wardId === alert.wardId)?.name || alert.wardId;
                  return (
                    <tr key={alert._id || i} className="border-b border-[var(--color-border)]/50 last:border-0 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-medium text-gray-200">{wardName}</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider" style={{ background: `${TIER_COLORS[alert.tier]}25`, color: TIER_COLORS[alert.tier] }}>
                          {alert.tier}
                        </span>
                      </td>
                      <td className="py-3 px-4 uppercase text-gray-400 font-mono tracking-wider">{alert.channel}</td>
                      <td className="py-3 px-4 text-gray-400 tabular-data">{new Date(alert.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1.5 justify-end">
                          <span className={`w-2 h-2 rounded-full ${alert.status === 'sent' ? 'bg-teal-500' : 'bg-red-500'}`} />
                          <span className="text-gray-300 capitalize">{alert.status}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
