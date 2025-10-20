# Panduan Deployment Monorepo ke Vercel

## Struktur Proyek Anda
```
OJT-Narpati/
├── backend/          # Backend Express.js
│   ├── server.js     # Main server file
│   ├── src/          # Routes, models, controllers
│   └── uploads/      # Static files
├── frontend/         # React frontend
│   ├── src/          # React components
│   └── public/       # Static assets
├── api/              # API untuk Vercel (tidak digunakan lagi)
└── vercel.json       # Konfigurasi Vercel
```

## Perubahan yang Telah Dilakukan

### 1. Konfigurasi Vercel (`vercel.json`)
- **Build Configuration**: Build frontend dari `frontend/package.json`
- **API Routes**: Mengarahkan `/api/*` ke `backend/server.js`
- **Static Files**: Mengarahkan `/uploads/*` ke `backend/server.js`
- **SPA Fallback**: Semua route lain ke `/index.html`

### 2. Backend Server (`backend/server.js`)
- **Serverless Support**: Ditambahkan `module.exports` untuk Vercel functions
- **Database Connection**: Connection pooling untuk serverless environment
- **Logging**: Comprehensive logging untuk debugging

### 3. Frontend API Configuration (`frontend/src/utils/api.js`)
- **Environment Detection**: Otomatis menggunakan `/api` di production
- **Request Logging**: Logging untuk setiap API request dan response

## Cara Deployment ke Vercel

### Option 1: Via Vercel Dashboard (Recommended)

1. **Push ke GitHub**
   ```bash
   git add .
   git commit -m "Fix monorepo deployment for Vercel"
   git push origin main
   ```

2. **Setup di Vercel Dashboard**
   - Buka https://vercel.com/dashboard
   - Import project dari GitHub
   - Vercel akan otomatis mendeteksi konfigurasi dari `vercel.json`

3. **Set Environment Variables**
   ```
   MONGO_URI = mongodb+srv://username:password@cluster.mongodb.net/narpati-leather?retryWrites=true&w=majority
   JWT_SECRET = your_jwt_secret_key_here
   NODE_ENV = production
   BASE_URL = https://your-domain.vercel.app
   ```

### Option 2: Via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login dan Deploy**
   ```bash
   vercel login
   vercel --prod
   ```

## Konfigurasi Environment Variables

### Required Variables
- `MONGO_URI`: Connection string ke MongoDB Atlas
- `JWT_SECRET`: Secret key untuk JWT authentication
- `NODE_ENV`: Set ke `production`
- `BASE_URL`: URL deployment Vercel Anda

### Optional Variables
- `PORT`: Otomatis di-set oleh Vercel
- `VERCEL_URL`: Otomatis di-set oleh Vercel

## Troubleshooting

### 1. Jika API 404
- Check Vercel Function Logs di dashboard
- Pastikan environment variables ter-set dengan benar
- Verify routing di `vercel.json`

### 2. Jika Frontend 404
- Pastikan build berhasil tanpa error
- Check bahwa `build` folder ter-generate dengan benar
- Verify SPA routing configuration

### 3. Jika Database Connection Error
- Verify `MONGO_URI` valid
- Check IP whitelist di MongoDB Atlas
- Pastikan database access credentials benar

## Testing Deployment

1. **Test Frontend Routes**
   - Homepage: `/`
   - Category: `/category/pria/all`
   - Product: `/p/PRODUCT-CODE`

2. **Test API Endpoints**
   - Products: `/api/products`
   - Categories: `/api/categories`
   - Auth: `/api/auth/me`

3. **Check Browser Console**
   - Buka Developer Tools → Console
   - Lihat logging "=== API REQUEST ==="
   - Verify tidak ada error JavaScript

## Best Practices

1. **Always test build locally**
   ```bash
   cd frontend && npm run build
   ```

2. **Use preview deployments**
   ```bash
   vercel --preview
   ```

3. **Monitor logs di Vercel dashboard**
4. **Set up custom domain untuk production**

## Struktur URL di Production

- **Frontend**: `https://your-domain.vercel.app/`
- **API**: `https://your-domain.vercel.app/api/*`
- **Static Files**: `https://your-domain.vercel.app/uploads/*`

## Perbedaan dengan Local Development

### Local Development
```bash
# Terminal 1
cd backend && npm run dev  # http://localhost:5000

# Terminal 2  
cd frontend && npm start   # http://localhost:3010
```

### Production (Vercel)
- Single domain untuk frontend dan API
- Frontend dan API di-deploy bersamaan
- Serverless functions untuk API endpoints