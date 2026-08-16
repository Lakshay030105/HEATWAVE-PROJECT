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
import { ShieldAlert, Menu, Radio, Flame, Gauge, MapPinned, Bell, Users } from 'lucide-react';

function App() {
  const { loading, wards, dataStreamMode, setDataStreamMode } = useApp();
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
  const isMapPage = location.pathname === '/map';

  return (
    <div className={`min-h-screen flex flex-col font-sans bg-[#0B0E14] text-slate-100 ${isMapPage ? 'h-screen overflow-hidden' : ''}`}>
      
      {/* Sidebar (hamburger-triggered, sits alongside the top navbar) */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Navigation Bar */}
      <header className="w-full h-14 md:h-16 px-3 md:px-6 lg:px-8 flex items-center justify-between border-b border-white/10 bg-[#0B0E14] sticky top-0 z-50 gap-2 md:gap-4 shrink-0">
        
        {/* Hamburger + Logo & Brand */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors -ml-1"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <AarogyaBrand />
        </div>

        {/* Center/Right Controls: Data Stream Toggle + Navigation (hidden on mobile, accessible via sidebar) */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {/* Data Mode Switcher (Live vs Demo) */}
          <div className="hidden lg:flex items-center gap-1 bg-black/60 border border-white/10 p-1 rounded-full text-xs">
            <button
              onClick={() => setDataStreamMode('live')}
              className={`px-3 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                dataStreamMode === 'live'
                  ? 'bg-[#2DD4BF] text-black font-bold shadow-md shadow-teal-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              title="Switch to Real-Time Satellite & Sensor Weather Ingestion (Jaipur ~26°C)"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>🛰️ Live Real-Time</span>
            </button>
            <button
              onClick={() => setDataStreamMode('demo')}
              className={`px-3 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                dataStreamMode === 'demo'
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold shadow-md shadow-red-500/25'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              title="Switch to Peak Summer Heatwave Demo Scenario (45°C Benchmark)"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>🔥 Peak Summer Demo</span>
            </button>
          </div>
          
          {/* Segmented Pill Toggle Navigation */}
          <nav className="flex items-center gap-1.5 p-1 rounded-full bg-white/5 border border-white/10 shrink-0">
            <NavLink
              to="/"
              end
              className={({ isActive }) => 
                `px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                  isActive 
                    ? 'bg-[#2DD4BF] text-black shadow-md shadow-teal-500/20' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/map"
              className={({ isActive }) => 
                `px-3.5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
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
                `px-3.5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
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
                `px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                  isActive 
                    ? 'bg-[#2DD4BF] text-black shadow-md shadow-teal-500/20' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              Citizen View
            </NavLink>
          </nav>
        </div>

        {/* Mobile: compact data mode indicator */}
        <div className="flex md:hidden items-center gap-2 shrink-0">
          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1
            ${dataStreamMode === 'live' 
              ? 'bg-teal-500/15 text-teal-300 border-teal-500/30' 
              : 'bg-red-500/15 text-red-400 border-red-500/30'
            }
          `}>
            {dataStreamMode === 'live' ? '🛰️ Live' : '🔥 Demo'}
          </span>
        </div>
      </header>

      {/* Live Status Strip */}
      {!loading && wards.length > 0 && !isCitizenView && (
        <div className="w-full px-4 md:px-8 py-2 md:py-2.5 bg-white/[0.02] border-b border-white/10 flex items-center justify-between text-xs font-medium tabular-data overflow-x-auto gap-3 md:gap-4 shrink-0">
          <div className="flex items-center gap-3 md:gap-6 shrink-0">
            <div className="flex items-center gap-2 shrink-0">
              <ShieldAlert className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400 font-semibold hidden sm:inline">System Status: Live</span>
              <span className="text-gray-400 font-semibold sm:hidden">Live</span>
            </div>
            <div className="w-px h-4 bg-gray-800 shrink-0 hidden sm:block" />
            <div className="flex items-center gap-3 md:gap-6 shrink-0">
              <span className="text-gray-400 hidden sm:inline">Total Wards: <strong className="text-white">{totalWards}</strong></span>
              {(riskCounts['Extreme'] || 0) > 0 && (
                <span className="flex items-center gap-1.5 text-red-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> {riskCounts['Extreme']} <span className="hidden sm:inline">Extreme</span>
                </span>
              )}
              {(riskCounts['Severe'] || 0) > 0 && (
                <span className="flex items-center gap-1.5 text-orange-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-orange-500" /> {riskCounts['Severe']} <span className="hidden sm:inline">Severe</span>
                </span>
              )}
              {(riskCounts['Moderate'] || 0) > 0 && (
                <span className="flex items-center gap-1.5 text-yellow-400 font-bold hidden sm:flex">
                  <span className="w-2 h-2 rounded-full bg-yellow-500" /> {riskCounts['Moderate']} Moderate
                </span>
              )}
              {(riskCounts['Low'] || 0) > 0 && (
                <span className="flex items-center gap-1.5 text-teal-400 font-bold hidden sm:flex">
                  <span className="w-2 h-2 rounded-full bg-teal-500" /> {riskCounts['Low']} Safe
                </span>
              )}
            </div>
          </div>

          {/* Active Mode Indicator Pill — hidden on mobile (already in header) */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-gray-500">Active Datastream:</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border flex items-center gap-1.5
              ${dataStreamMode === 'live' 
                ? 'bg-teal-500/15 text-teal-300 border-teal-500/30' 
                : 'bg-red-500/15 text-red-400 border-red-500/30'
              }
            `}>
              {dataStreamMode === 'live' ? '🛰️ Real-Time Satellites (~26°C)' : '🔥 Peak Summer Scenario (45°C)'}
            </span>
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
        <main className={`flex-1 w-full ${isMapPage ? 'h-full min-h-0 flex flex-col overflow-hidden' : 'pb-20 md:pb-0'}`}>
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

      {/* Mobile Bottom Tab Bar — visible only on mobile (< md) */}
      <nav className="bottom-tab-bar md:hidden">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
          <Gauge className="w-5 h-5" />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/map" className={({ isActive }) => isActive ? 'active' : ''}>
          <MapPinned className="w-5 h-5" />
          <span>Risk Map</span>
        </NavLink>
        <NavLink to="/alerts" className={({ isActive }) => isActive ? 'active' : ''}>
          <Bell className="w-5 h-5" />
          <span>Alerts</span>
        </NavLink>
        <NavLink to="/citizen" className={({ isActive }) => isActive ? 'active' : ''}>
          <Users className="w-5 h-5" />
          <span>Citizen</span>
        </NavLink>
      </nav>
    </div>
  );
}

export default App;
