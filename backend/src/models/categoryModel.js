const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nama kategori harus diisi'],
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String
  },
  imageUrl: {
    type: String
  },
  gender: {
    type: String,
    enum: ['pria', 'wanita', 'unisex'],
    required: [true, 'Gender kategori harus diisi']
  },
  subcategories: {
    type: [String],
    default: []
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

// Middleware untuk membuat slug dari nama kategori
CategorySchema.pre('save', function(next) {
  this.slug = this.name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  next();
});

module.exports = mongoose.model('Category', CategorySchema);
