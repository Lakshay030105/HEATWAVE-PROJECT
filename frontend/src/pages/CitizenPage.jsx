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

        {/* Hero Section */}
        <div className="text-center py-6 mb-2">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight mb-4"
          >
            Jaipur Heatwave Alert System
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto font-medium"
          >
            Stay informed, stay safe. Check your ward's heat risk, locate cooling centers, and report infrastructure issues directly to city authorities.
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
