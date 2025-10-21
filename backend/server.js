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
const dbRoutes = require('./src/routes/dbRoutes');

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
app.use('/api/db', dbRoutes);

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

// Database connection for serverless environment
let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) return;
  
  try {
    await mongoose.connect(MONGO_URI);
    isConnected = true;
    console.log('Terhubung ke database MongoDB (Serverless)');
  } catch (err) {
    console.error('Gagal terhubung ke MongoDB:', err.message);
    throw err;
  }
};

// For local development
if (process.env.NODE_ENV !== 'production') {
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log('Terhubung ke database MongoDB (Local)');
      app.listen(PORT, () => {
        console.log(`Server berjalan di port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Gagal terhubung ke MongoDB:', err.message);
    });
}

// Debug endpoint for testing environment and database connection
app.get('/debug', async (req, res) => {
  const debugInfo = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
      BASE_URL: process.env.BASE_URL,
      MONGO_URI_SET: !!process.env.MONGO_URI,
      MONGO_URI_LENGTH: process.env.MONGO_URI?.length || 0,
      JWT_SECRET_SET: !!process.env.JWT_SECRET,
      JWT_SECRET_LENGTH: process.env.JWT_SECRET?.length || 0
    },
    mongo_uri_analysis: null,
    database_connection: null
  };
  
  // Analyze MONGO_URI if set (without exposing credentials)
  if (process.env.MONGO_URI) {
    const uri = process.env.MONGO_URI;
    debugInfo.mongo_uri_analysis = {
      protocol: uri.split('://')[0],
      has_credentials: uri.includes('@'),
      host: uri.split('@')[1]?.split('/')[0] || 'NOT_FOUND',
      database: uri.split('@')[1]?.split('/')[1]?.split('?')[0] || 'NOT_SPECIFIED',
      has_retry_writes: uri.includes('retryWrites=true'),
      has_w_majority: uri.includes('w=majority')
    };
  }
  
  // Test database connection
  try {
    const startTime = Date.now();
    await connectToDatabase();
    const connectionTime = Date.now() - startTime;
    debugInfo.database_connection = {
      success: true,
      connection_time_ms: connectionTime,
      mongoose_state: mongoose.connection.readyState,
      mongoose_states: {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
      }
    };
  } catch (error) {
    debugInfo.database_connection = {
      success: false,
      error: {
        name: error.name,
        message: error.message,
        code: error.code,
        constructor: error.constructor.name
      }
    };
  }
  
  res.json(debugInfo);
});

// Export for Vercel serverless functions
module.exports = async (req, res) => {
  console.log('=== BACKEND SERVERLESS FUNCTION CALLED ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Full URL:', req.protocol + '://' + req.get('host') + req.url);
  console.log('Timestamp:', new Date().toISOString());
  
  // ADDITIONAL DEBUGGING FOR ROUTING ISSUES
  console.log('=== ROUTING DEBUG INFO ===');
  console.log('Request Path:', req.path);
  console.log('Request Query:', req.query);
  console.log('Request Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Vercel Environment:', {
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_URL: process.env.VERCEL_URL,
    VERCEL_REGION: process.env.VERCEL_REGION
  });
  
  // Enhanced environment debugging
  const envDebug = {
    NODE_ENV: process.env.NODE_ENV,
    MONGO_URI: process.env.MONGO_URI ? 'SET' : 'NOT SET',
    MONGO_URI_LENGTH: process.env.MONGO_URI ? process.env.MONGO_URI.length : 0,
    MONGO_URI_PREFIX: process.env.MONGO_URI ? process.env.MONGO_URI.split('://')[0] : 'NONE',
    MONGO_URI_DOMAIN: process.env.MONGO_URI ? process.env.MONGO_URI.split('@')[1]?.split('/')[0] : 'NONE',
    JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
    JWT_SECRET_LENGTH: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
    BASE_URL: process.env.BASE_URL || 'NOT SET',
    VERCEL_URL: process.env.VERCEL_URL || 'NOT SET',
    VERCEL_ENV: process.env.VERCEL_ENV || 'NOT SET'
  };
  console.log('Environment Debug:', envDebug);
  
  // Test database connection with detailed logging
  try {
    console.log('=== DATABASE CONNECTION ATTEMPT ===');
    console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
    console.log('MONGO_URI length:', process.env.MONGO_URI?.length || 0);
    
    if (process.env.MONGO_URI) {
      const uriParts = process.env.MONGO_URI.split('://');
      console.log('Protocol:', uriParts[0]);
      if (uriParts[1]) {
        const credentialsAndHost = uriParts[1].split('@');
        console.log('Has credentials:', credentialsAndHost.length > 1);
        if (credentialsAndHost[1]) {
          const hostAndDb = credentialsAndHost[1].split('/');
          console.log('Host:', hostAndDb[0]);
          console.log('Database:', hostAndDb[1] || 'NOT SPECIFIED');
        }
      }
    }
    
    console.log('Attempting to connect to database...');
    const startTime = Date.now();
    await connectToDatabase();
    const connectionTime = Date.now() - startTime;
    console.log('Database connection successful in', connectionTime, 'ms');
    console.log('Proceeding with request...');
    return app(req, res);
  } catch (error) {
    console.error('=== DATABASE CONNECTION FAILED ===');
    console.error('Error Type:', error.constructor.name);
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code || 'NO_CODE');
    console.error('Error Stack:', error.stack);
    
    // Specific MongoDB error debugging
    if (error.name === 'MongooseServerSelectionError') {
      console.error('MongoDB Server Selection Error Details:');
      console.error('- Reason:', error.reason?.servers || 'NO_SERVER_INFO');
      console.error('- All servers:', error.reason?.allServers || 'NO_SERVER_LIST');
    }
    
    // Return detailed error for debugging
    return res.status(500).json({
      error: 'Database connection failed',
      message: error.message,
      timestamp: new Date().toISOString(),
      debug: {
        envSet: {
          MONGO_URI: !!process.env.MONGO_URI,
          MONGO_URI_LENGTH: process.env.MONGO_URI?.length || 0,
          JWT_SECRET: !!process.env.JWT_SECRET,
          JWT_SECRET_LENGTH: process.env.JWT_SECRET?.length || 0,
          NODE_ENV: process.env.NODE_ENV,
          VERCEL_ENV: process.env.VERCEL_ENV
        },
        error: {
          name: error.name,
          code: error.code,
          constructor: error.constructor.name
        }
      }
    });
  }
};