# Panduan Deployment Vercel - Solusi Error 404

## Masalah Utama yang Sudah Diperbaiki

### 1. Konfigurasi Routing Tidak Tepat
**Masalah:** Route fallback untuk SPA (Single Page Application) tidak dikonfigurasi dengan benar.
**Solusi:** Menambahkan fallback route ke `/index.html` di `vercel.json`

### 2. Build Output Directory
**Masalah:** Konfigurasi build tidak lengkap untuk Vercel.
**Solusi:** Menambahkan konfigurasi build command dan install command yang lengkap.

### 3. Static Assets Handling
**Masalah:** Static assets (JS, CSS, images) tidak ter-route dengan benar.
**Solusi:** Menambahkan specific route untuk static assets.

## Langkah-langkah Deployment Fix

### 1. Pastikan Konfigurasi Sudah Benar
✅ `vercel.json` sudah diperbaiki dengan routing yang tepat
✅ `frontend/package.json` sudah ditambahkan `"homepage": "."`
✅ `frontend/vercel.json` sudah dibuat untuk konfigurasi build spesifik

### 2. Environment Variables di Vercel
Pastikan environment variables berikut sudah diatur di dashboard Vercel:
- `MONGO_URI` - Connection string MongoDB Anda
- `JWT_SECRET` - Secret key untuk JWT
- `NODE_ENV` - Set ke `production`
- `BASE_URL` - URL deployment Vercel Anda

### 3. Proses Deployment

#### Option A: Redeploy Manual
1. Push perubahan ke repository
2. Di dashboard Vercel, klik "Redeploy" atau trigger new deployment
3. Monitor build process di dashboard Vercel

#### Option B: Deployment via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login ke Vercel
vercel login

# Deploy dari root directory
vercel --prod
```

### 4. Verifikasi Deployment

Setelah deployment selesai:
1. Buka URL deployment
2. Test halaman homepage (`/`)
3. Test client-side routing (`/category/pria/all`, `/p/PRODUCT-CODE`, dll)
4. Test API endpoints (`/api/products`, `/api/categories`)
5. Check browser console untuk error

## Troubleshooting Tambahan

### Jika Masih 404 pada Specific Routes:

1. **Check Build Logs**
   - Pastikan build berhasil tanpa error
   - Verify bahwa `build` folder generated dengan benar

2. **Check Network Tab**
   - Buka browser developer tools
   - Coba akses halaman yang 404
   - Lihat network requests yang gagal

3. **Verify Static Files**
   - Pastikan file `index.html` ada di root build folder
   - Verify static assets (JS, CSS) ter-load dengan benar

### Jika API Tidak Berfungsi:

1. **Check Function Logs**
   - Di dashboard Vercel, buka tab "Functions"
   - Lihat logs untuk `api/index.js`

2. **Test API Directly**
   ```bash
   curl https://your-domain.vercel.app/api/products
   ```

### Jika Database Connection Error:

1. **Verify Environment Variables**
   - Pastikan `MONGO_URI` valid dan accessible
   - Check IP whitelist di MongoDB Atlas

2. **Check Function Logs**
   - Lihat error logs untuk database connection

## Best Practices untuk Deployment Selanjutnya

1. **Selalu test build locally sebelum deploy**
   ```bash
   cd frontend && npm run build
   ```

2. **Gunakan preview deployments untuk testing**
   ```bash
   vercel --preview
   ```

3. **Monitor performance dan error di dashboard Vercel**

4. **Set up custom domain untuk production**

## Konfigurasi Tambahan (Opsional)

### Custom Error Pages
Buat file `public/_redirects` untuk custom redirects:
```
/*    /index.html   200
```

### Security Headers
Tambahkan di `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

## Contact Support

Jika masalah tetap berlanjut:
1. Screenshot error dari browser console
2. Share build logs dari Vercel dashboard
3. Share URL deployment untuk debugging

---
*Update: 20 Oktober 2025*