const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

async function test() {
  console.log('Testing connection to:', MONGODB_URI.split('@')[1]);
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      family: 4
    });
    console.log('✅ Connection SUCCESSFUL');
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection FAILED');
    console.error(err);
    process.exit(1);
  }
}

test();
