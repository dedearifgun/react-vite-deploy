// Simple in-memory rate limiter by IP
// windowMs: time window in ms, max: max requests per window per key
// keyGenerator: function(req) => key (default: req.ip)
module.exports = function createRateLimiter({ windowMs = 60_000, max = 30, keyGenerator } = {}) {
  const store = new Map(); // key => { count, resetAt }
  const getKey = (req) => {
    try {
      if (typeof keyGenerator === 'function') return keyGenerator(req);
    } catch (_) {}
    return req.ip || req.headers['x-forwarded-for'] || 'unknown';
  };

  return function rateLimiter(req, res, next) {
    const key = getKey(req);
    const now = Date.now();
    let entry = store.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      store.set(key, entry);
    }
    entry.count += 1;
    const remaining = Math.max(0, max - entry.count);
    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(remaining));
    res.setHeader('X-RateLimit-Reset', String(entry.resetAt));
    if (entry.count > max) {
      return res.status(429).json({ success: false, message: 'Terlalu banyak permintaan. Coba lagi nanti.' });
    }
    next();
  };
};