const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nama produk harus diisi'],
    trim: true
  },
  // Urutan manual untuk penataan list produk
  order: {
    type: Number,
    default: 0,
    index: true
  },
  code: {
    type: String,
    required: [true, 'Kode produk harus diisi'],
    unique: true,
    trim: true
  },
  description: {
    type: String
  },
  price: {
    type: Number,
    required: [true, 'Harga produk harus diisi'],
    min: [0, 'Harga tidak boleh negatif']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Kategori produk harus diisi']
  },
  // Subkategori (opsional) yang berasal dari daftar di Category.subcategories
  subcategory: {
    type: String,
    trim: true,
    default: ''
  },
  gender: {
    type: String,
    enum: ['pria', 'wanita', 'unisex'],
    required: [true, 'Gender produk harus diisi']
  },
  imageUrl: {
    type: String,
    required: [true, 'Gambar produk harus diisi']
  },
  imagesByColor: {
    type: Map,
    of: String,
    default: {}
  },
  additionalImages: [String],
  colors: [String],
  sizes: [String],
  // Stok total (diisi otomatis dari jumlah stok varian jika ada)
  stock: {
    type: Number,
    default: 0
  },
  // Varian per kombinasi ukuran & warna, dengan SKU dan stok masing-masing
  variants: [
    {
      sku: { type: String, trim: true },
      size: { type: String, trim: true },
      color: { type: String, trim: true },
      stock: { type: Number, default: 0, min: 0 },
      priceDelta: { type: Number, default: 0 }
    }
  ],
  featured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Menambahkan index untuk pencarian
ProductSchema.index({ name: 'text', description: 'text' });

// Index ringan untuk query berdasarkan kategori + subkategori
ProductSchema.index({ category: 1, subcategory: 1 });

module.exports = mongoose.model('Product', ProductSchema);
