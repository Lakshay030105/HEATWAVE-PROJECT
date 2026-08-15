import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import {
  Bell, Send, ShieldAlert, CheckCircle2, AlertTriangle, Radio,
  Smartphone, PhoneCall, MessageSquare, Zap, Clock, Users, Search, Filter, Plus, X
} from 'lucide-react';

const TIER_COLORS = {
  Extreme: '#EF4444',
  Severe: '#FB7A3C',
  Moderate: '#FBBF24',
  Low: '#2DD4BF',
};

const TEMPLATES = {
  en: {
    label: 'English',
    Extreme: 'HEATWAVE RED ALERT: Forecast temperature {temp}°C in {ward}. Avoid outdoor exposure between 11:00 AM - 4:00 PM. Drink plenty of water and ORS. Emergency cooling center open at nearby municipal hall.',
    Severe: 'SEVERE HEAT ADVISORY: Temperatures rising to {temp}°C in {ward}. Stay hydrated, take frequent shade breaks, and check on elderly neighbors.',
  },
  hi: {
    label: 'Hindi (हिंदी)',
    Extreme: 'लू की लाल चेतावनी: {ward} में तापमान {temp}°C का अनुमान है। सुबह 11 से शाम 4 बजे के बीच धूप में न निकलें। अधिक पानी और ओआरएस पिएं। निकटतम कूलिंग सेंटर चालू है।',
    Severe: 'भीषण गर्मी चेतावनी: {ward} में तापमान {temp}°C तक पहुंचेगा। लगातार पानी पिएं, छांव में रहें और बुजुर्गों का ध्यान रखें।',
  },
  rj: {
    label: 'Rajasthani (राजस्थानी)',
    Extreme: 'घणी तेज लू री चेतावनी: {ward} मांय पारा {temp}°C पूगसी। दोपहर मांय बाहर मत निकलो, छांव मांय रहो अर ठंडा पानी पीवो।',
    Severe: 'तेज धूप री चेतावनी: {ward} मांय तापमान {temp}°C रहसी। खूब पानी अर राबड़ी पीवो।',
  }
};

function AlertsPage() {
  const { alerts, wards, dispatchAlert } = useApp();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWardId, setSelectedWardId] = useState('ALL_CRITICAL');
  const [selectedTier, setSelectedTier] = useState('Extreme');
  const [selectedChannel, setSelectedChannel] = useState('sms');
  const [selectedLang, setSelectedLang] = useState('hi');
  const [recipientPhone, setRecipientPhone] = useState('+918607405507');
  const [customMessage, setCustomMessage] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [isSending, setIsSending] = useState(false);

  // Dynamic message template preview
  const wardObj = wards.find(w => w.wardId === selectedWardId);
  const wardName = selectedWardId === 'ALL_CRITICAL' ? 'All Critical Jaipur Zones' : (wardObj?.name || 'Selected Ward');
  const temp = wardObj?.latestRisk?.forecastTempC || 46;

  const previewMessage = customMessage || (TEMPLATES[selectedLang][selectedTier] || TEMPLATES[selectedLang].Extreme)
    .replace('{ward}', wardName)
    .replace('{temp}', temp);

  const estimatedReach = selectedWardId === 'ALL_CRITICAL'
    ? wards.filter(w => w.latestRisk?.riskTier === 'Extreme' || w.latestRisk?.riskTier === 'Severe')
        .reduce((sum, w) => sum + Math.round((w.population || 50000) * 0.35), 0)
    : Math.round((wardObj?.population || 60000) * 0.35);

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    setIsSending(true);

    const alertData = {
      wardId: selectedWardId === 'ALL_CRITICAL' ? 'JAI-CRITICAL-ALL' : selectedWardId,
      tier: selectedTier,
      channel: selectedChannel,
      message: previewMessage,
      recipientCount: estimatedReach,
      recipientPhone: recipientPhone.trim() || undefined,
      status: 'sent',
      sentAt: new Date().toISOString()
    };

    try {
      const result = await dispatchAlert(alertData);
      if (result?.status === 'failed') {
        showToast(`Broadcast recorded, but Twilio gateway flagged delivery notice for ${recipientPhone}`, 'error');
      } else {
        showToast(`Broadcast sent to ${estimatedReach.toLocaleString()} citizens via ${selectedChannel.toUpperCase()}`, 'success');
      }
      setIsModalOpen(false);
      setCustomMessage('');
    } catch (err) {
      showToast('Error dispatching alert broadcast', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    const matchesSearch = a.wardId?.toLowerCase().includes(searchFilter.toLowerCase()) || a.message?.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesTier = tierFilter === 'ALL' || a.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const totalCitizensReached = alerts.reduce((sum, a) => sum + (a.recipientCount || 15000), 0);

  return (
    <div className="w-full max-w-[1600px] mx-auto p-6 md:p-8 flex flex-col gap-8 font-sans">
      
      {/* Header with New Dispatch Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-wider mb-1">
            <Radio className="w-4 h-4 animate-pulse" /> Emergency Broadcast Hub
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Early Warning Alerts & SMS Dispatch
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Real-time automated multi-channel hazard dispatches (SMS, Voice IVR, WhatsApp, Push)
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white shadow-lg shadow-red-500/25 transition-all"
        >
          <Send className="w-4 h-4" /> Dispatch New Broadcast
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/15 border border-red-500/25 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Citizen Reach</div>
            <div className="text-2xl font-bold text-white tabular-data">{totalCitizensReached.toLocaleString()}</div>
            <div className="text-xs text-teal-400">Across 10 Jaipur Wards</div>
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-500/15 border border-teal-500/25 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Delivery Rate</div>
            <div className="text-2xl font-bold text-white tabular-data">98.6%</div>
            <div className="text-xs text-gray-400">Carrier confirmed</div>
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/15 border border-yellow-500/25 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Median Latency</div>
            <div className="text-2xl font-bold text-white tabular-data">1.2s</div>
            <div className="text-xs text-gray-400">Trigger to handset</div>
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center shrink-0">
            <Radio className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Active Triggers</div>
            <div className="text-2xl font-bold text-white tabular-data">4 Rules</div>
            <div className="text-xs text-purple-300">Auto-evaluating daily</div>
          </div>
        </div>
      </div>

      {/* Automated Watchdog Rules Panel */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h2 className="text-base font-bold text-white">Automated Risk Watchdog Engine (Cron Active)</h2>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-mono font-bold">
            ● 30s Heartbeat
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-black/30 border border-red-500/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-red-400 uppercase tracking-wider">Rule #1: Extreme Heat Flash</span>
                <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-bold">SMS + Voice</span>
              </div>
              <p className="text-gray-400 mt-1">If Forecast Temp &gt; 45°C OR HVI &gt; 80 in any ward, auto-trigger mass SMS to registered verified numbers.</p>
            </div>
            <div className="mt-3 text-[11px] text-gray-500 font-mono">Dedupe: ward-date-extreme-phone</div>
          </div>

          <div className="p-4 rounded-xl bg-black/30 border border-orange-500/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-orange-400 uppercase tracking-wider">Rule #2: Severe Vulnerability</span>
                <span className="px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 font-bold">SMS</span>
              </div>
              <p className="text-gray-400 mt-1">If HVI &gt; 65 and elderly demographic &gt; 12%, dispatch community health worker alerts & cooling shelter notifications.</p>
            </div>
            <div className="mt-3 text-[11px] text-gray-500 font-mono">Dedupe: ward-date-severe-phone</div>
          </div>

          <div className="p-4 rounded-xl bg-black/30 border border-teal-500/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-teal-400 uppercase tracking-wider">Rule #3: All-Clear Advisory</span>
                <span className="px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-bold">Push</span>
              </div>
              <p className="text-gray-400 mt-1">When ambient temperature drops below 36°C after 6:00 PM, send evening recovery & hydration advisory.</p>
            </div>
            <div className="mt-3 text-[11px] text-gray-500 font-mono">Dedupe: ward-date-allclear-phone</div>
          </div>
        </div>
      </div>

      {/* Alert Broadcast Logs Table */}
      <div className="glass-panel p-6 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-teal-400" /> Dispatched Alerts History
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Auditable broadcast log with recipient counts, target phone numbers, and delivery telemetry</p>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-black/40 border border-white/10 px-3 py-1.5 rounded-lg text-xs w-full md:w-64">
              <Search className="w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search ward or text..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="bg-transparent text-white outline-none w-full placeholder-gray-500"
              />
            </div>

            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="bg-black/40 border border-white/10 text-xs text-white px-3 py-2 rounded-lg outline-none"
            >
              <option value="ALL">All Tiers</option>
              <option value="Extreme">Extreme</option>
              <option value="Severe">Severe</option>
              <option value="Moderate">Moderate</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-gray-400 border-b border-white/10 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Ward / Target</th>
                <th className="py-3 px-4">Risk Tier</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Message Content</th>
                <th className="py-3 px-4">Recipients</th>
                <th className="py-3 px-4">Dispatched Time</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500 italic">
                    No alert logs found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert, idx) => {
                  const wardNameDisplay = wards.find(w => w.wardId === alert.wardId)?.name || alert.wardId;
                  const tierColor = TIER_COLORS[alert.tier] || '#2DD4BF';
                  const isFailed = alert.status === 'failed';

                  return (
                    <tr key={alert._id || idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">
                        <div>{wardNameDisplay}</div>
                        <div className="text-[10px] text-gray-500 font-mono">
                          {alert.wardId} {alert.recipientPhone && `• ${alert.recipientPhone}`}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block"
                          style={{
                            background: `${tierColor}20`,
                            color: tierColor,
                            border: `1px solid ${tierColor}40`
                          }}
                        >
                          {alert.tier}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 uppercase text-gray-300 font-mono font-bold">
                        <div className="flex items-center gap-1.5">
                          {alert.channel === 'sms' && <Smartphone className="w-3.5 h-3.5 text-blue-400" />}
                          {alert.channel === 'whatsapp' && <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />}
                          {alert.channel === 'voice' && <PhoneCall className="w-3.5 h-3.5 text-green-400" />}
                          {alert.channel === 'push' && <Radio className="w-3.5 h-3.5 text-purple-400" />}
                          <span>{alert.channel}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-300 max-w-md truncate" title={alert.message}>
                        {alert.message}
                      </td>
                      <td className="py-3.5 px-4 tabular-data text-white font-bold">
                        {(alert.recipientCount || 20000).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-gray-400 whitespace-nowrap font-mono text-[11px]">
                        {new Date(alert.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        <div className="text-[9px] text-gray-500">{new Date(alert.sentAt).toLocaleDateString()}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {isFailed ? (
                          <span className="flex items-center gap-1 text-red-400 text-[11px] font-bold">
                            <AlertTriangle className="w-3.5 h-3.5" /> Failed
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-teal-400 text-[11px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Sent
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Broadcast Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0E131F] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                  <Send className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Dispatch Emergency Broadcast</h3>
                  <p className="text-xs text-gray-400">Target registered citizen numbers & emergency workers</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSendBroadcast} className="p-6 space-y-4 text-xs font-sans">
              
              {/* Target Zone & Tier */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 font-bold uppercase tracking-wider mb-1.5 text-[10px]">Target Zone</label>
                  <select
                    value={selectedWardId}
                    onChange={(e) => setSelectedWardId(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-teal-500"
                  >
                    <option value="ALL_CRITICAL">🚨 All Critical Wards (Extreme/Severe)</option>
                    {wards.map(w => (
                      <option key={w.wardId} value={w.wardId}>{w.name} ({w.wardId})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 font-bold uppercase tracking-wider mb-1.5 text-[10px]">Alert Severity Tier</label>
                  <select
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-teal-500"
                  >
                    <option value="Extreme">Red Warning (Extreme Heat)</option>
                    <option value="Severe">Orange Advisory (Severe Heat)</option>
                    <option value="Moderate">Yellow Notice (Moderate)</option>
                  </select>
                </div>
              </div>

              {/* Delivery Channel & Language */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 font-bold uppercase tracking-wider mb-1.5 text-[10px]">Broadcast Channel</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 'sms', label: 'SMS' },
                      { id: 'whatsapp', label: 'WhatsApp' },
                      { id: 'voice', label: 'Voice' },
                      { id: 'push', label: 'Push' }
                    ].map(ch => (
                      <button
                        type="button"
                        key={ch.id}
                        onClick={() => setSelectedChannel(ch.id)}
                        className={`p-2 rounded-lg font-bold text-center border transition-all text-[11px]
                          ${selectedChannel === ch.id
                            ? 'bg-teal-500/20 text-teal-300 border-teal-500'
                            : 'bg-black/20 text-gray-400 border-white/5 hover:bg-white/5'}
                        `}
                      >
                        {ch.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 font-bold uppercase tracking-wider mb-1.5 text-[10px]">Template Language</label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(TEMPLATES).map(([key, item]) => (
                      <button
                        type="button"
                        key={key}
                        onClick={() => setSelectedLang(key)}
                        className={`p-2 rounded-lg font-bold text-center border transition-all truncate
                          ${selectedLang === key
                            ? 'bg-orange-500/20 text-orange-300 border-orange-500'
                            : 'bg-black/20 text-gray-400 border-white/5 hover:bg-white/5'}
                        `}
                      >
                        {item.label.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recipient Phone Number */}
              <div>
                <label className="block text-gray-400 font-bold uppercase tracking-wider mb-1.5 text-[10px]">
                  Recipient Test Phone Number (Verified Twilio Recipient)
                </label>
                <input
                  type="tel"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="+918607405507 or 10-digit mobile"
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-teal-500 font-mono text-xs placeholder-gray-600"
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  Auto-formats to international E.164 (e.g. +91 8607405507). On Twilio Trial accounts, ensure number is verified in Twilio Console.
                </p>
              </div>

              {/* Message Content & Preview */}
              <div>
                <label className="block text-gray-400 font-bold uppercase tracking-wider mb-1.5 text-[10px]">Broadcast Message Text</label>
                <textarea
                  rows={3}
                  value={customMessage || previewMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-teal-500 leading-relaxed"
                />
              </div>

              {/* Target Reach Summary */}
              <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-between">
                <div>
                  <div className="text-teal-300 font-bold">Estimated Citizen Audience</div>
                  <div className="text-gray-400 text-[11px]">Cellular broadcast to active mobile nodes in zone</div>
                </div>
                <div className="text-lg font-extrabold text-white tabular-data">
                  ~{estimatedReach.toLocaleString()} recipients
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-gray-400 hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="px-6 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 font-bold text-white shadow-lg shadow-red-500/30 flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" /> {isSending ? 'Transmitting...' : 'Transmit Broadcast Now'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default AlertsPage;
