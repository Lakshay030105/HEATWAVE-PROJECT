import React, { useMemo } from 'react';
import { Brain, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';

const TIER_RANK = { Low: 0, Moderate: 1, Severe: 2, Extreme: 3 };
const TIER_ADVICE = {
  Extreme: 'Activate all heat shelters and hydration points immediately; issue extreme-heat SMS alerts to vulnerable populations.',
  Severe: 'Open cooling centers and dispatch water tankers to high-density zones showing rising heat stress.',
  Moderate: 'Monitor forecasts closely; pre-position resources near wards trending toward Severe.',
  Low: 'No immediate action required. Continue routine monitoring.',
};

function AIPrediction() {
  const { wards } = useApp();
  const { showToast } = useToast();

  const worstWard = useMemo(() => {
    if (!wards.length) return null;
    return wards.reduce((worst, w) => {
      const t = w.latestRisk?.riskTier || 'Low';
      if (!worst) return w;
      return TIER_RANK[t] > TIER_RANK[worst.latestRisk?.riskTier || 'Low'] ? w : worst;
    }, null);
  }, [wards]);

  const tier = worstWard?.latestRisk?.riskTier || 'Low';
  const hvi = worstWard?.latestRisk?.hvi ?? 0;
  const color = { Extreme: '#EF4444', Severe: '#FB7A3C', Moderate: '#FBBF24', Low: '#2DD4BF' }[tier];

  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (hvi / 100) * circumference;

  const handleRecommendation = () => {
    showToast(TIER_ADVICE[tier], tier === 'Extreme' || tier === 'Severe' ? 'warning' : 'info');
  };

  return (
    <div className="glass-panel p-5 font-sans">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-purple-500/15 border border-purple-500/25 flex items-center justify-center">
          <Brain className="w-4 h-4 text-purple-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">AI Risk Prediction</h3>
          <p className="text-[11px] text-gray-500">Next 6 hours</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-20 h-20 shrink-0">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
            <circle
              cx="40" cy="40" r={radius} fill="none" stroke={color} strokeWidth="7"
              strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.6s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-white tabular-data">{hvi}%</span>
            <span className="text-[9px] text-gray-500 uppercase tracking-wider">Risk</span>
          </div>
        </div>
        <div className="min-w-0">
          <div className="text-xs font-bold text-white">Heatwave probability</div>
          <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
            AI model flags {worstWard?.name || 'central Jaipur'} as highest heat-stress risk.
          </p>
        </div>
      </div>

      <button
        onClick={handleRecommendation}
        className="w-full h-10 flex items-center justify-center gap-2 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-200 border border-purple-400/30"
      >
        <Sparkles className="w-3.5 h-3.5" /> View AI Recommendation
      </button>
    </div>
  );
}

export default AIPrediction;
