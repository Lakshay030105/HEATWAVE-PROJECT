const Ward = require('../models/Ward');
const Feedback = require('../models/Feedback');

const VALID_REPORT_TYPES = ['heat_illness', 'infrastructure_issue', 'general'];
const VALID_SEVERITIES = ['mild', 'moderate', 'severe'];

exports.submitFeedback = async (req, res, next) => {
  try {
    const { wardId, reportType, description, severity, contactPhone } = req.body;

    if (!wardId || !reportType || !severity) {
      return res.status(400).json({
        success: false,
        message: 'wardId, reportType, and severity are required',
      });
    }

    if (!VALID_REPORT_TYPES.includes(reportType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reportType. Use heat_illness, infrastructure_issue, or general',
      });
    }

    if (!VALID_SEVERITIES.includes(severity)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid severity. Use mild, moderate, or severe',
      });
    }

    if (description && description.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Description must be 500 characters or fewer',
      });
    }

    const wardExists = await Ward.findOne({ wardId }).lean();
    if (!wardExists) {
      return res.status(404).json({ success: false, message: 'Ward not found' });
    }

    const feedback = await Feedback.create({
      wardId,
      reportType,
      description: description || '',
      severity,
      contactPhone: contactPhone || undefined,
    });

    res.status(201).json({ success: true, id: feedback._id });
  } catch (err) {
    console.error('Error submitting feedback:', err);
    res.status(500).json({ success: false, message: 'Server error submitting feedback' });
    if (next) next(err);
  }
};
