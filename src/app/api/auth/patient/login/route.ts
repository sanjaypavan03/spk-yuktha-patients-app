/**
 * Patient Login Alias
 * POST /api/auth/patient/login
 * Just a proxy for the main login for specification parity
 */

import { POST as mainLogin } from '../../login/route';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  return mainLogin(request);
}
