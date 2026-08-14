import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Gauge, MapPinned, Bell, LineChart, HousePlus, Ambulance, Users, Phone, X, MapPin,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';

const NAV_ITEMS = [
  { section: 'MAIN', items: [
    { icon: Gauge, label: 'Dashboard', active: true },
    { icon: MapPinned, label: 'Risk Map' },
    { icon: Bell, label: 'Alerts', badge: true },
    { icon: LineChart, label: 'Analytics' },
  ]},
  { section: 'RESPONSE', items: [
    { icon: HousePlus, label: 'Safe Shelters' },
    { icon: Ambulance, label: 'Emergency Services' },
    { icon: Users, label: 'Citizen Reports' },
  ]},
];

function Sidebar({ open, onClose }) {
  const { wards, alerts } = useApp();
  const { showToast } = useToast();

  const alertCount = alerts.filter(a => a.status === 'sent').length;

  const handleNavClick = (label) => {
    showToast(`${label} view coming soon`, 'info');
  };

  const handleEmergencyCall = () => {
    showToast('Emergency services: Dial 112', 'warning');
    setTimeout(() => {
      window.location.href = 'tel:112';
    }, 1000);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Sidebar panel */}
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed top-0 left-0 h-full w-72 bg-[#0B0E14] border-r border-white/10 z-50 flex flex-col font-sans overflow-y-auto"
          >
            {/* Close button */}
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-teal-400" /> Jaipur, Rajasthan
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nav sections */}
            <nav className="flex-1 px-3 py-4">
              {NAV_ITEMS.map((section) => (
                <div key={section.section} className="mb-5">
                  <p className="px-3 mb-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    {section.section}
                  </p>
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        onClick={() => handleNavClick(item.label)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors mb-1
                          ${item.active
                            ? 'bg-teal-500/15 text-teal-300 border border-teal-500/20'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                        `}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.badge && alertCount > 0 && (
                          <span className="text-[10px] font-bold bg-red-500 text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                            {alertCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>

            {/* Emergency call box */}
            <div className="p-4 border-t border-white/10">
              <div className="glass-panel p-4 flex items-center gap-3 border-red-500/20" style={{ background: 'rgba(239,68,68,0.08)' }}>
                <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-red-400" />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-bold text-red-300 uppercase tracking-wider">Emergency</div>
                  <div className="text-lg font-bold text-white tabular-data">112</div>
                </div>
                <button
                  onClick={handleEmergencyCall}
                  className="px-3 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-colors shrink-0"
                >
                  CALL
                </button>
              </div>
              <div className="mt-3 text-[10px] text-gray-500 text-center">
                Monitoring {wards.length} wards across Jaipur
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default Sidebar;
