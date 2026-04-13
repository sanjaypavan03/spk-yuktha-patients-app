import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { analyzeMedicalReport } from '@/lib/gemini';

export async function POST(request: NextRequest) {
    try {
        const authUser = await getAuthenticatedUser(request);
        if (!authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { rawText, language = "English", imageDataUri } = body;

        if (!rawText && !imageDataUri) {
            return NextResponse.json({ error: 'Input data is required' }, { status: 400 });
        }

        console.log('🧪 Vault Analyze: Starting Unified Analysis...');
        const input = imageDataUri ? { imageDataUri } : rawText;
        const analysis = await analyzeMedicalReport(input, { language });

        return NextResponse.json({
            success: true,
            extracted: {
                ...analysis,
                rawData: rawText || "Analyzed from Image"
            }
        });

    } catch (error) {
        console.error('Vault Analyze Error:', error);
        return NextResponse.json({ error: 'Failed to analyze report' }, { status: 500 });
    }
}
