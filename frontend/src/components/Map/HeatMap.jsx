import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, Users } from 'lucide-react';

// Design system colors
const TIER_COLORS = {
  Low: '#2DD4BF',      // Safe (Teal)
  Moderate: '#FBBF24', // Amber
  Severe: '#FB7A3C',   // Orange
  Extreme: '#EF4444',  // Red
};

// Calculate centroid of a polygon for marker placement
function getCentroid(coords) {
  let x = 0, y = 0, pts = coords[0].length - 1; // last pt is same as first
  for (let i = 0; i < pts; i++) {
    x += coords[0][i][0];
    y += coords[0][i][1];
  }
  return [y / pts, x / pts]; // Leaflet wants [lat, lng]
}

// Custom DivIcon for glowing marker with visible high-contrast ward name badge
const createGlowingMarker = (tier, isSelected, wardName) => {
  const color = TIER_COLORS[tier] || TIER_COLORS.Low;
  const isCritical = tier === 'Extreme' || tier === 'Severe';
  
  const html = `
    <div style="
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease;
      transform: scale(${isSelected ? 1.2 : 1});
      cursor: pointer;
    ">
      <!-- Outer Glow Ring -->
      <div style="
        position: absolute;
        top: -6px;
        width: 32px; height: 32px;
        border-radius: 50%;
        background: ${color};
        opacity: 0.35;
        filter: blur(6px);
        ${isCritical ? `animation: markerPulse 2s ease-in-out infinite alternate;` : ''}
      "></div>
      
      <!-- Center Glowing Dot -->
      <div style="
        position: relative;
        width: 16px; height: 16px;
        border-radius: 50%;
        background: ${color};
        box-shadow: 0 0 12px ${color}, inset 0 0 4px rgba(0,0,0,0.5);
        border: 2px solid rgba(255,255,255,0.95);
        z-index: 2;
      "></div>

      <!-- High-Contrast Place Name Badge -->
      <div style="
        margin-top: 5px;
        padding: 3px 8px;
        background: rgba(11, 14, 20, 0.92);
        border: 1px solid rgba(255, 255, 255, 0.25);
        border-radius: 6px;
        color: #ffffff;
        font-family: 'Inter', system-ui, sans-serif;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.02em;
        white-space: nowrap;
        backdrop-filter: blur(8px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.7);
        pointer-events: none;
        z-index: 1;
        display: flex;
        align-items: center;
        gap: 4px;
      ">
        <span style="width: 6px; height: 6px; border-radius: 50%; background: ${color}; inline-block;"></span>
        ${wardName}
      </div>
    </div>
    
    <style>
      @keyframes markerPulse {
        0% { transform: scale(0.8); opacity: 0.2; }
        100% { transform: scale(1.6); opacity: 0.5; }
      }
    </style>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [120, 50],
    iconAnchor: [60, 10],
    popupAnchor: [0, -15]
  });
};

function HeatMap() {
  const { wards, selectWard, selectedWard } = useApp();

  const markers = useMemo(() => {
    return wards.map(ward => {
      const center = getCentroid(ward.boundary.coordinates);
      const tier = ward.latestRisk?.riskTier || 'Low';
      const isSelected = selectedWard?.wardId === ward.wardId;
      return { ...ward, center, tier, isSelected };
    });
  }, [wards, selectedWard]);

  return (
    <div className="relative h-full w-full font-sans">
      <MapContainer
        center={[26.9124, 75.7873]} // Jaipur center
        zoom={12}
        className="h-full w-full rounded-[var(--radius-panel)]"
        style={{ width: '100%', height: '100%', minHeight: '560px', background: '#0B0E14' }}
        zoomControl={true}
      >
        {/* Custom styled dark tiles - Carto Dark Matter with crisp readable labels */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          className="map-tiles"
        />
        
        {/* High contrast tile filter ensuring city & street labels are bright and clear */}
        <style>{`
          .map-tiles { filter: brightness(1.2) contrast(1.15); }
        `}</style>

        {markers.map(ward => (
          <Marker 
            key={ward.wardId} 
            position={ward.center}
            icon={createGlowingMarker(ward.tier, ward.isSelected, ward.name)}
            eventHandlers={{ click: () => selectWard(ward.wardId) }}
          >
            <Popup closeButton={false} className="custom-popup">
              <div className="p-1 font-sans">
                <div className="text-xs text-gray-400 font-bold tracking-wider uppercase mb-1">{ward.wardId}</div>
                <h3 className="text-sm font-bold text-white mb-2">{ward.name}</h3>
                <div className="flex flex-col gap-1.5 text-xs">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-400 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 text-orange-400"/> Temp:</span>
                    <span className="font-bold tabular-data" style={{ color: TIER_COLORS[ward.tier] }}>{ward.latestRisk?.forecastTempC}°C</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-400 flex items-center gap-1"><Users className="w-3.5 h-3.5 text-teal-400"/> Vuln Score:</span>
                    <span className="font-bold tabular-data text-white">{ward.vulnerabilityScore}/100</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating Legend Card */}
      <div className="absolute bottom-6 left-6 z-[999] glass-panel p-4 text-xs font-sans">
        <div className="font-bold text-white mb-3 uppercase tracking-wider">Risk Level</div>
        {Object.entries(TIER_COLORS).map(([tier, color]) => (
          <div key={tier} className="flex items-center gap-3 mb-2 last:mb-0">
            <div className="w-3 h-3 rounded-full shadow-sm" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
            <span className="text-gray-300 font-semibold">{tier}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HeatMap;
