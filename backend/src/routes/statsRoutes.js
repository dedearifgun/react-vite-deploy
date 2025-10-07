const express = require('express');
const { getTotals, getToday, getDaily } = require('../controllers/statsController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all stats endpoints for staff/admin
router.get('/totals', protect, authorize('staff', 'admin'), getTotals);
router.get('/today', protect, authorize('staff', 'admin'), getToday);
router.get('/daily', protect, authorize('staff', 'admin'), getDaily);

module.exports = router;