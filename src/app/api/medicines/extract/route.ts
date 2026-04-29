import { NextRequest, NextResponse } from 'next/server';
import { extractMedications } from '@/lib/gemini';
import { getTokenPayload } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const payload = await getTokenPayload(req);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { imageDataUri } = await req.json();
    if (!imageDataUri) return NextResponse.json({ error: 'Missing image data' }, { status: 400 });

    const result = await extractMedications(imageDataUri);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Extraction API Error:", error);
    return NextResponse.json({ error: error.message || 'Analysis failed' }, { status: 500 });
  }
}
