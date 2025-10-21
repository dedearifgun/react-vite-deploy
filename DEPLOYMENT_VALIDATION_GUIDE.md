# Panduan Validasi Deployment Vercel

## Langkah 1: Testing Debug Endpoint

Setelah deployment, kunjungi endpoint berikut untuk validasi:

```
https://your-app-name.vercel.app/debug
```

Endpoint ini akan menampilkan:
- Environment variables status
- Database connection test
- Vercel environment info

## Langkah 2: Check Console Logs

Buka browser developer console dan periksa logs:
- Frontend API request logs
- Backend serverless function logs
- Error messages detail

## Langkah 3: Validasi API Routes

Test beberapa API endpoints:
- `/api/products` - untuk test koneksi database
- `/api/categories` - untuk test basic API
- `/` - untuk test backend response

## Langkah 4: Check Vercel Function Logs

Di Vercel Dashboard:
1. Buka project Anda
2. Klik "Functions" tab
3. Periksa logs untuk setiap function call
4. Cari error patterns

## Common Issues & Solutions

### Issue 1: API routes return 404
**Symptom**: Frontend tidak bisa mengakses API
**Check**: Console logs untuk "API ERROR" dengan status 404
**Solution**: Pastikan routing di vercel.json benar

### Issue 2: Database connection failed
**Symptom**: Error "Database connection failed"
**Check**: Environment variables di Vercel dashboard
**Solution**: Set MONGO_URI dan JWT_SECRET dengan benar

### Issue 3: CORS errors
**Symptom**: Error "Access-Control-Allow-Origin"
**Check**: Network tab di browser dev tools
**Solution**: Pastikan frontend dan API di domain yang sama

## Expected Results

Jika deployment berhasil:
- Debug endpoint menampilkan "success: true" untuk database connection
- API products mengembalikan data produk
- Frontend bisa menampilkan produk dengan benar
- Tidak ada CORS errors di console

## Troubleshooting Next Steps

Jika masalah masih ada:
1. Copy debug endpoint output
2. Check Vercel Function logs
3. Validasi environment variables
4. Test API routes individually