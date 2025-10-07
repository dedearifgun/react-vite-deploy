const Product = require('../models/productModel');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { logAudit } = require('../utils/audit');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    let query = {};

    // Status filter: default only show published for public; admin/staff can see all
    const header = req.headers.authorization || '';
    let isPrivileged = false;
    try {
      if (header.startsWith('Bearer ')) {
        const token = header.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET);
        isPrivileged = true;
      }
    } catch (_) {}

    if (req.query.status) {
      query.status = req.query.status;
    } else if (!isPrivileged) {
      query.status = 'published';
    }

    // Filter by gender
    if (req.query.gender) {
      query.gender = req.query.gender;
    }

    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter by subcategory (optional)
    if (req.query.subcategory) {
      query.subcategory = String(req.query.subcategory).trim();
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
      case 'manual':
        // Urutan manual berdasarkan field order
        sortObj = { order: 1, createdAt: -1 };
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

    // Hide non-published product from public
    const header = req.headers.authorization || '';
    let isPrivileged = false;
    try {
      if (header.startsWith('Bearer ')) {
        const token = header.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET);
        isPrivileged = true;
      }
    } catch (_) {}
    if (!isPrivileged && product.status !== 'published') {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
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

// @desc    Get single product by code (stable slug)
// @route   GET /api/products/by-code/:code
// @access  Public
exports.getProductByCode = async (req, res) => {
  try {
    const code = String(req.params.code || '').trim();
    if (!code) {
      return res.status(400).json({ success: false, message: 'Kode produk diperlukan' });
    }
    const product = await Product.findOne({ code }).populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }

    // Hide non-published product from public
    const header = req.headers.authorization || '';
    let isPrivileged = false;
    try {
      if (header.startsWith('Bearer ')) {
        const token = header.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET);
        isPrivileged = true;
      }
    } catch (_) {}
    if (!isPrivileged && product.status !== 'published') {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mendapatkan produk', error: error.message });
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

    // Auto-generate SKU untuk varian yang SKU-nya kosong
    if (Array.isArray(req.body.variants)) {
      const normalize = (val) => String(val || '').toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const used = new Set(req.body.variants.map(v => String(v.sku || '').trim()).filter(Boolean));
      req.body.variants = req.body.variants.map((v, idx) => {
        let sku = String(v.sku || '').trim();
        if (!sku) {
          const base = `${normalize(req.body.code)}-${normalize(v.color)}-${normalize(v.size) || 'NOSIZE'}`;
          let candidate = base;
          let counter = 1;
          while (used.has(candidate)) {
            candidate = `${base}-${counter++}`;
          }
          used.add(candidate);
          sku = candidate;
        }
        return { ...v, sku };
      });
    }

    // Normalisasi subcategory dan validasi terhadap kategori yang dipilih
    if (typeof req.body.subcategory === 'string') {
      req.body.subcategory = req.body.subcategory.trim();
    }
    if (req.body.subcategory) {
      try {
        const Category = require('../models/categoryModel');
        const cat = await Category.findById(req.body.category);
        const allowed = Array.isArray(cat?.subcategories) ? cat.subcategories : [];
        if (!allowed.includes(req.body.subcategory)) {
          return res.status(400).json({ success: false, message: 'Subkategori tidak valid untuk kategori terpilih' });
        }
      } catch (_) {
        // Jika gagal mengambil kategori, kosongkan subcategory agar tidak menyimpan nilai tidak valid
        req.body.subcategory = '';
      }
    }

    const product = await Product.create(req.body);

    // Audit log
    await logAudit(req, { action: 'create', model: 'Product', itemId: product._id?.toString(), details: { name: product.name, code: product.code } });

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
      // Auto-generate SKU jika kosong, berbasis product.code
      const normalize = (val) => String(val || '').toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const used = new Set(req.body.variants.map(v => String(v.sku || '').trim()).filter(Boolean));
      req.body.variants = req.body.variants.map((v) => {
        let sku = String(v.sku || '').trim();
        if (!sku) {
          const base = `${normalize(product.code)}-${normalize(v.color)}-${normalize(v.size) || 'NOSIZE'}`;
          let candidate = base;
          let counter = 1;
          while (used.has(candidate)) {
            candidate = `${base}-${counter++}`;
          }
          used.add(candidate);
          sku = candidate;
        }
        return { ...v, sku };
      });
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

    // Jika payload mengandung subcategory, validasi dan simpan aman
    if (typeof req.body.subcategory === 'string') {
      const sub = req.body.subcategory.trim();
      if (sub) {
        try {
          const Category = require('../models/categoryModel');
          const cat = await Category.findById(product.category);
          const allowed = Array.isArray(cat?.subcategories) ? cat.subcategories : [];
          if (!allowed.includes(sub)) {
            // Kembalikan error jika subkategori tidak valid
            return res.status(400).json({ success: false, message: 'Subkategori tidak valid untuk kategori terpilih' });
          }
        } catch (_) {}
      }
    }

    // Audit log
    await logAudit(req, { action: 'update', model: 'Product', itemId: product._id?.toString(), details: { updatedFields: Object.keys(req.body || {}) } });

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

// @desc    Reorder products
// @route   PUT /api/products/reorder
// @access  Private (Admin/Staff)
exports.reorderProducts = async (req, res) => {
  try {
    const { orders } = req.body;
    if (!Array.isArray(orders)) {
      return res.status(400).json({
        success: false,
        message: 'Payload tidak valid: orders harus berupa array'
      });
    }

    const bulkOps = orders
      .filter(o => (o && (o.id || o._id) !== undefined && typeof o.order === 'number'))
      .map(o => ({
        updateOne: {
          filter: { _id: o.id || o._id },
          update: { $set: { order: o.order } }
        }
      }));

    if (bulkOps.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada operasi yang valid untuk dijalankan'
      });
    }

    await Product.bulkWrite(bulkOps);
    const products = await Product.find({}).sort({ order: 1, createdAt: -1 });

    // Audit log
    await logAudit(req, { action: 'reorder', model: 'Product', itemId: 'bulk', details: { count: bulkOps.length } });

    res.status(200).json({
      success: true,
      message: 'Urutan produk berhasil disimpan',
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal menyimpan urutan produk',
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

    // Helper: delete a single file and its common resized variants
    const deleteFileAndVariants = (fileUrl) => {
      try {
        if (!fileUrl || typeof fileUrl !== 'string') return;
        const url = fileUrl.trim();
        if (!url.startsWith('/uploads/')) return; // safety guard
        const abs = path.join(__dirname, '../..', url);
        if (fs.existsSync(abs)) {
          try { fs.unlinkSync(abs); } catch (_) {}
        }
        // Attempt to delete webp variants: -thumb.webp, -medium.webp, -large.webp
        const parsed = path.parse(url); // works with posix-style path
        // Remove suffix if present in base name
        const nameNoSuffix = parsed.name.replace(/-(thumb|medium|large)$/i, '');
        const dirPosix = parsed.dir || '/uploads';
        ['thumb', 'medium', 'large'].forEach(suffix => {
          const variantUrl = path.join(dirPosix, `${nameNoSuffix}-${suffix}.webp`);
          const variantAbs = path.join(__dirname, '../..', variantUrl);
          if (fs.existsSync(variantAbs)) {
            try { fs.unlinkSync(variantAbs); } catch (_) {}
          }
        });
      } catch (_) {}
    };

    // Delete main image
    deleteFileAndVariants(product.imageUrl);
    // Delete additional images
    (Array.isArray(product.additionalImages) ? product.additionalImages : []).forEach(deleteFileAndVariants);
    // Delete color images (Map or plain object)
    try {
      const byColor = product.imagesByColor;
      if (byColor) {
        if (typeof byColor.values === 'function') {
          Array.from(byColor.values()).forEach(deleteFileAndVariants);
        } else {
          Object.values(byColor || {}).forEach(deleteFileAndVariants);
        }
      }
    } catch (_) {}

    await product.deleteOne();

    // Audit log
    await logAudit(req, { action: 'delete', model: 'Product', itemId: product._id?.toString(), details: { name: product.name, code: product.code } });

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
