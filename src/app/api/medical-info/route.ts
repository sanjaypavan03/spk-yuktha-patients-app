import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MedicalInfo from '@/models/MedicalInfo';
import User from '@/models/User';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const authUser = await getAuthenticatedUser(request);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const medicalInfo = await MedicalInfo.findOne({ userId: authUser.userId }).lean();
    return NextResponse.json({ success: true, data: medicalInfo || {} });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch', details: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const authUser = await getAuthenticatedUser(request);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();

    const validFields = [
      'bloodGroup', 'knownAllergies', 'allergiesDetails', 'chronicConditions',
      'currentMedications', 'emergencyContact1Name', 'emergencyContact1Phone', 'emergencyContact1Relation',
      'hasPacemakerOrImplant', 'height', 'weight', 'smokingStatus', 'alcoholUse', 'physicalActivityLevel',
      'pastSurgeries', 'familyMedicalHistory', 'insuranceProvider', 'additionalNotes',
      'emergencyContact2Name', 'emergencyContact2Phone', 'emergencyContact2Relation'
    ];

    const updateData: any = {};

    validFields.forEach(field => {
      if (body[field] !== undefined) {
        let val = body[field];
        if (Array.isArray(val) && field !== 'pastSurgeries') {
          val = val.join(', ');
        }
        if (typeof val === 'string' && val === null) {
          val = '';
        }
        updateData[field] = val;
      }
    });

    // Map flattened contact fields to emergencyContacts array for model compatibility
    if (updateData.emergencyContact1Name || updateData.emergencyContact1Phone || updateData.emergencyContact1Relation) {
        updateData.emergencyContacts = [{
            name: updateData.emergencyContact1Name || '',
            phone: updateData.emergencyContact1Phone || '',
            relationship: updateData.emergencyContact1Relation || ''
        }];
        
        if (updateData.emergencyContact2Name || updateData.emergencyContact2Phone || updateData.emergencyContact2Relation) {
            updateData.emergencyContacts.push({
                name: updateData.emergencyContact2Name || '',
                phone: updateData.emergencyContact2Phone || '',
                relationship: updateData.emergencyContact2Relation || ''
            });
        }
    }

    const medicalInfo = await MedicalInfo.findOneAndUpdate(
      { userId: authUser.userId },
      { $set: { ...updateData, userId: authUser.userId } },
      { new: true, upsert: true, runValidators: false, setDefaultsOnInsert: true }
    ).lean();

    await User.findByIdAndUpdate(authUser.userId, { emergencyDetailsCompleted: true });

    return NextResponse.json({ success: true, data: medicalInfo });
  } catch (error: any) {
    return NextResponse.json({ error: 'Database Rejected Update', details: error.message }, { status: 500 });
  }
}
