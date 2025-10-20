# Fix Database Connection Error 404: NOT_FOUND

## Error Analysis
**Error**: `404: NOT_FOUND` dengan database connection
**Code**: `sin1::nrtzn-1760978655785-80fb65d01507`

**Penyebab Umum**:
1. Environment variables tidak ter-set di Vercel
2. MongoDB Atlas connection string salah
3. IP whitelist tidak mengizinkan Vercel
4. Database credentials tidak valid

## Langkah Perbaikan

### 1. **Check Environment Variables di Vercel**

Buka Vercel Dashboard → Project → Settings → Environment Variables

**Required Variables**:
```
MONGO_URI = mongodb+srv://username:password@cluster.mongodb.net/narpati-leather?retryWrites=true&w=majority
JWT_SECRET = your_jwt_secret_key_here_make_it_long_and_random
NODE_ENV = production
BASE_URL = https://narpati-backend.vercel.app
```

**Validation**:
- ✅ `MONGO_URI` harus diisi dengan connection string lengkap
- ✅ `JWT_SECRET` harus minimal 32 karakter
- ✅ `NODE_ENV` harus `production`
- ✅ `BASE_URL` harus sesuai domain Vercel

### 2. **MongoDB Atlas Configuration**

#### A. **Check Connection String**
Format yang benar:
```
mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
```

**Contoh**:
```
mongodb+srv://dedearifgun:password123@cluster0.abcde.mongodb.net/narpati-leather?retryWrites=true&w=majority
```

#### B. **IP Whitelist untuk Vercel**
1. Buka MongoDB Atlas → Database Access
2. Pilih cluster Anda
3. Klik "Network Access"
4. Tambahkan IP berikut:
   ```
   0.0.0.0/0 (Allow access from anywhere)
   ```
   **ATAU** gunakan IP Vercel yang spesifik:
   ```
   8.8.8.8/32
   1.1.1.1/32
   ```

#### C. **Database User Permissions**
1. MongoDB Atlas → Database Access
2. Check user memiliki permission:
   - Read and write to any database
   - Atau specific database permissions

### 3. **Test Connection String**

#### A. **Test dengan MongoDB Compass**
1. Buka MongoDB Compass
2. Paste connection string
3. Test connection

#### B. **Test dengan curl**
```bash
curl -X POST https://narpati-backend.vercel.app/api/products \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### 4. **Debug dengan Enhanced Logging**

Setelah update `api/index.js`, Anda akan melihat logs di Vercel:

1. **Buka Vercel Dashboard**
2. **Tab Functions**
3. **Klik api/index.js**
4. **Lihat Real-time Logs**

**Expected Logs**:
```
=== API SERVERLESS FUNCTION CALLED ===
Method: GET
URL: /api/products
Environment: {
  NODE_ENV: 'production',
  MONGO_URI: 'SET',
  MONGO_URI_LENGTH: 95,
  JWT_SECRET: 'SET',
  BASE_URL: 'https://narpati-backend.vercel.app'
}
Attempting to connect to database...
Terhubung ke database MongoDB (Serverless)
```

**Error Logs**:
```
Database connection failed: MongooseServerSelectionError
Error details: {
  name: 'MongooseServerSelectionError',
  message: 'Could not connect to any servers in your MongoDB cluster'
}
```

### 5. **Common Solutions**

#### A. **Jika MONGO_URI tidak ter-set**
```bash
# Di Vercel Dashboard, tambahkan:
MONGO_URI = mongodb+srv://username:password@cluster.mongodb.net/narpati-leather?retryWrites=true&w=majority
```

#### B. **Jika IP Whitelist error**
```bash
# Di MongoDB Atlas, tambahkan IP:
0.0.0.0/0
```

#### C. **Jika Authentication error**
```bash
# Check username dan password di MongoDB Atlas
# Reset password jika perlu
```

### 6. **Quick Fix Template**

#### A. **Environment Variables Template**
```
MONGO_URI = mongodb+srv://dedearifgun:your_password@cluster0.abcde.mongodb.net/narpati-leather?retryWrites=true&w=majority
JWT_SECRET = narpati_leather_secret_key_2025_very_long_and_secure
NODE_ENV = production
BASE_URL = https://narpati-backend.vercel.app
```

#### B. **Test API Endpoints**
```bash
# Test basic connection
curl https://narpati-backend.vercel.app/

# Test API with database
curl https://narpati-backend.vercel.app/api/products

# Test with browser
https://narpati-backend.vercel.app/api/categories
```

### 7. **Step-by-Step Fix**

1. **Check Vercel Function Logs** untuk melihat error detail
2. **Verify Environment Variables** ter-set dengan benar
3. **Test MongoDB Connection** dengan Compass atau mongosh
4. **Update IP Whitelist** di MongoDB Atlas
5. **Redeploy** setelah perubahan
6. **Test API Endpoints** untuk verifikasi

### 8. **Contact Support**

Jika masalah tetap berlanjut, sediakan:
1. **Screenshot Vercel Function Logs**
2. **Environment Variables (tanpa values)**
3. **MongoDB Atlas Network Access settings**
4. **Connection string yang digunakan**

---
**Update: 20 Oktober 2025**