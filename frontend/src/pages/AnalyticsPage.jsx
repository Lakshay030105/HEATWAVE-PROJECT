import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import {
  LineChart as LineChartIcon, BarChart2, Cpu, Download, RefreshCw,
  TrendingUp, Activity, ShieldCheck, CheckCircle2, AlertTriangle, ArrowUpDown
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  CartesianGrid, BarChart, Bar, Legend
} from 'recharts';

const TIER_COLORS = {
  Extreme: '#EF4444',
  Severe: '#FB7A3C',
  Moderate: '#FBBF24',
  Low: '#2DD4BF',
};

// 7-day historical + forecast multi-ward dataset
const SEVEN_DAY_DATA = [
  { day: 'Mon (08/07)', modikhana: 41, sanganer: 42, malviya: 38, mansarovar: 39 },
  { day: 'Tue (08/08)', modikhana: 43, sanganer: 44, malviya: 39, mansarovar: 40 },
  { day: 'Wed (08/09)', modikhana: 45, sanganer: 46, malviya: 41, mansarovar: 41 },
  { day: 'Thu (08/10)', modikhana: 46, sanganer: 47, malviya: 42, mansarovar: 41 },
  { day: 'Fri (08/11)', modikhana: 47, sanganer: 48, malviya: 43, mansarovar: 42 },
  { day: 'Sat (08/12)', modikhana: 46, sanganer: 47, malviya: 42, mansarovar: 41 },
  { day: 'Sun (08/13)', modikhana: 44, sanganer: 45, malviya: 40, mansarovar: 40 },
];

function AnalyticsPage() {
  const { wards, triggerMLRecompute } = useApp();
  const { showToast } = useToast();
  const [recomputing, setRecomputing] = useState(false);
  const [sortField, setSortField] = useState('hvi');
  const [sortOrder, setSortOrder] = useState('desc');

  const handleRecompute = async () => {
    setRecomputing(true);
    showToast('Running HVI & Risk Fusion pipeline across all Jaipur ward nodes...', 'info');
    await triggerMLRecompute();
    setTimeout(() => {
      setRecomputing(false);
      showToast('ML Models successfully refreshed with latest satellite LST & census weights', 'success');
    }, 1500);
  };

  // Prepare chart dataset for ward vulnerability vs temp
  const wardComparisonData = useMemo(() => {
    return wards.map(w => ({
      name: w.name.split(' ')[0],
      fullName: w.name,
      hvi: w.latestRisk?.hvi || 50,
      temp: w.latestRisk?.forecastTempC || 40,
      elderly: Math.round((w.pctElderly || 0.1) * 100),
      outdoor: Math.round((w.pctOutdoorWorkers || 0.2) * 100),
      greenCover: Math.round((w.greenCoverPct || 0.1) * 100),
      tier: w.latestRisk?.riskTier || 'Low'
    }));
  }, [wards]);

  // Sorted wards for the table
  const sortedWards = useMemo(() => {
    return [...wards].sort((a, b) => {
      let valA, valB;
      if (sortField === 'hvi') {
        valA = a.latestRisk?.hvi || 0;
        valB = b.latestRisk?.hvi || 0;
      } else if (sortField === 'temp') {
        valA = a.latestRisk?.forecastTempC || 0;
        valB = b.latestRisk?.forecastTempC || 0;
      } else if (sortField === 'pop') {
        valA = a.population || 0;
        valB = b.population || 0;
      } else {
        valA = a.vulnerabilityScore || 0;
        valB = b.vulnerabilityScore || 0;
      }
      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });
  }, [wards, sortField, sortOrder]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Ward ID,Ward Name,Risk Tier,HVI Score,Forecast Temp (°C),Elderly (%),Outdoor Workers (%),Green Cover (%),Population\n'];
    const rows = wards.map(w =>
      `"${w.wardId}","${w.name}","${w.latestRisk?.riskTier || 'Low'}",${w.latestRisk?.hvi || 0},${w.latestRisk?.forecastTempC || 0},${Math.round((w.pctElderly || 0) * 100)},${Math.round((w.pctOutdoorWorkers || 0) * 100)},${Math.round((w.greenCoverPct || 0) * 100)},${w.population || 0}`
    );
    const blob = new Blob([headers.concat(rows).join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `jaipur_heatwave_risk_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported complete ward risk dataset to CSV', 'success');
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-5 md:gap-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-wider mb-1">
            <Cpu className="w-4 h-4" /> AI & Data Science Transparency Hub
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Heat Vulnerability Index (HVI) & ML Analytics
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Explainable demographic + satellite thermal fusion engine for municipal disaster planning
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-teal-400" /> Export CSV Report
          </button>
          <button
            onClick={handleRecompute}
            disabled={recomputing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/25 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${recomputing ? 'animate-spin' : ''}`} />
            {recomputing ? 'Recomputing...' : 'Recompute ML Pipeline'}
          </button>
        </div>
      </div>

      {/* Model Architecture & Weights Showcase */}
      <div className="glass-panel p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <div className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">Explainable Formula</div>
            <h2 className="text-lg font-bold text-white">How the AI Computes Ward Heat Risk</h2>
            <p className="text-xs text-gray-400 mt-1">
              Unlike generic weather apps, our system gives a <strong>60% weighting to urban vulnerability</strong> and 40% to meteorological forecast.
            </p>
          </div>

          <div className="px-4 py-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs font-mono text-purple-200">
            HVI = 0.35 × LST + 0.25 × Elderly + 0.25 × OutdoorWorkers + 0.15 × (1 - GreenCover)
          </div>
        </div>

        {/* 4 Weights Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-black/30 border border-red-500/20">
            <div className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1">Satellite Weight (35%)</div>
            <div className="text-xl font-bold text-white">Land Surface Temp</div>
            <p className="text-[11px] text-gray-400 mt-1">Derived from Landsat 8/9 & GEE thermal infrared sensors</p>
          </div>

          <div className="p-4 rounded-xl bg-black/30 border border-orange-500/20">
            <div className="text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-1">Census Weight (25%)</div>
            <div className="text-xl font-bold text-white">Elderly Population</div>
            <p className="text-[11px] text-gray-400 mt-1">Demographics aged 65+ with highest physiological vulnerability</p>
          </div>

          <div className="p-4 rounded-xl bg-black/30 border border-yellow-500/20">
            <div className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider mb-1">Labor Weight (25%)</div>
            <div className="text-xl font-bold text-white">Outdoor Labor Force</div>
            <p className="text-[11px] text-gray-400 mt-1">Construction, street vendors, delivery, and gig workers</p>
          </div>

          <div className="p-4 rounded-xl bg-black/30 border border-teal-500/20">
            <div className="text-[10px] font-bold text-teal-400 uppercase tracking-wider mb-1">Urban Heat Island (15%)</div>
            <div className="text-xl font-bold text-white">Vegetation Deficit</div>
            <p className="text-[11px] text-gray-400 mt-1">NDVI canopy loss causing local concrete micro-climate spikes</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 7-Day Temperature Trajectory Area Chart */}
        <div className="glass-panel p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-400" /> 7-Day Temperature Trajectory (°C)
              </h3>
              <p className="text-xs text-gray-400">Multi-ward comparative heatwave progression</p>
            </div>
            <span className="text-xs text-gray-500 font-mono">Jaipur Region</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SEVEN_DAY_DATA}>
                <defs>
                  <linearGradient id="gradModikhana" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gradSanganer" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FB7A3C" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#FB7A3C" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis domain={[34, 50]} stroke="#64748b" fontSize={10} tickLine={false} unit="°C" />
                <Tooltip
                  contentStyle={{ background: '#0B0E14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="sanganer" name="Sanganer (Industrial)" stroke="#FB7A3C" strokeWidth={2} fill="url(#gradSanganer)" />
                <Area type="monotone" dataKey="modikhana" name="Chowkri Modikhana (Old City)" stroke="#EF4444" strokeWidth={2} fill="url(#gradModikhana)" />
                <Area type="monotone" dataKey="malviya" name="Malviya Nagar" stroke="#2DD4BF" strokeWidth={2} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* HVI vs Temperature Comparative Bar Chart */}
        <div className="glass-panel p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-teal-400" /> Ward HVI Score vs Forecast Temp
              </h3>
              <p className="text-xs text-gray-400">Comparing vulnerability index against raw ambient heat</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wardComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0B0E14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="hvi" name="HVI Score (0-100)" fill="#2DD4BF" radius={[4, 4, 0, 0]} />
                <Bar dataKey="temp" name="Forecast Temp (°C)" fill="#FB7A3C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Ward Ranking & Demographics Data Table */}
      <div className="glass-panel p-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-400" /> Comprehensive Ward Vulnerability Matrix
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Click column headers to sort by HVI, Temperature, or Population</p>
          </div>
        </div>

        <div className="overflow-x-auto -mx-4 md:mx-0">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead>
              <tr className="text-gray-400 border-b border-white/10 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Ward Name</th>
                <th className="py-3 px-4">Risk Tier</th>
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => toggleSort('hvi')}>
                  <div className="flex items-center gap-1">HVI Score <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => toggleSort('temp')}>
                  <div className="flex items-center gap-1">Forecast Temp <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="py-3 px-4">Elderly (65+)</th>
                <th className="py-3 px-4">Outdoor Labor</th>
                <th className="py-3 px-4">Green Cover</th>
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => toggleSort('pop')}>
                  <div className="flex items-center gap-1">Population <ArrowUpDown className="w-3 h-3" /></div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {sortedWards.map(w => {
                const tierColor = TIER_COLORS[w.latestRisk?.riskTier || 'Low'];
                return (
                  <tr key={w.wardId} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">
                      <div>{w.name}</div>
                      <div className="text-[10px] text-gray-500 font-mono">{w.wardId}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block"
                        style={{ background: `${tierColor}20`, color: tierColor, border: `1px solid ${tierColor}40` }}
                      >
                        {w.latestRisk?.riskTier || 'Low'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 tabular-data font-bold text-teal-300">
                      {w.latestRisk?.hvi || 0}/100
                    </td>
                    <td className="py-3.5 px-4 tabular-data font-bold text-white">
                      {w.latestRisk?.forecastTempC || 0}°C
                    </td>
                    <td className="py-3.5 px-4 tabular-data text-gray-300">
                      {Math.round((w.pctElderly || 0) * 100)}%
                    </td>
                    <td className="py-3.5 px-4 tabular-data text-gray-300">
                      {Math.round((w.pctOutdoorWorkers || 0) * 100)}%
                    </td>
                    <td className="py-3.5 px-4 tabular-data text-gray-300">
                      {Math.round((w.greenCoverPct || 0) * 100)}%
                    </td>
                    <td className="py-3.5 px-4 tabular-data text-gray-400">
                      {(w.population || 0).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default AnalyticsPage;
