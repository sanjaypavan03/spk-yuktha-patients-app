import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MedicalInfo from '@/models/MedicalInfo';
import { getAuthenticatedUser } from '@/lib/auth';

/**
 * Check if Vault PIN exists
 * GET /api/auth/vault-pin/check
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const authUser = await getAuthenticatedUser(request);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const medicalInfo = await MedicalInfo.findOne({ patientId: authUser.userId }).select('+emergencyPin');
    
    return NextResponse.json({ 
        success: true, 
        hasPin: !!(medicalInfo && medicalInfo.emergencyPin) 
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to check status', details: error.message }, { status: 500 });
  }
}
