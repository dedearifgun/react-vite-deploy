const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const AuditLog = require('../models/auditLogModel');

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI tidak ditemukan di .env');
    process.exit(1);
  }
  await mongoose.connect(uri, { dbName: process.env.DB_NAME || undefined });
  console.log('Terhubung, mulai seeding WhatsApp clicks...');

  // Data contoh 7 hari terakhir (dari 6 hari lalu hingga hari ini)
  const counts = [2, 5, 2, 8, 1, 5, 3];
  const docs = [];
  const base = new Date();
  base.setHours(12, 0, 0, 0);

  for (let d = counts.length - 1; d >= 0; d--) {
    const dayOffset = counts.length - 1 - d; // 6..0
    const date = new Date(base);
    date.setDate(base.getDate() - dayOffset);
    for (let i = 0; i < counts[d]; i++) {
      docs.push({
        action: 'whatsapp_click',
        model: 'Checkout',
        path: '/api/analytics/wa-click',
        method: 'POST',
        details: {
          source: 'seed',
          itemsCount: 1,
          cartCount: 1,
          page: '/seed',
        },
        createdAt: date,
      });
    }
  }

  if (!docs.length) {
    console.log('Tidak ada dokumen untuk disisipkan.');
    await mongoose.disconnect();
    return;
  }

  const res = await AuditLog.insertMany(docs);
  console.log(`Berhasil menyisipkan ${res.length} log whatsapp_click.`);
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error('Gagal seeding:', err);
  try { await mongoose.disconnect(); } catch (_) {}
  process.exit(1);
});