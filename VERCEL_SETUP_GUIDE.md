# Panduan Lengkap Setup Project Baru di Vercel Dashboard

## Langkah 1: Import Project

1. **Buka Vercel Dashboard**: https://vercel.com/dashboard
2. Klik **"Add New..."** → **"Project"**
3. **Import Git Repository**:
   - Pilih repository `react-vite-deploy` dari GitHub
   - Klik **"Import"**

## Langkah 2: Konfigurasi Project

### **Root Directory**
```
Root Directory: ./ (kosongkan/biarkan default)
```
**Alasan**: Karena `vercel.json` ada di root folder, Vercel akan otomatis membaca konfigurasi dari sana.

### **Framework Preset**
```
Framework: Other
```
**Alasan**: Karena ini adalah monorepo kustom dengan backend + frontend terpisah.

### **Build & Output Settings**

**JANGAN HIDUPKAN "Override Build Settings"**

Kita akan menggunakan `vercel.json` yang sudah kita buat, jadi biarkan settings default:

- **Build Command**: Vercel akan otomatis membaca dari `vercel.json`
- **Output Directory**: Vercel akan otomatis membaca dari `vercel.json`
- **Install Command**: Vercel akan otomatis membaca dari `vercel.json`

**Kenapa jangan di-override?**
Karena `vercel.json` sudah memiliki konfigurasi yang tepat:
```json
"builds": [
  {
    "src": "frontend/package.json",
    "use": "@vercel/static-build",
    "config": {
      "distDir": "build",
      "installCommand": "cd frontend && npm install",
      "buildCommand": "cd frontend && npm run build"
    }
  },
  {
    "src": "backend/server.js",
    "use": "@vercel/node"
  }
]
```

## Langkah 3: Environment Variables

Klik **"Add Environment Variables"** dan tambahkan:

### **Required Variables**

1. **MONGO_URI**
   ```
   Name: MONGO_URI
   Value: mongodb+srv://username:password@cluster.mongodb.net/narpati-leather?retryWrites=true&w=majority
   Environment: Production, Preview, Development
   ```
   **Ganti** `username:password` dengan credentials MongoDB Atlas Anda

2. **JWT_SECRET**
   ```
   Name: JWT_SECRET
   Value: your_jwt_secret_key_here_make_it_long_and_random
   Environment: Production, Preview, Development
   ```
   **Buat secret key yang kuat**, minimal 32 karakter

3. **NODE_ENV**
   ```
   Name: NODE_ENV
   Value: production
   Environment: Production, Preview, Development
   ```

4. **BASE_URL**
   ```
   Name: BASE_URL
   Value: https://your-project-name.vercel.app
   Environment: Production, Preview, Development
   ```
   **Sementara kosongkan**, setelah deployment selesai edit kembali dengan URL yang diberikan Vercel

## Langkah 4: Deployment Settings

### **Build & Development Settings**
- **Root Directory**: `./` (kosongkan)
- **Build Command**: Biarkan kosong (akan dibaca dari vercel.json)
- **Output Directory**: Biarkan kosong (akan dibaca dari vercel.json)
- **Install Command**: Biarkan kosong (akan dibaca dari vercel.json)

### **Environment Variables Checklist**
✅ MONGO_URI  
✅ JWT_SECRET  
✅ NODE_ENV  
✅ BASE_URL (akan di-update setelah deployment)

## Langkah 5: Deploy

1. Klik **"Deploy"**
2. Tunggu proses build dan deployment
3. Setelah selesai, copy URL yang diberikan Vercel

## Langkah 6: Post-Deployment Setup

### **Update BASE_URL**
1. Di Vercel Dashboard, buka project Anda
2. Klik **"Settings"** → **"Environment Variables"**
3. Edit variable `BASE_URL`:
   ```
   Value: https://your-actual-domain.vercel.app
   ```
4. Klik **"Save"**
5. Trigger redeploy: **"Deployments"** → **"Redeploy"**

### **Verify Deployment**
1. Buka URL project Anda
2. Test beberapa halaman:
   - Homepage: `/`
   - API: `/api/products`
   - Category: `/category/pria/all`
3. Buka Developer Tools → Console untuk melihat logging

## Troubleshooting

### **Jika Build Gagal**
1. Check **"Function Logs"** di Vercel Dashboard
2. Pastikan environment variables ter-set dengan benar
3. Verify `vercel.json` syntax valid

### **Jika API 404**
1. Check logs di tab **"Functions"**
2. Pastikan `backend/server.js` ter-export dengan benar
3. Verify routing di `vercel.json`

### **Jika Frontend 404**
1. Check build logs di tab **"Deployments"**
2. Pastikan `frontend/build` folder ter-generate
3. Verify SPA routing configuration

## Summary Configuration

**Final Configuration Should Look Like This:**

```
Project Settings:
├── Root Directory: ./
├── Framework: Other
├── Build Command: (auto from vercel.json)
├── Output Directory: (auto from vercel.json)
└── Install Command: (auto from vercel.json)

Environment Variables:
├── MONGO_URI = mongodb+srv://...
├── JWT_SECRET = your_secret_key
├── NODE_ENV = production
└── BASE_URL = https://your-domain.vercel.app
```

**Vercel akan otomatis membaca konfigurasi dari `vercel.json` yang sudah kita buat, jadi Anda tidak perlu mengatur build settings secara manual.**