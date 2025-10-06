const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/userModel');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/leather-craft-shop';

async function ensureUser({ name, username, email, password, role }) {
  const existing = await User.findOne({ username });
  if (existing) {
    console.log(`User already exists: ${username}`);
    return existing;
  }
  const user = await User.create({ name, username, email, password, role });
  console.log(`Created user: ${username} (${role})`);
  return user;
}

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    await ensureUser({
      name: 'Administrator',
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
    });

    await ensureUser({
      name: 'User',
      username: 'user',
      email: 'user@example.com',
      password: 'user123',
      role: 'user',
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed users:', err.message);
    process.exit(1);
  }
}

run();