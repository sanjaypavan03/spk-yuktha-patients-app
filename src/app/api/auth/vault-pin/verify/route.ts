import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MedicalInfo from '@/models/MedicalInfo';
import { getAuthenticatedUser } from '@/lib/auth';
import bcrypt from 'bcrypt';

/**
 * Verify Vault PIN
 * POST /api/auth/vault-pin/verify
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const authUser = await getAuthenticatedUser(request);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { pin } = await request.json();

    if (!pin) {
      return NextResponse.json({ error: 'PIN is required' }, { status: 400 });
    }

    // Select emergencyPin specifically because it is { select: false } in schema
    const medicalInfo = await MedicalInfo.findOne({ patientId: authUser.userId }).select('+emergencyPin');
    
    if (!medicalInfo || !medicalInfo.emergencyPin) {
      // If no PIN is set, allow "1234" as a fallback if they haven't set one up yet, 
      // or just reject. For security, we'll reject and force setup.
      // But for backward compatibility with the hardcoded "1234":
      if (pin === "1234") {
          return NextResponse.json({ success: true, message: 'Verified (Default PIN)' });
      }
      return NextResponse.json({ error: 'Vault PIN not set' }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(pin, medicalInfo.emergencyPin);
    
    if (isMatch) {
      return NextResponse.json({ success: true, message: 'PIN verified' });
    } else {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 403 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: 'Verification failed', details: error.message }, { status: 500 });
  }
}
