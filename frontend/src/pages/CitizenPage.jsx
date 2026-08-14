import React from 'react';
import CitizenView from '../components/CitizenView/CitizenView';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { AlertTriangle, Info } from 'lucide-react';

function CitizenPage() {
  const { wards } = useApp();

  // Check if there are any active severe/extreme alerts
  const criticalWards = wards.filter(w => w.latestRisk?.riskTier === 'Extreme' || w.latestRisk?.riskTier === 'Severe');
  const hasAlerts = criticalWards.length > 0;

  return (
    <div className="relative min-h-[calc(100vh-72px)] overflow-hidden font-sans">
      
      {/* Animated Heat Shimmer Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 via-red-500/5 to-transparent"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')]"
          style={{ backgroundSize: '4px 4px' }}
        />
      </div>

      <div className="relative z-10 max-w-[1400px] w-full mx-auto px-6 py-8 flex flex-col gap-6">
        
        {/* Global Alert Banner */}
        {hasAlerts && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-[var(--radius-sm)] p-4 flex items-start gap-3 backdrop-blur-md shadow-lg"
          >
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-red-400 font-bold text-sm mb-1 uppercase tracking-wider">Heat Alert Active</h4>
              <p className="text-gray-300 text-sm">
                Severe heatwave conditions are active in {criticalWards.length} ward{criticalWards.length > 1 ? 's' : ''}. Please check your local risk below and locate your nearest cooling center. If experiencing medical distress, dial 108 immediately.
              </p>
            </div>
          </motion.div>
        )}

        {/* Hero Section with Aarogya Chhaya Emblem */}
        <div className="text-center py-6 mb-2 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-20 h-20 rounded-full overflow-hidden border-2 border-orange-500/40 shadow-xl shadow-orange-500/20 mb-4"
          >
            <img src="/logo-emblem.jpg" alt="Aarogya Chhaya" className="w-full h-full object-cover" />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2"
          >
            <span className="text-white">AAROGYA </span>
            <span className="text-teal-400">CHHAYA</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-xs font-mono font-bold tracking-widest text-orange-400 uppercase mb-3"
          >
            Data-Driven Thermal Mitigation · Jaipur Region
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Stay informed, stay protected. Check real-time ward heat risk, locate nearest cooling shelters & hydration points, and report ground incidents directly.
          </motion.p>
        </div>

        {/* Main Content Area */}
        <CitizenView />
        
        {/* Footer info */}
        <div className="text-center mt-12 flex flex-col items-center justify-center gap-2 text-gray-500 text-xs">
          <div className="flex items-center gap-1.5"><Info className="w-4 h-4"/> This is an official early warning system prototype.</div>
          <div>For immediate medical assistance, always dial 108.</div>
        </div>

      </div>
    </div>
  );
}

export default CitizenPage;
