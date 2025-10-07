const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const { getLogs } = require('../controllers/logController');

const router = express.Router();

router.get('/', protect, authorize('admin', 'staff'), getLogs);

module.exports = router;