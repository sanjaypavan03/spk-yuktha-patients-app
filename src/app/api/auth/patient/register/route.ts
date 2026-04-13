/**
 * Patient Register Route
 * POST /api/auth/patient/register
 * 
 * Creates a new patient account with phone support.
 */

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import MedicalInfo from '@/models/MedicalInfo';
import { generateToken, setAuthCookie } from '@/lib/auth';
import { generateQRCode, getQRPublicUrl } from '@/lib/qr';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { name, email, phone, password } = body;

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 409 }
      );
    }

    // Generate unique QR code and emergency token
    const qrCode = generateQRCode();
    const emergencyToken = uuidv4();

    // Split name into firstName and lastName
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || 'User';

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = await User.create({
      email: normalizedEmail,
      password: hashedPassword,
      name: name.trim(),
      firstName: firstName,
      lastName: lastName,
      phone: phone, // Saved from spec payload
      qrCode,
      emergencyToken,
      emergencyDetailsCompleted: false,
    });

    // Create entry in EmergencyToken collection
    const EmergencyToken = (await import('@/models/EmergencyToken')).default;
    await EmergencyToken.create({
      patientId: user._id, // CORRECTED
      token: emergencyToken,
      isActive: true,
      tier: 1
    });

    // Create empty medical info record
    await MedicalInfo.create({
      patientId: user._id, // CORRECTED: was userId
    });

    // Generate JWT token
    const token = await generateToken(user._id.toString(), user.email);

    const userResponse = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      phone: user.phone,
    };

    const response = NextResponse.json(
      {
        success: true,
        user: userResponse,
        token: token,
      },
      { status: 201 }
    );

    // Set HTTP-only cookie for web compatibility
    setAuthCookie(response, token);

    return response;
  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to register' },
      { status: 500 }
    );
  }
}
