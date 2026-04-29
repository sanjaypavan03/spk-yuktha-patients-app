const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

async function dump() {
  try {
    await mongoose.connect(MONGODB_URI, { family: 4 });
    const Medicine = mongoose.models.Medicine || mongoose.model('Medicine', new mongoose.Schema({}, { strict: false }));
    
    const meds = await Medicine.find({});
    
    console.log('Total medicines found in database:', meds.length);
    meds.forEach(m => console.log(`Name: ${m.name}, User: ${m.userId}, ID: ${m._id}`));
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

dump();
