const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nama produk harus diisi'],
    trim: true
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
  gender: {
    type: String,
    enum: ['pria', 'wanita', 'unisex'],
    required: [true, 'Gender produk harus diisi']
  },
  imageUrl: {
    type: String,
    required: [true, 'Gambar produk harus diisi']
  },
  additionalImages: [String],
  colors: [String],
  sizes: [String],
  stock: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Menambahkan index untuk pencarian
ProductSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', ProductSchema);
