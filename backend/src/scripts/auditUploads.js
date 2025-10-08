// Audit unused files in backend/uploads against database references
// Usage: node src/scripts/auditUploads.js [--delete]
// - Dry-run by default: prints stats and lists without deleting
// - If --delete provided, deletes unreferenced files safely

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const Product = require('../models/productModel');
const Category = require('../models/categoryModel');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/narpati-leather';
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

function addVariantGroup(required, url) {
  if (!url || typeof url !== 'string') return;
  const u = url.trim();
  if (!u.startsWith('/uploads/')) return;
  // normalize to keep all webp variants in a group
  const parsed = path.parse(u);
  const baseNoSuffix = parsed.name.replace(/-(thumb|medium|large)$/i, '');
  ['thumb', 'medium', 'large'].forEach(s => {
    required.add(path.posix.join('/uploads', `${baseNoSuffix}-${s}.webp`));
  });
  // also keep the original file url itself
  required.add(u);
}

async function hashFile(absPath) {
  return new Promise((resolve, reject) => {
    const h = crypto.createHash('sha256');
    const s = fs.createReadStream(absPath);
    s.on('error', reject);
    s.on('data', (chunk) => h.update(chunk));
    s.on('end', () => resolve(h.digest('hex')));
  });
}

(async function main() {
  const shouldDelete = process.argv.includes('--delete');
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const required = new Set();
  // Collect references from products
  const products = await Product.find({}).lean();
  for (const p of products) {
    addVariantGroup(required, p.imageUrl);
    if (Array.isArray(p.additionalImages)) {
      p.additionalImages.forEach((u) => addVariantGroup(required, u));
    }
    const imagesByColor = p.imagesByColor || {};
    Object.values(imagesByColor).forEach((u) => addVariantGroup(required, u));
    // If variants may carry images
    if (Array.isArray(p.variants)) {
      p.variants.forEach(v => {
        if (v && v.imageUrl) addVariantGroup(required, v.imageUrl);
      });
    }
  }
  // Collect references from categories
  const categories = await Category.find({}).lean();
  for (const c of categories) {
    addVariantGroup(required, c.imageUrl);
  }

  // Scan uploads directory
  const files = await fs.promises.readdir(UPLOADS_DIR);
  const all = [];
  for (const name of files) {
    const abs = path.join(UPLOADS_DIR, name);
    const rel = path.posix.join('/uploads', name);
    const stat = await fs.promises.stat(abs);
    if (stat.isFile()) all.push({ name, rel, abs, size: stat.size });
  }

  // Build duplicate groups by content hash
  const hashMap = new Map();
  for (const f of all) {
    try {
      const hash = await hashFile(f.abs);
      if (!hashMap.has(hash)) hashMap.set(hash, []);
      hashMap.get(hash).push(f);
    } catch (err) {
      console.warn('Failed to hash', f.name, err.message);
    }
  }

  const unreferenced = all.filter(f => !required.has(f.rel));
  const duplicates = Array.from(hashMap.entries()).filter(([_, arr]) => arr.length > 1).map(([hash, arr]) => ({ hash, files: arr }));

  console.log(`\nSummary:`);
  console.log(`- Total files in uploads: ${all.length}`);
  console.log(`- Referenced (including variant sets): ${all.length - unreferenced.length}`);
  console.log(`- Unreferenced: ${unreferenced.length}`);
  console.log(`- Duplicate groups: ${duplicates.length}`);

  console.log(`\nUnreferenced files:`);
  unreferenced.slice(0, 100).forEach(f => console.log(`  ${f.name} (${f.size} bytes)`));
  if (unreferenced.length > 100) console.log(`  ...and ${unreferenced.length - 100} more.`);

  console.log(`\nDuplicate groups (by sha256):`);
  duplicates.slice(0, 20).forEach(group => {
    console.log(`  hash=${group.hash}`);
    group.files.forEach(f => console.log(`    - ${f.name} (${f.size}) ${required.has(f.rel) ? '[referenced]' : '[unreferenced]'}`));
  });
  if (duplicates.length > 20) console.log(`  ...and ${duplicates.length - 20} more groups.`);

  if (shouldDelete) {
    let deleted = 0;
    for (const f of unreferenced) {
      try { fs.unlinkSync(f.abs); deleted++; } catch (err) { console.warn('Failed to delete', f.name, err.message); }
    }
    console.log(`\nDeleted ${deleted} unreferenced files.`);
  } else {
    console.log(`\nDry-run complete. Use --delete to remove unreferenced files.`);
  }

  await mongoose.disconnect();
  process.exit(0);
})().catch(err => { console.error(err); process.exit(1); });