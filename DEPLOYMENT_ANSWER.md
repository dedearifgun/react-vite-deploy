# Jawaban: Satu atau Dua Project di Vercel?

## **Jawaban Singkat: Gunakan SATU Project Vercel**

Anda **TIDAK PERLU** membuat dua project terpisah. Gunakan satu project Vercel dengan konfigurasi monorepo.

## **Alasan Mengapa Satu Project Lebih Baik**

### ✅ **Keuntungan Satu Project (Monorepo)**
1. **Lebih Sederhana** - satu domain, satu deployment
2. **Tidak Perlu CORS** - frontend dan API di domain yang sama
3. **Lebih Hemat** - satu billing, satu management
4. **Konfigurasi Sudah Siap** - `vercel.json` sudah dikonfigurasi dengan benar
5. **Debugging Lebih Mudah** - satu tempat untuk logs dan monitoring

### ❌ **Kerugian Dua Project Terpisah**
1. **CORS Configuration** - harus setup cross-origin requests
2. **Dua Domain** - frontend dan API di URL berbeda
3. **Dua Billing** - dua project yang harus dikelola
4. **Environment Variables Duplikat** - harus setup di dua tempat
5. **Deployment Lebih Rumit** - harus deploy dua project secara terpisah

## **Konfigurasi Yang Sudah Diperbaiki**

Saya sudah memperbaiki konfigurasi Anda:

### 1. **vercel.json** - Sekarang menggunakan backend/server.js
```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    },
    {
      "src": "backend/server.js",  // ✅ DIPERBAIKI
      "use": "@vercel/node",
      "config": {
        "maxDuration": 10
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend/server.js"  // ✅ DIPERBAIKI
    },
    {
      "src": "/sitemap.xml",
      "dest": "/backend/server.js"  // ✅ DIPERBAIKI
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### 2. **backend/server.js** - Ditambah debugging endpoint
- Endpoint `/debug` untuk testing koneksi database
- Enhanced logging untuk troubleshooting
- Error handling yang lebih detail

## **Cara Deployment Satu Project**

### Langkah 1: Push ke GitHub
```bash
git add .
git commit -m "Fix monorepo deployment configuration"
git push origin main
```

### Langkah 2: Import ke Vercel
1. Buka https://vercel.com/dashboard
2. Klik "New Project"
3. Import dari GitHub repository Anda
4. Vercel akan otomatis mendeteksi konfigurasi dari `vercel.json`

### Langkah 3: Set Environment Variables
Di Vercel Dashboard → Settings → Environment Variables:
```
MONGO_URI = mongodb+srv://username:password@cluster.mongodb.net/narpati-leather?retryWrites=true&w=majority
JWT_SECRET = your_long_secret_key_min_32_characters
NODE_ENV = production
BASE_URL = https://your-app-name.vercel.app
```

### Langkah 4: Deploy dan Test
1. Vercel akan otomatis deploy
2. Test dengan mengunjungi: `https://your-app-name.vercel.app/debug`
3. Check logs di Vercel Dashboard → Functions

## **Struktur URL di Production**

Dengan satu project Vercel:
- **Frontend**: `https://your-app.vercel.app/`
- **API**: `https://your-app.vercel.app/api/*`
- **Static Files**: `https://your-app.vercel.app/uploads/*`
- **Debug**: `https://your-app.vercel.app/debug`

## **Jika Masih Ada Masalah**

1. **Visit `/debug` endpoint** untuk melihat status koneksi database
2. **Check Vercel Function Logs** untuk error detail
3. **Follow DEBUG_GUIDE.md** untuk troubleshooting step-by-step

## **Kesimpulan**

**Gunakan SATU project Vercel** dengan konfigurasi monorepo. Ini adalah approach yang paling sederhana, hemat biaya, dan mudah dikelola untuk aplikasi Anda.

---
**Update: 21 Oktober 2025**
**Status: Konfigurasi sudah diperbaiki dan siap deploy**