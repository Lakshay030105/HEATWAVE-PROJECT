import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import {
  Users, AlertTriangle, CheckCircle2, Clock, Search,
  Filter, MapPin, Phone, MessageSquare, ShieldAlert, Check, X
} from 'lucide-react';

const CATEGORY_STYLES = {
  heat_illness: { label: 'Heat Illness / Stroke', color: 'text-red-400', bg: 'bg-red-500/15 border-red-500/30' },
  water_shortage: { label: 'Water ATM Dry', color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/30' },
  infrastructure_issue: { label: 'Cooling / Misting Failure', color: 'text-yellow-400', bg: 'bg-yellow-500/15 border-yellow-500/30' },
  general: { label: 'General Heat Distress', color: 'text-purple-400', bg: 'bg-purple-500/15 border-purple-500/30' },
};

const SEVERITY_COLORS = {
  severe: '#EF4444',
  moderate: '#FB7A3C',
  mild: '#2DD4BF',
};

function CitizenReportsPage() {
  const { reports, wards, updateReportStatus } = useApp();
  const { showToast } = useToast();

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [resolvingReport, setResolvingReport] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');

  const pendingCount = reports.filter(r => r.status === 'pending').length;
  const investigatingCount = reports.filter(r => r.status === 'investigating').length;
  const resolvedCount = reports.filter(r => r.status === 'resolved').length;

  const filteredReports = reports.filter(r => {
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const wardName = wards.find(w => w.wardId === r.wardId)?.name || '';
    const matchesSearch = r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wardName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleUpdateStatus = async (reportId, newStatus) => {
    await updateReportStatus(reportId, newStatus);
    showToast(`Report marked as ${newStatus}`, 'info');
  };

  const handleConfirmResolve = async (e) => {
    e.preventDefault();
    if (!resolvingReport) return;

    await updateReportStatus(resolvingReport._id, 'resolved', resolutionNote);
    showToast('Report marked as Resolved with resolution note logged', 'success');
    setResolvingReport(null);
    setResolutionNote('');
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto p-6 md:p-8 flex flex-col gap-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" /> Citizen Ground Reports Moderation
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Crowdsourced Heat Hazard Feed & Action Desk
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Real-time citizen field feedback submitted via the public Citizen View portal
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center shrink-0">
            <MessageSquare className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Reports</div>
            <div className="text-2xl font-bold text-white tabular-data">{reports.length} Filed</div>
            <div className="text-xs text-purple-300">Last 24 hours</div>
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/15 border border-red-500/25 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Pending Action</div>
            <div className="text-2xl font-bold text-red-400 tabular-data">{pendingCount} Reports</div>
            <div className="text-xs text-red-300">Requires triage review</div>
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/15 border border-yellow-500/25 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Under Investigation</div>
            <div className="text-2xl font-bold text-yellow-400 tabular-data">{investigatingCount} Reports</div>
            <div className="text-xs text-yellow-300">Team dispatched</div>
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-500/15 border border-teal-500/25 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Resolved Cases</div>
            <div className="text-2xl font-bold text-teal-300 tabular-data">{resolvedCount} Reports</div>
            <div className="text-xs text-teal-400">Assistance provided</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {['ALL', 'pending', 'investigating', 'resolved'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all
                ${statusFilter === status
                  ? 'bg-teal-500 text-black shadow-md shadow-teal-500/20'
                  : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'}
              `}
            >
              {status === 'ALL' ? 'All Feed' : status.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-black/40 border border-white/10 px-3 py-2 rounded-xl text-xs w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search report description or ward..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-white outline-none w-full placeholder-gray-500"
          />
        </div>
      </div>

      {/* Reports Feed List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="glass-panel p-12 text-center text-gray-500 italic">
            No citizen reports found matching current filters.
          </div>
        ) : (
          filteredReports.map(rep => {
            const wardObj = wards.find(w => w.wardId === rep.wardId);
            const catConfig = CATEGORY_STYLES[rep.reportType] || CATEGORY_STYLES.general;
            const severityColor = SEVERITY_COLORS[rep.severity] || '#2DD4BF';

            return (
              <div key={rep._id} className="glass-panel p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-white/20 transition-all">
                <div className="flex-1">
                  
                  {/* Category & Status Row */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${catConfig.bg} ${catConfig.color}`}>
                      {catConfig.label}
                    </span>

                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                      style={{ background: `${severityColor}20`, color: severityColor, border: `1px solid ${severityColor}40` }}
                    >
                      {rep.severity} Severity
                    </span>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                      ${rep.status === 'pending' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        rep.status === 'investigating' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                        'bg-teal-500/20 text-teal-300 border border-teal-500/30'}
                    `}>
                      {rep.status}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm font-medium text-white mb-3 leading-relaxed">
                    {rep.description}
                  </p>

                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-teal-400" />
                      <strong>{wardObj?.name || rep.wardId}</strong> ({rep.location})
                    </span>
                    {rep.contactPhone && (
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3.5 h-3.5 text-gray-500" /> {rep.contactPhone}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-3.5 h-3.5" /> {new Date(rep.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Resolution note if resolved */}
                  {rep.resolutionNote && (
                    <div className="mt-3 p-3 rounded-lg bg-teal-500/10 border border-teal-500/20 text-xs text-teal-200">
                      <strong>Resolution Note:</strong> {rep.resolutionNote}
                    </div>
                  )}
                </div>

                {/* Workflow Action Buttons */}
                <div className="flex flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto">
                  {rep.status === 'pending' && (
                    <button
                      onClick={() => handleUpdateStatus(rep._id, 'investigating')}
                      className="flex-1 md:flex-initial px-4 py-2 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/30 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Clock className="w-3.5 h-3.5" /> Start Investigation
                    </button>
                  )}

                  {rep.status !== 'resolved' && (
                    <button
                      onClick={() => setResolvingReport(rep)}
                      className="flex-1 md:flex-initial px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-black font-bold text-xs shadow-md shadow-teal-500/20 transition-all flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
                    </button>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Resolve Note Modal */}
      {resolvingReport && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0E131F] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-white mb-1">Resolve Citizen Report</h3>
            <p className="text-xs text-gray-400 mb-4">{resolvingReport.description}</p>

            <form onSubmit={handleConfirmResolve} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-bold uppercase tracking-wider mb-1.5 text-[10px]">Action & Resolution Summary</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g., Water tanker dispatched, or medical team deployed and patient stabilized."
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-teal-500 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setResolvingReport(null)}
                  className="px-4 py-2 rounded-lg text-gray-400 hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-black font-bold shadow-lg shadow-teal-500/20"
                >
                  Confirm Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default CitizenReportsPage;
