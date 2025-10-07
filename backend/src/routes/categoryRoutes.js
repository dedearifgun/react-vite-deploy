const express = require('express');
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadCategoryImage } = require('../middleware/uploadMiddleware');

const router = express.Router();

router
  .route('/')
  .get(getCategories)
  .post(protect, authorize('admin', 'staff'), uploadCategoryImage, createCategory);

router.put('/reorder', protect, authorize('admin', 'staff'), reorderCategories);

router
  .route('/:id')
  .get(getCategory)
  .put(protect, authorize('admin', 'staff'), uploadCategoryImage, updateCategory)
  .delete(protect, authorize('admin'), deleteCategory);

module.exports = router;