import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Gauge, MapPinned, Bell, LineChart, HousePlus, Ambulance, Users, Phone, X, MapPin,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import AarogyaBrand from '../Logo/Logo';

const NAV_ITEMS = [
  { section: 'MAIN', items: [
    { icon: Gauge, label: 'Dashboard', path: '/' },
    { icon: MapPinned, label: 'Risk Map', path: '/map' },
    { icon: Bell, label: 'Alerts', path: '/alerts', badgeKey: 'alerts' },
    { icon: LineChart, label: 'Analytics', path: '/analytics' },
  ]},
  { section: 'RESPONSE', items: [
    { icon: HousePlus, label: 'Safe Shelters', path: '/shelters' },
    { icon: Ambulance, label: 'Emergency Services', path: '/emergency' },
    { icon: Users, label: 'Citizen Reports', path: '/reports', badgeKey: 'reports' },
  ]},
];

function Sidebar({ open, onClose }) {
  const { wards, alerts, reports } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const alertCount = alerts.filter(a => a.status === 'sent').length;
  const pendingReportsCount = reports.filter(r => r.status === 'pending').length;

  const handleNavClick = (path, label) => {
    navigate(path);
    onClose();
  };

  const handleEmergencyCall = () => {
    showToast('Connecting to Disaster Control Room: 112', 'warning');
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
          />

          {/* Sidebar panel */}
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed top-0 left-0 h-full w-72 bg-[#0B0E14] border-r border-white/10 z-[9999] flex flex-col font-sans overflow-y-auto"
          >
            {/* Header with Logo */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <AarogyaBrand size="sm" />
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                aria-label="Close menu"
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
                    const isActive = location.pathname === item.path;
                    const badgeCount = item.badgeKey === 'alerts' ? alertCount : item.badgeKey === 'reports' ? pendingReportsCount : 0;

                    return (
                      <button
                        key={item.label}
                        onClick={() => handleNavClick(item.path, item.label)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors mb-1
                          ${isActive
                            ? 'bg-teal-500/15 text-teal-300 border border-teal-500/20 font-bold'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                        `}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-400' : ''}`} />
                        <span className="flex-1 text-left">{item.label}</span>
                        {badgeCount > 0 && (
                          <span className={`text-[10px] font-bold text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center
                            ${item.badgeKey === 'alerts' ? 'bg-red-500' : 'bg-yellow-500 text-black'}
                          `}>
                            {badgeCount}
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
