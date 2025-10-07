const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import routes
const productRoutes = require('./src/routes/productRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const userRoutes = require('./src/routes/userRoutes');
const authRoutes = require('./src/routes/authRoutes');
const logRoutes = require('./src/routes/logRoutes');
const statsRoutes = require('./src/routes/statsRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');

const app = express();
const Product = require('./src/models/productModel');
const Category = require('./src/models/categoryModel');

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Pastikan folder uploads ada dan serve sebagai static
const uploadsDir = path.join(__dirname, 'uploads');
try {
  fs.mkdirSync(uploadsDir, { recursive: true });
} catch (err) {
  console.error('Gagal membuat folder uploads:', err.message);
}
app.use('/uploads', express.static(uploadsDir, {
  maxAge: '365d',
  etag: true,
  setHeaders: (res, filePath) => {
    if (/\.(?:webp|png|jpe?g|gif)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }
}));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/analytics', analyticsRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('API untuk E-Commerce Kerajinan Kulit');
});

// Sitemap
app.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = process.env.BASE_URL || `http://localhost:${PORT || 5000}`;
    const [products, categories] = await Promise.all([
      Product.find({ status: 'published' }).select('code _id updatedAt'),
      Category.find({}).select('slug gender updatedAt')
    ]);

    const urls = [];
    // Home
    urls.push({ loc: `${baseUrl}/`, priority: 1.0 });
    // Categories
    for (const c of categories) {
      const g = c.gender === 'unisex' ? 'aksesoris' : c.gender;
      urls.push({ loc: `${baseUrl}/category/${g}/${c.slug}`, priority: 0.8, lastmod: c.updatedAt });
    }
    // Gender landing
    ['pria', 'wanita', 'aksesoris'].forEach(g => {
      urls.push({ loc: `${baseUrl}/category/${g}/all`, priority: 0.6 });
    });
    // Products
    for (const p of products) {
      const code = p.code;
      urls.push({ loc: `${baseUrl}/p/${encodeURIComponent(code)}`, priority: 0.9, lastmod: p.updatedAt });
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls.map(u => `  <url>\n    <loc>${u.loc}</loc>\n${u.lastmod ? `    <lastmod>${new Date(u.lastmod).toISOString()}</lastmod>\n` : ''}    <priority>${u.priority}</priority>\n  </url>`).join('\n') +
      `\n</urlset>`;
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (e) {
    res.status(500).send('Failed to generate sitemap');
  }
});

// Connect to MongoDB
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/narpati-leather';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Terhubung ke database MongoDB');
    app.listen(PORT, () => {
      console.log(`Server berjalan di port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Gagal terhubung ke MongoDB:', err.message);
  });