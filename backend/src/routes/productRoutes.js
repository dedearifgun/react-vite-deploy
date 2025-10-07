const express = require('express');
const {
  getProducts,
  getProduct,
  getProductByCode,
  createProduct,
  updateProduct,
  deleteProduct,
  reorderProducts
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadProductImage, uploadProductImages } = require('../middleware/uploadMiddleware');

const router = express.Router();

router
  .route('/')
  .get(getProducts)
  .post(protect, authorize('admin', 'staff'), uploadProductImages, createProduct);

// Stable slug by product code
router.get('/by-code/:code', getProductByCode);

// Reorder products
router.put('/reorder', protect, authorize('admin', 'staff'), reorderProducts);

router
  .route('/:id')
  .get(getProduct)
  .put(protect, authorize('admin', 'staff'), uploadProductImages, updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

module.exports = router;