import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MedicalInfo from '@/models/MedicalInfo';
import { getAuthenticatedUser } from '@/lib/auth';
import bcrypt from 'bcrypt';

/**
 * Update Vault PIN
 * POST /api/auth/vault-pin
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const authUser = await getAuthenticatedUser(request);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { pin, oldPin } = await request.json();

    if (!pin || pin.length !== 4 || !/^\d+$/.test(pin)) {
      return NextResponse.json({ error: 'New PIN must be exactly 4 digits' }, { status: 400 });
    }

    // Check if user already has a PIN
    const medicalInfo = await MedicalInfo.findOne({ patientId: authUser.userId }).select('+emergencyPin');
    
    if (medicalInfo && medicalInfo.emergencyPin) {
        if (!oldPin) {
            return NextResponse.json({ error: 'Current PIN is required to set a new one' }, { status: 400 });
        }
        
        const isMatch = await bcrypt.compare(oldPin, medicalInfo.emergencyPin);
        if (!isMatch) {
            return NextResponse.json({ error: 'Incorrect current PIN' }, { status: 403 });
        }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPin = await bcrypt.hash(pin, salt);

    await MedicalInfo.findOneAndUpdate(
      { patientId: authUser.userId },
      { $set: { emergencyPin: hashedPin } },
      { upsert: true }
    );

    return NextResponse.json({ success: true, message: 'Vault PIN updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update PIN', details: error.message }, { status: 500 });
  }
}
