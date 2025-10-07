const AuditLog = require('../models/auditLogModel');

// @desc    Get audit logs
// @route   GET /api/logs
// @access  Private (Admin/Staff)
exports.getLogs = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 200, 500);

    // Filter optional: start & end date (YYYY-MM-DD) and action/model
    const query = {};
    const { start, end, action, model } = req.query || {};

    // Date range
    if (start || end) {
      const cond = {};
      if (start) {
        const s = new Date(start);
        if (!isNaN(s.getTime())) {
          s.setHours(0, 0, 0, 0);
          cond.$gte = s;
        }
      }
      if (end) {
        const e = new Date(end);
        if (!isNaN(e.getTime())) {
          e.setHours(0, 0, 0, 0);
          const endExclusive = new Date(e.getTime() + 24 * 60 * 60 * 1000);
          cond.$lt = endExclusive;
        }
      }
      if (Object.keys(cond).length > 0) {
        query.createdAt = cond;
      }
    }

    if (action) query.action = action;
    if (model) query.model = model;

    const logs = await AuditLog.find(query).sort({ createdAt: -1 }).limit(limit);

    // Bentuk respons agar cocok dengan konsumsi UI saat ini
    const data = logs.map((l) => ({
      _id: l._id,
      timestamp: l.createdAt,
      actor: l.username || (l.userId ? String(l.userId) : '-'),
      role: l.role || '-',
      action: l.action,
      entity: l.model,
      objectId: l.itemId,
      method: l.method,
      path: l.path,
      details: l.details,
    }));

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil log', error: error.message });
  }
};