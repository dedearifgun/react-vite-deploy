const express = require('express');
const { recordWhatsAppClick } = require('../controllers/analyticsController');
const rateLimit = require('../middleware/rateLimit');

const router = express.Router();

// Public endpoint to track WhatsApp click with IP rate limit (30 req/min)
const waClickLimiter = rateLimit({ windowMs: 60_000, max: 30 });
router.post('/wa-click', waClickLimiter, recordWhatsAppClick);

module.exports = router;