const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadDbFile } = require('../middleware/dbUploadMiddleware');
const { getInfo, exportDatabase, exportDatabaseZip, importDatabase, getProgress } = require('../controllers/dbController');

const router = express.Router();

// Info database & collections
router.get('/info', protect, authorize('admin'), getInfo);

// Export seluruh database (JSON)
router.post('/export', protect, authorize('admin'), exportDatabase);

// Export database + uploads sebagai ZIP
router.post('/export-zip', protect, authorize('admin'), exportDatabaseZip);

// Import dari file JSON; body: replaceExisting=true|false
router.post('/import', protect, authorize('admin'), uploadDbFile, importDatabase);

// Polling progress job
router.get('/progress/:jobId', protect, authorize('admin'), getProgress);

module.exports = router;