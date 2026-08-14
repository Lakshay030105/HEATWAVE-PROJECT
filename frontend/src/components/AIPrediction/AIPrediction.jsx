import React, { useMemo } from 'react';
import { Brain, Sparkles, Cpu, Activity } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { useMLPrediction } from '../../hooks/useMLPrediction';

const TIER_RANK = { Low: 0, Moderate: 1, Severe: 2, Extreme: 3 };
const TIER_ADVICE = {
  Extreme: 'Activate all heat shelters and hydration points immediately; issue extreme-heat SMS alerts to vulnerable populations.',
  Severe: 'Open cooling centers and dispatch water tankers to high-density zones showing rising heat stress.',
  Moderate: 'Monitor forecasts closely; pre-position resources near wards trending toward Severe.',
  Low: 'No immediate action required. Continue routine monitoring.',
};

function AIPrediction() {
  const { wards, selectedWard } = useApp();
  const { showToast } = useToast();

  const activeWard = useMemo(() => {
    if (selectedWard) return selectedWard;
    if (!wards.length) return null;
    return wards.reduce((worst, w) => {
      const t = w.latestRisk?.riskTier || 'Low';
      if (!worst) return w;
      return TIER_RANK[t] > TIER_RANK[worst.latestRisk?.riskTier || 'Low'] ? w : worst;
    }, null);
  }, [wards, selectedWard]);

  // Hook connecting directly to live Python XGBoost model on port 8000
  const { predictionData, isPredicting } = useMLPrediction(activeWard);

  const tier = activeWard?.latestRisk?.riskTier || 'Low';
  const hvi = activeWard?.latestRisk?.hvi ?? 0;
  const color = { Extreme: '#EF4444', Severe: '#FB7A3C', Moderate: '#FBBF24', Low: '#2DD4BF' }[tier];

  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (hvi / 100) * circumference;

  const mlPredictionText = predictionData?.prediction || `${tier} Risk Forecast`;
  const mlLiveTemp = predictionData?.temperature_celsius ?? activeWard?.latestRisk?.forecastTempC ?? 39.5;

  const handleRecommendation = () => {
    showToast(TIER_ADVICE[tier], tier === 'Extreme' || tier === 'Severe' ? 'warning' : 'info');
  };

  return (
    <div className="glass-panel p-5 font-sans flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-500/15 border border-purple-500/25 flex items-center justify-center">
              <Brain className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                AI ML Risk Engine <span className="text-[10px] text-teal-400 font-mono font-normal">● Live</span>
              </h3>
              <p className="text-[11px] text-gray-500">{activeWard?.name || 'Jaipur Ward'}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 font-mono">
            <Cpu className="w-3 h-3" /> {isPredicting ? 'Inferring...' : 'XGBoost v1'}
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
              <span className="text-[9px] text-gray-500 uppercase tracking-wider">HVI Index</span>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-white">Live Prediction:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase
                ${mlPredictionText.includes('Extreme') ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  mlPredictionText.includes('Mild') || mlPredictionText.includes('Moderate') || mlPredictionText.includes('Severe') ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                  'bg-teal-500/20 text-teal-300 border border-teal-500/30'}
              `}>
                {mlPredictionText}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Target Ward: <strong>{activeWard?.name}</strong>. Ambient model sensor reading: <strong>{mlLiveTemp}°C</strong>.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={handleRecommendation}
        className="w-full h-10 flex items-center justify-center gap-2 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-200 border border-purple-400/30 cursor-pointer"
      >
        <Sparkles className="w-3.5 h-3.5" /> View AI Protocol Recommendation
      </button>
    </div>
  );
}

export default AIPrediction;

