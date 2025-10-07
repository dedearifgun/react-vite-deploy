const AuditLog = require('../models/auditLogModel');

// Sanitasi details: hapus PII umum, batasi panjang string, dan ukuran total
function sanitizeDetails(details) {
  if (details == null) return undefined;
  const MAX_VALUE_LEN = 256;
  const MAX_TOTAL_LEN = 2000; // berdasarkan JSON.stringify
  const PII_KEYS = new Set(['email', 'phone', 'tel', 'address', 'password', 'token', 'ip']);

  const out = {};
  try {
    Object.entries(details).forEach(([k, v]) => {
      if (PII_KEYS.has(String(k).toLowerCase())) return; // drop PII
      let val = v;
      if (typeof val === 'string') {
        val = val.length > MAX_VALUE_LEN ? val.slice(0, MAX_VALUE_LEN) : val;
      }
      // Hindari objek dalam (flatten sederhana)
      if (typeof val === 'object' && val !== null) {
        try {
          const s = JSON.stringify(val);
          val = s.length > MAX_VALUE_LEN ? s.slice(0, MAX_VALUE_LEN) : s;
        } catch (_) {
          val = '[object]';
        }
      }
      out[k] = val;
    });

    // Jika ukuran total masih terlalu besar, ringkas menjadi daftar key saja
    const serialized = JSON.stringify(out);
    if (serialized.length > MAX_TOTAL_LEN) {
      const keys = Object.keys(out).slice(0, 20);
      return { summary: 'details trimmed (too large)', keys };
    }
  } catch (_) {
    return undefined;
  }
  return out;
}

exports.logAudit = async (req, { action, model, itemId, details = {} }) => {
  try {
    const user = req.user || null;
    await AuditLog.create({
      userId: user?._id,
      username: user?.username,
      role: user?.role,
      action,
      model,
      itemId,
      path: req.originalUrl,
      method: req.method,
      details: sanitizeDetails(details),
    });
  } catch (err) {
    // Swallow audit errors to avoid blocking main flow
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Audit log failed:', err?.message);
    }
  }
};