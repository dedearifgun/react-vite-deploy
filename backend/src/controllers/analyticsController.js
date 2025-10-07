const { logAudit } = require('../utils/audit');

// @desc    Record WhatsApp checkout click
// @route   POST /api/analytics/wa-click
// @access  Public
exports.recordWhatsAppClick = async (req, res) => {
  try {
    const body = req.body || {};

    // Helpers untuk validasi & sanitasi sederhana
    const str = (v, maxLen = 120, fallback = null) => {
      if (v == null) return fallback;
      const s = String(v).trim();
      if (!s) return fallback;
      return s.length > maxLen ? s.slice(0, maxLen) : s;
    };
    const int = (v, fallback = null, min = 0, max = 1000) => {
      if (v == null) return fallback;
      const n = Number(v);
      if (!Number.isFinite(n)) return fallback;
      const clamped = Math.max(min, Math.min(max, Math.floor(n)));
      return clamped;
    };

    const payload = {
      source: str(body.source, 40, 'unknown'),
      productId: body.productId != null ? str(body.productId, 64, null) : null,
      productName: str(body.productName, 160, null),
      itemsCount: int(body.itemsCount, null, 0, 500),
      cartCount: int(body.cartCount, null, 0, 500),
      page: str(body.page, 200, null),
    };

    // Validasi tipe minimal
    if (payload.itemsCount != null && !Number.isInteger(payload.itemsCount)) {
      return res.status(400).json({ success: false, message: 'itemsCount harus bilangan bulat' });
    }
    if (payload.cartCount != null && !Number.isInteger(payload.cartCount)) {
      return res.status(400).json({ success: false, message: 'cartCount harus bilangan bulat' });
    }

    // Catat ke audit log; user publik boleh null
    await logAudit(req, {
      action: 'whatsapp_click',
      model: 'Checkout',
      itemId: payload.productId ? String(payload.productId) : 'cart',
      details: payload,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mencatat klik WhatsApp', error: error.message });
  }
};