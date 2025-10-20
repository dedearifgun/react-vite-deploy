# Deployment ke Vercel

## Langkah-langkah Deployment

### 1. Setup Environment Variables di Vercel

Sebelum deploy, pastikan untuk mengatur environment variables berikut di dashboard Vercel:

1. Buka project Anda di dashboard Vercel
2. Klik `Settings` → `Environment Variables`
3. Tambahkan variables berikut:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/narpati-leather?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=production
BASE_URL=https://your-domain.vercel.app
```

### 2. Konfigurasi Build Settings

Pastikan build settings di Vercel sudah benar:

- **Root Directory**: `/`
- **Build Command**: `cd frontend && npm run build`
- **Output Directory**: `frontend/build`
- **Install Command**: `npm install`

### 3. Struktur File

Pastikan struktur file Anda sudah seperti ini:

```
/
├── api/
│   └── index.js (serverless function)
├── backend/
│   ├── src/
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   ├── package.json
│   └── public/
├── vercel.json (konfigurasi Vercel)
├── package.json (root)
└── .env.example
```

### 4. Deploy ke Vercel

1. Push code ke GitHub
2. Import project ke Vercel
3. Atur environment variables
4. Deploy

### 5. Troubleshooting

Jika masih ada error 404:

1. Pastikan `vercel.json` sudah benar
2. Cek logs di dashboard Vercel
3. Pastikan semua routes terdaftar dengan benar
4. Verifikasi environment variables sudah diatur

### 6. Testing

Setelah deployment:

1. Test homepage: `https://your-domain.vercel.app`
2. Test API: `https://your-domain.vercel.app/api/products`
3. Test admin panel jika ada

## Catatan Penting

- File uploads tidak akan work di Vercel serverless functions. Gunakan cloud storage seperti AWS S3 atau Cloudinary untuk production.
- Database MongoDB harus accessible dari Vercel (gunakan MongoDB Atlas).
- JWT secret harus unik dan aman.