const Ward = require('../models/Ward');
const Feedback = require('../models/Feedback');

const VALID_REPORT_TYPES = ['heat_illness', 'infrastructure_issue', 'general', 'water_shortage'];
const VALID_SEVERITIES = ['mild', 'moderate', 'severe'];

// 1. Fetch all citizen feedback / reports
exports.getFeedback = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.wardId) query.wardId = req.query.wardId;
    if (req.query.status) query.status = req.query.status;

    const reports = await Feedback.find(query)
      .sort({ reportedAt: -1 })
      .limit(100)
      .lean();

    res.status(200).json({ success: true, data: reports });
  } catch (err) {
    console.error('Error fetching feedback:', err);
    if (next) return next(err);
    res.status(500).json({ success: false, message: 'Server error fetching feedback' });
  }
};

// 2. Submit citizen feedback / report
exports.submitFeedback = async (req, res, next) => {
  try {
    const { wardId, reportType, description, severity, contactPhone, location } = req.body;

    if (!wardId || !reportType || !severity) {
      return res.status(400).json({
        success: false,
        message: 'wardId, reportType, and severity are required',
      });
    }

    const normalizedSeverity = String(severity).toLowerCase();
    const normalizedReportType = String(reportType).toLowerCase();

    if (!VALID_REPORT_TYPES.includes(normalizedReportType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reportType. Use heat_illness, infrastructure_issue, water_shortage, or general',
      });
    }

    if (!VALID_SEVERITIES.includes(normalizedSeverity)) {
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
      reportType: normalizedReportType,
      description: description || '',
      severity: normalizedSeverity,
      location: location || wardExists.name || '',
      contactPhone: contactPhone || undefined,
    });

    res.status(201).json({ success: true, id: feedback._id });
  } catch (err) {
    console.error('Error submitting feedback:', err);
    if (next) return next(err);
    res.status(500).json({ success: false, message: 'Server error submitting feedback' });
  }
};

// 3. Update report status or resolution note
exports.updateFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, resolutionNote } = req.body;

    const updateFields = {};
    if (status !== undefined) updateFields.status = status;
    if (resolutionNote !== undefined) updateFields.resolutionNote = resolutionNote;

    const updated = await Feedback.findByIdAndUpdate(id, updateFields, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Feedback report not found' });
    }

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error('Error updating feedback:', err);
    if (next) return next(err);
    res.status(500).json({ success: false, message: 'Server error updating feedback' });
  }
};

