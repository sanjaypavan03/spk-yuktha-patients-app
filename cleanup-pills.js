const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

async function cleanup() {
  try {
    await mongoose.connect(MONGODB_URI, { family: 4 });
    
    // Define a proper schema so Mongoose knows how to query
    const pillSchema = new mongoose.Schema({
        patientId: mongoose.Schema.Types.ObjectId,
        medicineName: String,
        scheduledTime: String,
        date: Date
    });
    const PillTracking = mongoose.models.PillTracking || mongoose.model('PillTracking', pillSchema);
    
    const userId = '661a5c646b106f3a39e80a5d';
    const pills = await PillTracking.find({ patientId: new mongoose.Types.ObjectId(userId) });
    
    console.log(`Found ${pills.length} total pills for user.`);
    
    const seen = new Set();
    const toDelete = [];
    
    for (const pill of pills) {
      const dateStr = pill.date.toISOString().split('T')[0];
      const key = `${pill.medicineName}-${pill.scheduledTime}-${dateStr}`;
      
      if (seen.has(key)) {
        console.log(`Duplicate found: ${key} (ID: ${pill._id})`);
        toDelete.push(pill._id);
      } else {
        seen.add(key);
      }
    }
    
    if (toDelete.length > 0) {
      const result = await PillTracking.deleteMany({ _id: { $in: toDelete } });
      console.log(`🗑️ Deleted ${result.deletedCount} duplicate entries.`);
    } else {
      console.log('No duplicates found.');
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

cleanup();
