import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config();

// Define models briefly (to avoid importing the whole app structure which might fail in scratch)
const MedicineSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    endDate: Date,
    isActive: { type: Boolean, default: true }
});

const PillTrackingSchema = new mongoose.Schema({
    patientId: mongoose.Schema.Types.ObjectId,
    prescriptionId: mongoose.Schema.Types.ObjectId,
    medicineName: String,
    dosage: String,
    scheduledTime: String,
    date: Date,
    taken: { type: Boolean, default: false }
});

const Medicine = mongoose.models.Medicine || mongoose.model('Medicine', MedicineSchema);
const PillTracking = mongoose.models.PillTracking || mongoose.model('PillTracking', PillTrackingSchema);

async function test() {
    console.log("Connecting...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected.");

    try {
        const userId = new mongoose.Types.ObjectId();
        console.log("Creating Medicine...");
        const medicine = await Medicine.create({
            userId,
            name: "Test",
            dosage: "500",
            frequency: "BD",
            startDate: new Date(),
            endDate: new Date()
        });
        console.log("Medicine Created:", medicine._id);

        console.log("Creating Pill Tracking...");
        await PillTracking.create({
            patientId: userId,
            prescriptionId: medicine._id,
            medicineName: "Test",
            dosage: "500",
            scheduledTime: "08:00 AM",
            date: new Date()
        });
        console.log("Pill Tracking Created.");
        
    } catch (e) {
        console.error("ERROR DETECTED:", e);
    } finally {
        await mongoose.connection.close();
    }
}

test();
