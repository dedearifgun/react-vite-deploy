const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const AuditLog = require('../models/auditLogModel');

// Helper: get start of day (server local timezone)
function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// @desc    Get totals for products and categories
// @route   GET /api/stats/totals
// @access  Private (Admin/Staff)
exports.getTotals = async (req, res) => {
  try {
    const [totalProducts, totalCategories] = await Promise.all([
      Product.countDocuments({}),
      Category.countDocuments({}),
    ]);
    res.status(200).json({ success: true, data: { totalProducts, totalCategories } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil total statistik', error: error.message });
  }
};

// @desc    Get today counts for product/category creations and whatsapp clicks
// @route   GET /api/stats/today
// @access  Private (Admin/Staff)
exports.getToday = async (req, res) => {
  try {
    const start = startOfDay();
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

    const [productsCreated, categoriesCreated, whatsappClicks] = await Promise.all([
      Product.countDocuments({ createdAt: { $gte: start, $lt: end } }),
      Category.countDocuments({ createdAt: { $gte: start, $lt: end } }),
      AuditLog.countDocuments({ action: 'whatsapp_click', createdAt: { $gte: start, $lt: end } }),
    ]);

    // Gunakan nama field yang diharapkan frontend
    res.status(200).json({ success: true, data: { productsCreated, categoriesCreated, whatsappClicks } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil statistik hari ini', error: error.message });
  }
};

// @desc    Get daily series
// @route   GET /api/stats/daily
// @query   days? (fallback, max 366) OR start=YYYY-MM-DD&end=YYYY-MM-DD
// @query   metric? comma separated: whatsapp_click,products,categories,logs (default: all)
// @access  Private (Admin/Staff)
exports.getDaily = async (req, res) => {
  try {
    // Determine range
    let start, endExclusive;
    if (req.query.start && req.query.end) {
      const s = new Date(req.query.start);
      const e = new Date(req.query.end);
      if (isNaN(s.getTime()) || isNaN(e.getTime())) {
        return res.status(400).json({ success: false, message: 'Parameter start/end tidak valid' });
      }
      start = startOfDay(s);
      const endDay = startOfDay(new Date(e));
      endExclusive = new Date(endDay.getTime() + 24 * 60 * 60 * 1000);
      // Safety cap: maksimal 366 hari
      const rangeDays = Math.ceil((endExclusive - start) / (24 * 60 * 60 * 1000));
      if (rangeDays > 366) {
        endExclusive = new Date(start.getTime() + 366 * 24 * 60 * 60 * 1000);
      }
    } else {
      const days = Math.min(Number(req.query.days) || 7, 366);
      endExclusive = new Date(startOfDay().getTime() + 24 * 60 * 60 * 1000);
      start = new Date(endExclusive.getTime() - days * 24 * 60 * 60 * 1000);
    }

    // Pastikan label tanggal menggunakan timezone Asia/Jakarta
    const fmt = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Jakarta' } };

    // Build day list
    const daysList = [];
    const dayFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit'
    });
    for (let t = start.getTime(); t < endExclusive.getTime(); t += 24 * 60 * 60 * 1000) {
      daysList.push(dayFormatter.format(new Date(t)));
    }

    // Metrics selection
    const metricsParam = String(req.query.metric || '').trim();
    const allMetrics = ['products', 'categories', 'whatsapp_click', 'logs'];
    let metrics = allMetrics;
    if (metricsParam) {
      metrics = metricsParam.split(',').map(m => m.trim()).filter(m => allMetrics.includes(m));
      if (metrics.length === 0) metrics = allMetrics;
    }

    // Aggregations based on metrics
    const aggPromises = [];
    const results = {};
    if (metrics.includes('products')) {
      aggPromises.push(Product.aggregate([
        { $match: { createdAt: { $gte: start, $lt: endExclusive } } },
        { $group: { _id: fmt, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]).then(r => { results.products = r; }));
    }
    if (metrics.includes('categories')) {
      aggPromises.push(Category.aggregate([
        { $match: { createdAt: { $gte: start, $lt: endExclusive } } },
        { $group: { _id: fmt, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]).then(r => { results.categories = r; }));
    }
    if (metrics.includes('whatsapp_click')) {
      aggPromises.push(AuditLog.aggregate([
        { $match: { action: 'whatsapp_click', createdAt: { $gte: start, $lt: endExclusive } } },
        { $group: { _id: fmt, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]).then(r => { results.whatsapp_click = r; }));
    }
    // Semua audit log (tanpa filter action): metrik 'logs'
    if (metrics.includes('logs')) {
      aggPromises.push(AuditLog.aggregate([
        { $match: { createdAt: { $gte: start, $lt: endExclusive } } },
        { $group: { _id: fmt, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]).then(r => { results.logs = r; }));
    }

    await Promise.all(aggPromises);

    const toMap = (arr) => Object.fromEntries((arr || []).map((x) => [x._id, x.count]));

    const data = {};
    if (results.products) {
      const prodMap = toMap(results.products);
      const series = daysList.map((d) => ({ date: d, count: prodMap[d] || 0 }));
      data.products = series;
      data.productsCreated = series; // alias untuk kompatibilitas lama
    }
    if (results.categories) {
      const catMap = toMap(results.categories);
      const series = daysList.map((d) => ({ date: d, count: catMap[d] || 0 }));
      data.categories = series;
      data.categoriesCreated = series; // alias lama
    }
    if (results.whatsapp_click) {
      const waMap = toMap(results.whatsapp_click);
      const series = daysList.map((d) => ({ date: d, count: waMap[d] || 0 }));
      data.whatsappClicks = series;
    }
    if (results.logs) {
      const logMap = toMap(results.logs);
      const series = daysList.map((d) => ({ date: d, count: logMap[d] || 0 }));
      data.logs = series;
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil statistik harian', error: error.message });
  }
};