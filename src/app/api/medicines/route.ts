/**
 * Medicines Routes
 * GET /api/medicines - Get all medicines for user
 * POST /api/medicines - Create new medicine
 * PATCH /api/medicines/[id] - Update medicine
 * DELETE /api/medicines/[id] - Delete medicine
 */

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Medicine from '@/models/Medicine';
import PillTracking from '@/models/PillTracking';
import { getAuthenticatedUser } from '@/lib/auth';

// GET - Fetch all medicines for authenticated user
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const authUser = await getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const medicines = await Medicine.find({ userId: authUser.userId }).sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        data: medicines,
        count: medicines.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get medicines error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch medicines' },
      { status: 500 }
    );
  }
}

// POST - Create new medicine
export async function POST(request: NextRequest) {
  try {
    await db();

    const authUser = await getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, dosage, frequency, purpose, instructions, startDate, duration, times: bodyTimes } = body;

    // 1. Determine the schedule times based on frequency if duration/frequency are provided
    // or use the custom times provided.
    const frequencyToTimes: Record<string, string[]> = {
      'OD': ['08:00 AM'],
      'BD': ['08:00 AM', '08:00 PM'],
      'TDS': ['08:00 AM', '02:00 PM', '08:00 PM'],
      'QID': ['07:00 AM', '12:00 PM', '05:00 PM', '09:00 PM'],
      'Once daily': ['08:00 AM'],
      'Twice daily': ['08:00 AM', '08:00 PM'],
      'Thrice daily': ['08:00 AM', '02:00 PM', '08:00 PM'],
    };

    let finalTimes = bodyTimes || frequencyToTimes[frequency] || ['09:00 AM'];
    
    // Normalize frequency name for consistency
    const displayFrequency = frequency || (finalTimes.length === 1 ? 'Once daily' : finalTimes.length === 2 ? 'Twice daily' : 'Custom');

    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);
    
    // Calculate endDate based on duration (in days)
    const durInDays = parseInt(duration) || 7;
    const end = new Date(start);
    end.setDate(start.getDate() + durInDays - 1);
    end.setHours(23, 59, 59, 999);

    // Create medicine template
    const medicine = await Medicine.create({
      userId: authUser.userId,
      name,
      dosage,
      times: finalTimes,
      frequency: displayFrequency,
      purpose,
      instructions,
      startDate: start,
      endDate: end,
    });

    // AUTO-GENERATE PillTracking entries for THE FULL DURATION
    const trackingEntries = [];
    const currentDate = new Date(start);

    for (let i = 0; i < durInDays; i++) {
      const entryDate = new Date(currentDate);
      
      for (const scheduledTime of finalTimes) {
        trackingEntries.push({
          patientId: authUser.userId,
          medicineName: name,
          dosage,
          scheduledTime,
          date: entryDate,
          taken: false,
          prescriptionId: medicine._id 
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (trackingEntries.length > 0) {
      await PillTracking.insertMany(trackingEntries);
    }

    return NextResponse.json(
      {
        success: true,
        data: medicine,
        message: `Medicine added for ${durInDays} days`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('❌ Create medicine error:', error);
    // Return detailed error for debugging during the system check
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create medicine',
        details: error.errors ? Object.keys(error.errors).map(k => `${k}: ${error.errors[k].message}`) : null,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
