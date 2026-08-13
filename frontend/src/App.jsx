import React, { useState } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import AuthorityDashboard from './pages/AuthorityDashboard';
import CitizenPage from './pages/CitizenPage';
import RiskMapPage from './pages/RiskMapPage';
import AlertsPage from './pages/AlertsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SheltersPage from './pages/SheltersPage';
import EmergencyPage from './pages/EmergencyPage';
import CitizenReportsPage from './pages/CitizenReportsPage';
import Sidebar from './components/Sidebar/Sidebar';
import { useApp } from './context/AppContext';
import AarogyaBrand from './components/Logo/Logo';
import { ShieldAlert, Menu } from 'lucide-react';

function App() {
  const { loading, wards } = useApp();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Aggregate stats for status strip
  const riskCounts = wards.reduce((acc, ward) => {
    const tier = ward.latestRisk?.riskTier;
    if (tier) acc[tier] = (acc[tier] || 0) + 1;
    return acc;
  }, {});

  const totalWards = wards.length;
  const isCitizenView = location.pathname === '/citizen';

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#0B0E14] text-slate-100">
      
      {/* Sidebar (hamburger-triggered, sits alongside the top navbar) */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Navigation Bar (Fixed 64px height, vertically centered, no clipping) */}
      <header className="w-full h-16 px-8 flex items-center justify-between border-b border-white/10 bg-[#0B0E14] sticky top-0 z-50">
        
        {/* Hamburger + Logo & Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors -ml-1"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <AarogyaBrand />
        </div>
        
        {/* Segmented Pill Toggle Navigation */}
        <nav className="flex items-center gap-2 p-1 rounded-full bg-white/5 border border-white/10 shrink-0">
          <NavLink
            to="/"
            end
            className={({ isActive }) => 
              `px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                isActive 
                  ? 'bg-[#2DD4BF] text-black shadow-md shadow-teal-500/20' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            Authority Dashboard
          </NavLink>
          <NavLink
            to="/map"
            className={({ isActive }) => 
              `px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                isActive 
                  ? 'bg-[#2DD4BF] text-black shadow-md shadow-teal-500/20' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            Risk Map
          </NavLink>
          <NavLink
            to="/alerts"
            className={({ isActive }) => 
              `px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                isActive 
                  ? 'bg-[#2DD4BF] text-black shadow-md shadow-teal-500/20' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            Alerts
          </NavLink>
          <NavLink
            to="/citizen"
            className={({ isActive }) => 
              `px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                isActive 
                  ? 'bg-[#2DD4BF] text-black shadow-md shadow-teal-500/20' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            Citizen View
          </NavLink>
        </nav>
      </header>

      {/* Live Status Strip */}
      {!loading && wards.length > 0 && !isCitizenView && (
        <div className="w-full px-8 py-2.5 bg-white/[0.02] border-b border-white/10 flex items-center gap-6 text-xs font-medium tabular-data overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0">
            <ShieldAlert className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400 font-semibold">System Status: Live</span>
          </div>
          <div className="w-px h-4 bg-gray-800 shrink-0" />
          <div className="flex items-center gap-6 shrink-0">
            <span className="text-gray-400">Total Wards: <strong className="text-white">{totalWards}</strong></span>
            {(riskCounts['Extreme'] || 0) > 0 && (
              <span className="flex items-center gap-1.5 text-red-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> {riskCounts['Extreme']} Extreme
              </span>
            )}
            {(riskCounts['Severe'] || 0) > 0 && (
              <span className="flex items-center gap-1.5 text-orange-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-orange-500" /> {riskCounts['Severe']} Severe
              </span>
            )}
            {(riskCounts['Moderate'] || 0) > 0 && (
              <span className="flex items-center gap-1.5 text-yellow-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-yellow-500" /> {riskCounts['Moderate']} Moderate
              </span>
            )}
            {(riskCounts['Low'] || 0) > 0 && (
              <span className="flex items-center gap-1.5 text-teal-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-teal-500" /> {riskCounts['Low']} Safe
              </span>
            )}
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="flex-1 flex items-center justify-center gap-3 py-20">
          <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-400 font-medium">Initializing Jaipur datastream...</span>
        </div>
      )}

      {/* Routes */}
      {!loading && (
        <main className="flex-1 w-full">
          <Routes>
            <Route path="/" element={<AuthorityDashboard />} />
            <Route path="/map" element={<RiskMapPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/shelters" element={<SheltersPage />} />
            <Route path="/emergency" element={<EmergencyPage />} />
            <Route path="/reports" element={<CitizenReportsPage />} />
            <Route path="/citizen" element={<CitizenPage />} />
          </Routes>
        </main>
      )}
    </div>
  );
}

export default App;
