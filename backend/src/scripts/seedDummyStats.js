// Seed dummy AuditLog data for WhatsApp clicks and general logs
// Usage:
//   node src/scripts/seedDummyStats.js --start 2025-09-01 --end 2025-10-14
// Notes:
// - Inserts additional logs; it DOES NOT delete existing logs.
// - Designed for local/dev seeding to visualize charts in admin dashboard.

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const AuditLog = require('../models/auditLogModel');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/narpati-leather';

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (key, def = null) => {
    const i = args.findIndex(a => a === `--${key}`);
    if (i >= 0 && args[i + 1]) return args[i + 1];
    return def;
  };
  const startStr = get('start', '2025-09-01');
  const endStr = get('end', new Date().toISOString().slice(0, 10));
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('Invalid --start or --end date');
  }
  // Normalize to start-of-day, and end inclusive
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return { start, end };
}

function randInt(min, max) { // inclusive
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomTimeInDay(dayStart) {
  const ms = randInt(0, 24 * 60 * 60 * 1000 - 1);
  return new Date(dayStart.getTime() + ms);
}

async function seedDay(dayStart) {
  const docs = [];
  // Pattern: WhatsApp clicks slightly higher around weekends
  const dow = dayStart.getDay(); // 0=Sun
  const waCount = dow === 0 || dow === 6 ? randInt(2, 10) : randInt(0, 6);
  for (let i = 0; i < waCount; i++) {
    docs.push({
      action: 'whatsapp_click',
      model: 'Checkout',
      itemId: 'cart',
      details: { source: 'dummy', page: '/product/seed', itemsCount: randInt(0, 3), cartCount: randInt(0, 5) },
      createdAt: randomTimeInDay(dayStart),
    });
  }

  // General logs: mix of actions and models
  const logCount = randInt(5, 24);
  const actions = ['login', 'update', 'create', 'logout'];
  const models = ['Auth', 'Product', 'Category'];
  for (let i = 0; i < logCount; i++) {
    docs.push({
      action: actions[randInt(0, actions.length - 1)],
      model: models[randInt(0, models.length - 1)],
      itemId: 'dummy',
      details: { note: 'seed dummy' },
      createdAt: randomTimeInDay(dayStart),
    });
  }

  if (docs.length > 0) {
    await AuditLog.insertMany(docs, { ordered: false });
  }
}

(async function main() {
  const { start, end } = parseArgs();
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');
  console.log(`Seeding dummy stats from ${start.toISOString().slice(0,10)} to ${end.toISOString().slice(0,10)}`);

  let seededDays = 0;
  for (let d = new Date(start); d <= end; d = new Date(d.getTime() + 24 * 60 * 60 * 1000)) {
    await seedDay(d);
    seededDays++;
    if (seededDays % 20 === 0) console.log(`  seeded ${seededDays} days...`);
  }

  await mongoose.disconnect();
  console.log(`Done. Seeded ${seededDays} days.`);
  process.exit(0);
})().catch(async (err) => {
  console.error('Seed failed:', err?.message || err);
  try { await mongoose.disconnect(); } catch (_) {}
  process.exit(1);
});