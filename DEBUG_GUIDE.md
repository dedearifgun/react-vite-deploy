# Database Connection Debug Guide

## Quick Diagnosis Steps

### 1. Test the Debug Endpoint
Deploy your code and visit: `https://your-domain.vercel.app/debug`

This will show you:
- Environment variables status
- MongoDB URI analysis (without exposing credentials)
- Database connection test results

### 2. Check Vercel Function Logs
1. Go to Vercel Dashboard → Your Project → Functions
2. Click on `api/index.js`
3. Look for the enhanced logs we added

Expected successful logs:
```
=== API SERVERLESS FUNCTION CALLED ===
Environment Debug: {
  NODE_ENV: 'production',
  MONGO_URI: 'SET',
  MONGO_URI_LENGTH: 95,
  MONGO_URI_PREFIX: 'mongodb+srv',
  MONGO_URI_DOMAIN: 'cluster0.abcde.mongodb.net',
  JWT_SECRET: 'SET',
  JWT_SECRET_LENGTH: 45,
  BASE_URL: 'https://your-app.vercel.app',
  VERCEL_URL: 'your-app.vercel.app',
  VERCEL_ENV: 'production'
}
=== DATABASE CONNECTION ATTEMPT ===
Database connection successful in 250 ms
```

Expected error logs:
```
=== DATABASE CONNECTION FAILED ===
Error Type: MongooseServerSelectionError
Error Message: Could not connect to any servers in your MongoDB cluster
MongoDB Server Selection Error Details:
- Reason: { servers: { 'cluster0.abcde.mongodb.net:27017': [Object] } }
```

## Most Common Issues and Fixes

### Issue 1: Environment Variables Not Set
**Symptoms**: `MONGO_URI: 'NOT SET'` in debug endpoint

**Fix**:
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Add these variables:
   ```
   MONGO_URI = mongodb+srv://username:password@cluster.mongodb.net/narpati-leather?retryWrites=true&w=majority
   JWT_SECRET = your_long_secret_key_min_32_chars
   NODE_ENV = production
   BASE_URL = https://your-app.vercel.app
   ```
3. Redeploy your application

### Issue 2: Invalid MongoDB Connection String
**Symptoms**: Debug endpoint shows malformed URI analysis

**Fix**:
1. Verify your connection string format:
   ```
   mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
   ```
2. Test with MongoDB Compass locally first
3. Update environment variable in Vercel

### Issue 3: IP Whitelist Blocking Vercel
**Symptoms**: `MongooseServerSelectionError` in logs

**Fix**:
1. Go to MongoDB Atlas → Network Access
2. Add IP: `0.0.0.0/0` (allows all access - for testing)
3. Or add specific Vercel IPs:
   ```
   8.8.8.8/32
   1.1.1.1/32
   ```

### Issue 4: Database User Permissions
**Symptoms**: Authentication error in logs

**Fix**:
1. MongoDB Atlas → Database Access
2. Check user has "Read and write to any database" permission
3. Reset password if needed
4. Update MONGO_URI with new password

## Testing Commands

### Test API Endpoints
```bash
# Test basic connection
curl https://your-app.vercel.app/

# Test debug endpoint
curl https://your-app.vercel.app/debug

# Test API with database
curl https://your-app.vercel.app/api/products
```

### Test Connection String Locally
```bash
# Using mongosh
mongosh "mongodb+srv://username:password@cluster.mongodb.net/narpati-leather?retryWrites=true&w=majority"

# Using node
node -e "
const mongoose = require('mongoose');
mongoose.connect('your-connection-string')
  .then(() => console.log('Connected!'))
  .catch(err => console.error('Error:', err));
"
```

## Environment Variables Checklist

Copy this template and fill in your values:

```bash
# Required for Vercel Deployment
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/narpati-leather?retryWrites=true&w=majority
JWT_SECRET=make_this_very_long_and_random_at_least_32_characters
NODE_ENV=production
BASE_URL=https://YOUR_APP_NAME.vercel.app

# Optional
JWT_EXPIRE=7d
```

## Debug Output Analysis

When you visit `/debug`, look for these key indicators:

### ✅ Good Signs
- `MONGO_URI_SET: true`
- `MONGO_URI_LENGTH > 50`
- `has_credentials: true`
- `database_connection.success: true`
- `connection_time_ms < 5000`

### ❌ Bad Signs
- `MONGO_URI_SET: false`
- `MONGO_URI_LENGTH < 50`
- `has_credentials: false`
- `database_connection.success: false`
- `error.name: MongooseServerSelectionError`

## Next Steps

1. **Deploy the updated code** with enhanced logging
2. **Visit `/debug` endpoint** to see current status
3. **Check Vercel Function Logs** for detailed error messages
4. **Fix environment variables** if needed
5. **Update MongoDB Atlas settings** if IP whitelist issue
6. **Redeploy and test again**

---
**Created: 21 October 2025**
**Purpose: Debug database connection issues in Vercel deployment**