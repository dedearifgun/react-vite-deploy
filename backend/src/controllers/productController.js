const Product = require('../models/productModel');
const path = require('path');
const fs = require('fs');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    let query = {};

    // Filter by gender
    if (req.query.gender) {
      query.gender = req.query.gender;
    }

    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter by featured
    if (req.query.featured) {
      query.featured = req.query.featured === 'true';
    }

    // Search by name or description
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Price range filter
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : null;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : null;
    if (minPrice !== null || maxPrice !== null) {
      query.price = {};
      if (minPrice !== null) query.price.$gte = minPrice;
      if (maxPrice !== null) query.price.$lte = maxPrice;
    }

    // Size and color filters (single or comma-separated values)
    const sizeParam = req.query.size;
    const colorParam = req.query.color;
    if (sizeParam) {
      const sizes = String(sizeParam).split(',').map(s => s.trim()).filter(Boolean);
      query.sizes = { $in: sizes };
    }
    if (colorParam) {
      const colors = String(colorParam).split(',').map(c => c.trim()).filter(Boolean);
      query.colors = { $in: colors };
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Product.countDocuments(query);

    // Sorting
    const sortKey = (req.query.sort || 'newest').toLowerCase();
    let sortObj = { createdAt: -1 };
    switch (sortKey) {
      case 'oldest':
        sortObj = { createdAt: 1 };
        break;
      case 'price_asc':
        sortObj = { price: 1 };
        break;
      case 'price_desc':
        sortObj = { price: -1 };
        break;
      case 'name_asc':
        sortObj = { name: 1 };
        break;
      case 'name_desc':
        sortObj = { name: -1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .skip(startIndex)
      .limit(limit)
      .sort(sortObj);

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: products.length,
      pagination,
      total,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mendapatkan produk',
      error: error.message
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'category',
      'name slug'
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mendapatkan produk',
      error: error.message
    });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Admin)
exports.createProduct = async (req, res) => {
  try {
    // URL gambar utama, tambahan, dan per warna sudah dinormalisasi di middleware
    // Normalisasi field array dan angka
    try {
      if (req.body.sizesJson) {
        req.body.sizes = JSON.parse(req.body.sizesJson);
      }
      if (req.body.colorsJson) {
        req.body.colors = JSON.parse(req.body.colorsJson);
      }
      if (req.body.variantsJson) {
        req.body.variants = JSON.parse(req.body.variantsJson);
      }
    } catch (_) {}
    if (typeof req.body.price === 'string') req.body.price = Number(req.body.price);
    if (typeof req.body.stock === 'string') req.body.stock = Number(req.body.stock);
    if (Array.isArray(req.body.variants)) {
      req.body.variants = req.body.variants.map(v => ({
        sku: String(v.sku || '').trim(),
        size: String(v.size || '').trim(),
        color: String(v.color || '').trim(),
        stock: Number(v.stock || 0),
        priceDelta: Number(v.priceDelta || 0)
      }));
      // Hitung stok total dari varian
      req.body.stock = req.body.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
    }

    // Auto-generate product code if missing
    const generateProductCode = async () => {
      let code;
      do {
        const ts = Date.now().toString(36).toUpperCase();
        const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
        code = `PRD-${ts}-${rand}`;
      } while (await Product.exists({ code }));
      return code;
    };

    if (!req.body.code || !req.body.code.trim()) {
      req.body.code = await generateProductCode();
    }

    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal membuat produk',
      error: error.message
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin)
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan'
      });
    }

    // Normalisasi field array dan angka
    try {
      if (req.body.sizesJson) {
        req.body.sizes = JSON.parse(req.body.sizesJson);
      }
      if (req.body.colorsJson) {
        req.body.colors = JSON.parse(req.body.colorsJson);
      }
      if (req.body.variantsJson) {
        req.body.variants = JSON.parse(req.body.variantsJson);
      }
    } catch (_) {}
    if (typeof req.body.price === 'string') req.body.price = Number(req.body.price);
    if (typeof req.body.stock === 'string') req.body.stock = Number(req.body.stock);
    if (Array.isArray(req.body.variants)) {
      req.body.variants = req.body.variants.map(v => ({
        sku: String(v.sku || '').trim(),
        size: String(v.size || '').trim(),
        color: String(v.color || '').trim(),
        stock: Number(v.stock || 0),
        priceDelta: Number(v.priceDelta || 0)
      }));
      req.body.stock = req.body.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
    }

    // Jika ada gambar utama baru (di-set oleh middleware), hapus gambar lama
    if (req.body.imageUrl && product.imageUrl && product.imageUrl.startsWith('/uploads/')) {
      const oldImagePath = path.join(__dirname, '../..', product.imageUrl);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengupdate produk',
      error: error.message
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan'
      });
    }

    // Delete image if exists
    if (product.imageUrl && product.imageUrl.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, '../..', product.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Produk berhasil dihapus'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus produk',
      error: error.message
    });
  }
};
