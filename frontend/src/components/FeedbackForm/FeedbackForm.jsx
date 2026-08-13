import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { submitFeedback } from '../../services/api';
import { MessageSquareWarning, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SEVERITY_OPTIONS = [
  { value: 'Mild', color: '#2DD4BF' },
  { value: 'Moderate', color: '#FBBF24' },
  { value: 'Severe', color: '#EF4444' }
];

function FeedbackForm() {
  const { wards } = useApp();
  const [formData, setFormData] = useState({
    wardId: '',
    reportType: 'heat_illness',
    severity: 'Moderate',
    description: '',
    contactPhone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitFeedback(formData);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    }
    setIsSubmitting(false);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="glass-panel p-6 md:p-8 font-sans">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
          <MessageSquareWarning className="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Report an Issue</h2>
          <p className="text-sm text-gray-400 mt-0.5">Help authorities monitor on-the-ground situations.</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-10 text-center"
          >
            <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mb-4 border border-teal-500/30">
              <CheckCircle2 className="w-8 h-8 text-teal-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Report Submitted</h3>
            <p className="text-gray-400 text-sm max-w-xs mx-auto mb-6">Thank you. Your report has been securely routed to the Jaipur Municipal Corporation.</p>
            <button 
              onClick={() => {
                setSubmitted(false);
                setFormData(prev => ({ ...prev, description: '' }));
              }}
              className="px-6 py-2.5 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 transition-colors text-sm font-medium"
            >
              Submit Another Report
            </button>
          </motion.div>
        ) : (
          <motion.form 
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit} 
            className="flex flex-col gap-5"
          >
            {/* Ward Select */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-2 uppercase tracking-wider">
                Ward <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.wardId}
                onChange={(e) => handleChange('wardId', e.target.value)}
                required
                className="app-select cursor-pointer"
              >
                <option value="" className="bg-[#0B0E14] text-gray-400">-- Select Ward --</option>
                {wards.map((w) => (
                  <option key={w.wardId} value={w.wardId} className="bg-[#0B0E14] text-white">
                    {w.name} ({w.wardId})
                  </option>
                ))}
              </select>
            </div>

            {/* Report Type */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-2 uppercase tracking-wider">Report Type</label>
              <select
                value={formData.reportType}
                onChange={(e) => handleChange('reportType', e.target.value)}
                className="app-select cursor-pointer"
              >
                <option value="heat_illness" className="bg-[#0B0E14] text-white">Heat Illness / Medical Emergency</option>
                <option value="infrastructure_issue" className="bg-[#0B0E14] text-white">Water / Power Infrastructure Issue</option>
                <option value="general" className="bg-[#0B0E14] text-white">General Feedback</option>
              </select>
            </div>

            {/* Severity Segmented Control */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-2 uppercase tracking-wider">Severity Level</label>
              <div className="flex bg-black/40 p-1 rounded-lg border border-white/10">
                {SEVERITY_OPTIONS.map(opt => {
                  const isActive = formData.severity === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleChange('severity', opt.value)}
                      className="flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all duration-200"
                      style={isActive ? { color: opt.color, backgroundColor: `${opt.color}20`, border: `1px solid ${opt.color}40` } : { color: '#94a3b8' }}
                    >
                      {opt.value}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-2 uppercase tracking-wider">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea 
                className="w-full p-4 rounded-lg bg-black/40 border border-white/10 text-slate-100 text-sm font-medium focus:border-teal-400 focus:outline-none min-h-[100px] resize-y transition-all"
                placeholder="Describe the situation briefly..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                required
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isSubmitting || !formData.wardId || !formData.description}
              className={`w-full h-12 rounded-lg text-sm font-bold text-white transition-all duration-200 mt-2
                ${isSubmitting || !formData.wardId || !formData.description 
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/10' 
                  : 'bg-gradient-to-r from-teal-500 to-teal-600 shadow-md shadow-teal-500/20 hover:shadow-lg hover:shadow-teal-500/30 border border-teal-400/30'
                }
              `}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Official Report'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

export default FeedbackForm;
