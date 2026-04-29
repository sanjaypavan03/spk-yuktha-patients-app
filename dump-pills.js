const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

async function dump() {
  try {
    await mongoose.connect(MONGODB_URI, { family: 4 });
    const PillTracking = mongoose.models.PillTracking || mongoose.model('PillTracking', new mongoose.Schema({}, { strict: false }));
    
    const userId = '661a5c646b106f3a39e80a5d';
    const pills = await PillTracking.find({ patientId: new mongoose.Types.ObjectId(userId) });
    
    console.log(`Found ${pills.length} pills.`);
    pills.forEach(p => console.log(`ID: ${p._id}, Med: ${p.medicineName}, Time: ${p.scheduledTime}, Date: ${p.date.toISOString()}`));
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

dump();
