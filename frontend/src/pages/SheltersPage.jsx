import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import {
  HousePlus, Building2, Droplets, MapPin, Users, Activity,
  Sliders, Plus, CheckCircle2, AlertTriangle, Search, Filter, Truck
} from 'lucide-react';

const TYPE_CONFIG = {
  cooling_center: { label: 'Cooling Center', icon: Building2, color: 'text-teal-400', bg: 'bg-teal-500/15 border-teal-500/25' },
  water_station: { label: 'Water ATM / Hydration Point', icon: Droplets, color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/25' },
};

function SheltersPage() {
  const { resources, wards, updateResourceOccupancy } = useApp();
  const { showToast } = useToast();

  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingResource, setEditingResource] = useState(null);
  const [newOccupancy, setNewOccupancy] = useState(0);
  const [newStatus, setNewStatus] = useState('open');

  const totalCapacity = resources.reduce((sum, r) => sum + (r.capacity || 0), 0);
  const totalCurrent = resources.reduce((sum, r) => sum + (r.currentOccupancy || 0), 0);
  const avgFillPct = totalCapacity > 0 ? Math.round((totalCurrent / totalCapacity) * 100) : 0;
  const criticalShelters = resources.filter(r => (r.currentOccupancy / r.capacity) >= 0.85);

  const filteredResources = resources.filter(r => {
    const matchesType = typeFilter === 'ALL' || r.type === typeFilter;
    const wardName = wards.find(w => w.wardId === r.wardId)?.name || '';
    const matchesSearch = r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wardName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleOpenEdit = (res) => {
    setEditingResource(res);
    setNewOccupancy(res.currentOccupancy);
    setNewStatus(res.status);
  };

  const handleSaveOccupancy = async (e) => {
    e.preventDefault();
    if (!editingResource) return;

    await updateResourceOccupancy(editingResource._id, Number(newOccupancy), newStatus);
    showToast(`Updated capacity for ${editingResource.name} to ${newOccupancy}/${editingResource.capacity}`, 'success');
    setEditingResource(null);
  };

  const handleDispatchTanker = (res) => {
    showToast(`Dispatched 10,000L PHED Water Tanker to ${res.name}`, 'warning');
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto p-6 md:p-8 flex flex-col gap-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-wider mb-1">
            <HousePlus className="w-4 h-4" /> Relief Infrastructure Management
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Cooling Centers & Hydration Network
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Real-time occupancy tracking, misting fans, water ATMs, and tanker dispatch coordination
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-500/15 border border-teal-500/25 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Active Shelters</div>
            <div className="text-2xl font-bold text-white tabular-data">{resources.length} Facilities</div>
            <div className="text-xs text-teal-400">All zones covered</div>
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Capacity</div>
            <div className="text-2xl font-bold text-white tabular-data">{totalCapacity.toLocaleString()} Slots</div>
            <div className="text-xs text-gray-400">{totalCurrent.toLocaleString()} currently sheltered</div>
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Average Fill Rate</div>
            <div className="text-2xl font-bold text-white tabular-data">{avgFillPct}%</div>
            <div className="text-xs text-gray-400">City-wide average</div>
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Near Capacity (&gt;85%)</div>
            <div className="text-2xl font-bold text-orange-400 tabular-data">{criticalShelters.length} Centers</div>
            <div className="text-xs text-orange-300">Requires overflow routing</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {['ALL', 'cooling_center', 'water_station'].map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all
                ${typeFilter === type
                  ? 'bg-teal-500 text-black shadow-md shadow-teal-500/20'
                  : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'}
              `}
            >
              {type === 'ALL' ? 'All Resources' : type === 'cooling_center' ? 'Cooling Centers' : 'Water ATMs'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-black/40 border border-white/10 px-3 py-2 rounded-xl text-xs w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by center name or ward..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-white outline-none w-full placeholder-gray-500"
          />
        </div>
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map(res => {
          const wardObj = wards.find(w => w.wardId === res.wardId);
          const config = TYPE_CONFIG[res.type] || TYPE_CONFIG.cooling_center;
          const Icon = config.icon;
          const fillPct = Math.round((res.currentOccupancy / res.capacity) * 100);
          const isHigh = fillPct >= 85;

          return (
            <div key={res._id} className="glass-panel p-6 flex flex-col justify-between hover:border-white/20 transition-all">
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${config.bg}`}>
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white leading-tight">{res.name}</h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-0.5">
                        <MapPin className="w-3 h-3 text-teal-400" /> {wardObj?.name || res.wardId}
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0
                    ${isHigh
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'}
                  `}>
                    {isHigh ? 'High Occupancy' : 'Available'}
                  </span>
                </div>

                <p className="text-xs text-gray-400 mb-4">{res.address}</p>

                {/* Capacity Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-gray-400 font-medium">Occupancy</span>
                    <span className="font-bold text-white tabular-data">
                      {res.currentOccupancy} / {res.capacity} ({fillPct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isHigh ? 'bg-orange-500' : 'bg-teal-500'}`}
                      style={{ width: `${Math.min(100, fillPct)}%` }}
                    />
                  </div>
                </div>

                {/* Amenities Badges */}
                {res.amenities && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {res.amenities.map(amenity => (
                      <span key={amenity} className="px-2 py-0.5 rounded-md bg-black/30 text-gray-300 text-[10px] border border-white/5">
                        {amenity}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                <button
                  onClick={() => handleOpenEdit(res)}
                  className="flex-1 py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/5 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5 text-teal-400" /> Update Live Count
                </button>
                <button
                  onClick={() => handleDispatchTanker(res)}
                  className="py-2 px-3 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-bold border border-blue-500/30 flex items-center justify-center gap-1.5 transition-colors"
                  title="Dispatch Water Tanker"
                >
                  <Truck className="w-3.5 h-3.5" /> Tanker
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Edit Occupancy Modal */}
      {editingResource && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0E131F] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-white mb-1">Update Live Shelter Capacity</h3>
            <p className="text-xs text-gray-400 mb-6">{editingResource.name}</p>

            <form onSubmit={handleSaveOccupancy} className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between font-bold text-white mb-2">
                  <span>Current Occupancy</span>
                  <span className="text-teal-400 text-sm">{newOccupancy} / {editingResource.capacity}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={editingResource.capacity}
                  value={newOccupancy}
                  onChange={(e) => setNewOccupancy(e.target.value)}
                  className="w-full accent-teal-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold uppercase tracking-wider mb-1.5 text-[10px]">Operational Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-teal-500"
                >
                  <option value="open">Open (Operational)</option>
                  <option value="limited">Limited (Near Capacity)</option>
                  <option value="full">Full (Redirecting)</option>
                  <option value="closed">Closed (Maintenance)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingResource(null)}
                  className="px-4 py-2 rounded-lg text-gray-400 hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-black font-bold shadow-lg shadow-teal-500/20"
                >
                  Save Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default SheltersPage;
