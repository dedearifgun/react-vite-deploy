const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/userModel');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/narpati-leather';

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log(`Admin already exists: ${existingAdmin.username}`);
      await mongoose.disconnect();
      process.exit(0);
    }

    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const email = process.env.ADMIN_EMAIL || 'admin@example.com';

    const admin = await User.create({
      name: 'Administrator',
      username,
      email,
      password,
      role: 'admin',
    });

    console.log('Admin created:', { username: admin.username, email: admin.email });
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed admin:', err.message);
    process.exit(1);
  }
}

run();