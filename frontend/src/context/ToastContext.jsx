import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

const ToastContext = createContext();

const ICONS = {
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
};

const COLORS = {
  success: { text: '#2DD4BF', border: 'rgba(45,212,191,0.3)', bg: 'rgba(45,212,191,0.12)' },
  warning: { text: '#FB7A3C', border: 'rgba(251,122,60,0.3)', bg: 'rgba(251,122,60,0.12)' },
  info: { text: '#94a3b8', border: 'rgba(148,163,184,0.25)', bg: 'rgba(148,163,184,0.1)' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[10000] flex flex-col gap-2 items-end font-sans pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = ICONS[t.type] || Info;
            const c = COLORS[t.type] || COLORS.info;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl backdrop-blur-md shadow-lg text-sm font-semibold"
                style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text, boxShadow: '0 8px 32px 0 rgba(0,0,0,0.37)' }}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="text-gray-100">{t.message}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

export default ToastContext;
