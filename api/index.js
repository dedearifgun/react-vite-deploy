const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Import routes
const productRoutes = require('../backend/src/routes/productRoutes');
const categoryRoutes = require('../backend/src/routes/categoryRoutes');
const userRoutes = require('../backend/src/routes/userRoutes');
const authRoutes = require('../backend/src/routes/authRoutes');
const logRoutes = require('../backend/src/routes/logRoutes');
const statsRoutes = require('../backend/src/routes/statsRoutes');
const analyticsRoutes = require('../backend/src/routes/analyticsRoutes');
const dbRoutes = require('../backend/src/routes/dbRoutes');

const app = express();
const Product = require('../backend/src/models/productModel');
const Category = require('../backend/src/models/categoryModel');

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/db', dbRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('API untuk E-Commerce Kerajinan Kulit');
});

// Sitemap
app.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = process.env.BASE_URL || `https://${process.env.VERCEL_URL}`;
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
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/narpati-leather';

// Connect to MongoDB before handling requests
let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) return;
  
  try {
    await mongoose.connect(MONGO_URI);
    isConnected = true;
    console.log('Terhubung ke database MongoDB');
  } catch (err) {
    console.error('Gagal terhubung ke MongoDB:', err.message);
    throw err;
  }
};

// Export as serverless function
module.exports = async (req, res) => {
  await connectToDatabase();
  return app(req, res);
};