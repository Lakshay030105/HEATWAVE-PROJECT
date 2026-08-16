import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import {
  Layers, Clock, ShieldAlert, Thermometer, Trees, Users, HardHat,
  Search, Eye, Play, Pause, RotateCcw, X
} from 'lucide-react';

const TIER_COLORS = {
  Low: '#2DD4BF',
  Moderate: '#FBBF24',
  Severe: '#FB7A3C',
  Extreme: '#EF4444',
};

function getCentroid(coords) {
  let x = 0, y = 0, pts = coords[0].length - 1;
  for (let i = 0; i < pts; i++) {
    x += coords[0][i][0];
    y += coords[0][i][1];
  }
  return [y / pts, x / pts];
}

// Custom DivIcon that changes visual indicators depending on active layer
const createLayerMarker = (ward, activeLayer, isSelected) => {
  const tier = ward.latestRisk?.riskTier || 'Low';
  let primaryColor = TIER_COLORS[tier];
  let badgeValue = `${ward.latestRisk?.forecastTempC}°C`;

  if (activeLayer === 'lst') {
    primaryColor = ward.latestRisk?.forecastTempC > 44 ? '#EF4444' : ward.latestRisk?.forecastTempC > 41 ? '#FB7A3C' : '#FBBF24';
    badgeValue = `LST: ${ward.latestRisk?.forecastTempC}°C`;
  } else if (activeLayer === 'ndvi') {
    const greenPct = Math.round((ward.greenCoverPct || 0.1) * 100);
    primaryColor = greenPct < 8 ? '#EF4444' : greenPct < 18 ? '#FBBF24' : '#2DD4BF';
    badgeValue = `Green: ${greenPct}%`;
  } else if (activeLayer === 'demographics') {
    const outdoorPct = Math.round((ward.pctOutdoorWorkers || 0.2) * 100);
    primaryColor = outdoorPct > 35 ? '#EF4444' : outdoorPct > 20 ? '#FB7A3C' : '#2DD4BF';
    badgeValue = `Outdoor: ${outdoorPct}%`;
  } else {
    badgeValue = `HVI: ${ward.latestRisk?.hvi || 0}`;
  }

  const html = `
    <div style="
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      transition: all 0.25s ease;
      transform: scale(${isSelected ? 1.25 : 1});
      cursor: pointer;
    ">
      <div style="
        position: absolute;
        top: -6px;
        width: 34px; height: 34px;
        border-radius: 50%;
        background: ${primaryColor};
        opacity: 0.4;
        filter: blur(6px);
      "></div>
      
      <div style="
        position: relative;
        width: 18px; height: 18px;
        border-radius: 50%;
        background: ${primaryColor};
        box-shadow: 0 0 14px ${primaryColor};
        border: 2px solid #ffffff;
        z-index: 2;
      "></div>

      <div style="
        margin-top: 5px;
        padding: 3px 8px;
        background: rgba(11, 14, 20, 0.94);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 6px;
        color: #ffffff;
        font-family: 'Inter', system-ui, sans-serif;
        font-size: 11px;
        font-weight: 700;
        white-space: nowrap;
        backdrop-filter: blur(8px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.8);
        z-index: 1;
        display: flex;
        align-items: center;
        gap: 5px;
      ">
        <span style="width: 6px; height: 6px; border-radius: 50%; background: ${primaryColor}; display: inline-block;"></span>
        <span>${ward.name}</span>
        <span style="color: ${primaryColor}; opacity: 0.9; font-size: 10px; font-weight: 800; border-left: 1px solid rgba(255,255,255,0.2); padding-left: 4px;">${badgeValue}</span>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-layer-marker',
    iconSize: [140, 50],
    iconAnchor: [70, 10],
    popupAnchor: [0, -15]
  });
};

function MapController({ flyTarget }) {
  const map = useMap();

  useEffect(() => {
    if (flyTarget) {
      map.flyTo(flyTarget, 14, { duration: 1.2 });
    }
  }, [flyTarget, map]);

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

const LAYERS = [
  { id: 'hvi', label: 'Composite HVI', icon: ShieldAlert, desc: '60% Vulnerability + 40% Weather' },
  { id: 'lst', label: 'Land Surface Temp', icon: Thermometer, desc: 'Satellite LST Thermal Readings' },
  { id: 'ndvi', label: 'Green Canopy (NDVI)', icon: Trees, desc: 'Urban vegetation & canopy cover' },
  { id: 'demographics', label: 'Vulnerable Labor', icon: HardHat, desc: 'Outdoor workforce & elderly %' },
];

const TIMELINE_STEPS = [
  { hours: 0, label: 'Current' },
  { hours: 3, label: '+3 Hours' },
  { hours: 6, label: '+6 Hours' },
  { hours: 12, label: '+12 Hours' },
  { hours: 24, label: '+24h (Tomorrow)' },
  { hours: 48, label: '+48h (2-Day AI)' },
];

// Ward detail drawer content — reused in both desktop sidebar and mobile bottom sheet
function WardDrawerContent({ selectedWard, wards, selectWard, activeLayer, predictionHours, TIER_COLORS }) {
  return (
    <>
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
        <div>
          <span className="text-[10px] font-mono text-teal-400 tracking-wider uppercase">{selectedWard?.wardId || 'ZONE'}</span>
          <h2 className="text-lg font-bold text-white">{selectedWard?.name || 'Select a Ward'}</h2>
        </div>
        <span
          className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
          style={{
            background: `${TIER_COLORS[selectedWard?.latestRisk?.riskTier || 'Low']}20`,
            color: TIER_COLORS[selectedWard?.latestRisk?.riskTier || 'Low'],
            border: `1px solid ${TIER_COLORS[selectedWard?.latestRisk?.riskTier || 'Low']}40`
          }}
        >
          {selectedWard?.latestRisk?.riskTier || 'Low'} Risk
        </span>
      </div>

      {/* 4-Factor ML Calculation Breakdown */}
      <div className="space-y-4 mb-6">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
          <span>HVI Multi-Factor Weights</span>
          <span className="text-teal-400 font-mono">Score: {selectedWard?.latestRisk?.hvi}/100</span>
        </div>

        {/* Factor 1: LST */}
        <div className="bg-black/30 p-3 rounded-xl border border-white/5">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-300 flex items-center gap-1.5"><Thermometer className="w-3.5 h-3.5 text-red-400"/> Land Surface Temp (35%)</span>
            <span className="font-bold text-white tabular-data">{selectedWard?.latestRisk?.forecastTempC}°C</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min(100, ((selectedWard?.latestRisk?.forecastTempC - 30) / 20) * 100)}%` }} />
          </div>
        </div>

        {/* Factor 2: Elderly Demographics */}
        <div className="bg-black/30 p-3 rounded-xl border border-white/5">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-300 flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-orange-400"/> Elderly Population 65+ (25%)</span>
            <span className="font-bold text-white tabular-data">{Math.round((selectedWard?.pctElderly || 0.1) * 100)}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(selectedWard?.pctElderly || 0.1) * 100 * 4}%` }} />
          </div>
        </div>

        {/* Factor 3: Outdoor Workers */}
        <div className="bg-black/30 p-3 rounded-xl border border-white/5">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-300 flex items-center gap-1.5"><HardHat className="w-3.5 h-3.5 text-yellow-400"/> Outdoor Workers (25%)</span>
            <span className="font-bold text-white tabular-data">{Math.round((selectedWard?.pctOutdoorWorkers || 0.2) * 100)}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${(selectedWard?.pctOutdoorWorkers || 0.2) * 100 * 2}%` }} />
          </div>
        </div>

        {/* Factor 4: Green Cover Inverse */}
        <div className="bg-black/30 p-3 rounded-xl border border-white/5">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-300 flex items-center gap-1.5"><Trees className="w-3.5 h-3.5 text-teal-400"/> Lack of Green Cover (15%)</span>
            <span className="font-bold text-white tabular-data">{100 - Math.round((selectedWard?.greenCoverPct || 0.1) * 100)}% deficit</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-teal-500 rounded-full" style={{ width: `${(1 - (selectedWard?.greenCoverPct || 0.1)) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Quick Ward Navigation List */}
      <div className="mt-auto">
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Other Jaipur Zones</div>
        <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto">
          {wards.map(w => (
            <button
              key={w.wardId}
              onClick={() => selectWard(w.wardId)}
              className={`px-2.5 py-1.5 rounded text-left text-xs font-medium truncate transition-colors cursor-pointer
                ${w.wardId === selectedWard?.wardId
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold'
                  : 'bg-black/20 text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              {w.name}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function RiskMapPage() {
  const {
    wards, selectedWard, selectWard, activeLayer,
    setActiveLayer, predictionHours, setPredictionHours
  } = useApp();
  const { showToast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [flyTarget, setFlyTarget] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Auto-play timeline simulation
  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setPredictionHours(prev => {
          const idx = TIMELINE_STEPS.findIndex(s => s.hours === prev);
          const nextIdx = (idx + 1) % TIMELINE_STEPS.length;
          return TIMELINE_STEPS[nextIdx].hours;
        });
      }, 2500);
    }
    return () => clearInterval(timer);
  }, [isPlaying, setPredictionHours]);

  const markers = useMemo(() => {
    return wards.map(w => ({
      ...w,
      center: getCentroid(w.boundary.coordinates),
      isSelected: selectedWard?.wardId === w.wardId
    }));
  }, [wards, selectedWard]);

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      const found = markers.find(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.wardId.toLowerCase().includes(searchQuery.toLowerCase()));
      if (found) {
        setFlyTarget(found.center);
        selectWard(found.wardId);
        showToast(`Located ${found.name} (HVI: ${found.latestRisk?.hvi})`, 'info');
      } else {
        showToast('Ward not found in Jaipur boundaries', 'warning');
      }
    }
  };

  return (
    <div className="w-full h-full flex-1 min-h-0 flex flex-col font-sans bg-[#0B0E14] text-slate-100 overflow-hidden relative">
      
      {/* Top Controls Toolbar */}
      <div className="px-3 md:px-6 py-2 border-b border-white/10 bg-[#0E131F]/95 backdrop-blur-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 md:gap-4 z-20 shrink-0">
        
        {/* Layer Selectors — horizontally scrollable on mobile */}
        <div className="flex items-center gap-1.5 md:gap-2 overflow-x-auto scroll-pills py-0.5">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mr-1 shrink-0">
            <Layers className="w-3.5 h-3.5 text-teal-400" /> <span className="hidden sm:inline">GIS</span> Layers:
          </span>
          {LAYERS.map(layer => {
            const Icon = layer.icon;
            const active = activeLayer === layer.id;
            return (
              <button
                key={layer.id}
                onClick={() => {
                  setActiveLayer(layer.id);
                  showToast(`Switched layer to ${layer.label}`, 'info');
                }}
                className={`flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer
                  ${active
                    ? 'bg-teal-500 text-black shadow-md shadow-teal-500/20'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/5'}`}
                title={layer.desc}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{layer.label}</span>
                <span className="md:hidden">{layer.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Right side: Search + Mobile Drawer Trigger */}
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="flex items-center gap-2 bg-black/40 border border-white/10 px-3 py-1.5 rounded-lg flex-1 sm:w-56 md:w-64">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search ward or area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="bg-transparent text-xs text-white placeholder-gray-500 outline-none w-full"
            />
          </div>

          {/* Mobile button to open ward breakdown drawer */}
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-bold hover:bg-teal-500/30 transition-colors shrink-0 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Analysis</span>
          </button>
        </div>
      </div>

      {/* Main Content: Map + Side Drawer */}
      <div className="flex-1 min-h-0 flex relative overflow-hidden">
        
        {/* Full-bleed Leaflet Map */}
        <div className="flex-1 h-full min-h-0 relative">
          <MapContainer
            center={[26.9124, 75.7873]}
            zoom={12}
            className="h-full w-full"
            style={{ background: '#0B0E14' }}
            zoomControl={true}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              className="map-tiles"
            />
            <style>{`.map-tiles { filter: brightness(1.15) contrast(1.1); }`}</style>
            
            <MapController flyTarget={flyTarget} />

            {markers.map(ward => (
              <Marker
                key={ward.wardId}
                position={ward.center}
                icon={createLayerMarker(ward, activeLayer, ward.isSelected)}
                eventHandlers={{ click: () => { selectWard(ward.wardId); setMobileDrawerOpen(true); } }}
              >
                <Popup className="custom-popup" closeButton={false}>
                  <div className="p-2 font-sans">
                    <div className="text-[10px] font-bold uppercase text-gray-400">{ward.wardId}</div>
                    <div className="text-sm font-bold text-white mb-2">{ward.name}</div>
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Risk Tier:</span>
                        <span className="font-bold" style={{ color: TIER_COLORS[ward.latestRisk?.riskTier] }}>
                          {ward.latestRisk?.riskTier}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Forecast Temp:</span>
                        <span className="font-bold text-white">{ward.latestRisk?.forecastTempC}°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">HVI Score:</span>
                        <span className="font-bold text-teal-300">{ward.latestRisk?.hvi}/100</span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Floating Timeline Control at Bottom of Map */}
          <div className="absolute bottom-16 md:bottom-4 left-3 right-3 md:left-6 md:right-6 z-[1000] glass-panel p-3 md:p-4 flex flex-col gap-2 shadow-2xl bg-[#0E131F]/95 backdrop-blur-xl border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Clock className="w-4 h-4 text-teal-400 shrink-0" />
                <span className="hidden sm:inline">AI Predictive Time-Travel Forecast:</span>
                <span className="sm:hidden">Forecast:</span>
                <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 font-mono">
                  {TIMELINE_STEPS.find(s => s.hours === predictionHours)?.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center gap-1 px-2.5 md:px-3 py-1 rounded-md bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Auto-Play'}</span>
                </button>
                <button
                  onClick={() => { setPredictionHours(0); setIsPlaying(false); }}
                  className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
                  title="Reset to live"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Slider track buttons — 3 cols on mobile, 6 on md+ */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5 md:gap-2 mt-0.5">
              {TIMELINE_STEPS.map(step => (
                <button
                  key={step.hours}
                  onClick={() => { setPredictionHours(step.hours); setIsPlaying(false); }}
                  className={`py-1.5 px-1 md:px-2 rounded-lg text-[10px] md:text-[11px] font-bold text-center transition-all cursor-pointer truncate
                    ${predictionHours === step.hours
                      ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/30 font-extrabold'
                      : 'bg-black/40 text-gray-400 hover:text-white hover:bg-white/5 border border-white/5'}`}
                >
                  {step.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right ML Inspection & Ward Breakdown Drawer — DESKTOP only (lg+) */}
        <div className="hidden lg:flex w-96 h-full min-h-0 bg-[#0E131F] border-l border-white/10 p-5 flex-col overflow-y-auto z-10 shrink-0">
          <WardDrawerContent
            selectedWard={selectedWard}
            wards={wards}
            selectWard={selectWard}
            activeLayer={activeLayer}
            predictionHours={predictionHours}
            TIER_COLORS={TIER_COLORS}
          />
        </div>

        {/* Mobile Bottom Sheet Drawer — visible on < lg */}
        <div
          className={`bottom-sheet-overlay lg:hidden ${mobileDrawerOpen ? 'open' : ''}`}
          onClick={() => setMobileDrawerOpen(false)}
        />
        <div className={`bottom-sheet lg:hidden ${mobileDrawerOpen ? 'open' : ''}`}>
          <div className="bottom-sheet-handle" />
          <div className="flex items-center justify-between px-5 pt-2 pb-3 border-b border-white/10">
            <h3 className="text-sm font-bold text-white">Ward Thermal & Demographic Analysis</h3>
            <button
              onClick={() => setMobileDrawerOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-5">
            <WardDrawerContent
              selectedWard={selectedWard}
              wards={wards}
              selectWard={(id) => { selectWard(id); setMobileDrawerOpen(false); }}
              activeLayer={activeLayer}
              predictionHours={predictionHours}
              TIER_COLORS={TIER_COLORS}
            />
          </div>
        </div>

      </div>
    </div>
  );
}

export default RiskMapPage;
