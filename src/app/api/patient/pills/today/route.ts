import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PillTracking from '@/models/PillTracking';
import Medicine from '@/models/Medicine';
import Prescription from '@/models/Prescription'; // Register model for reference
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.log(`👤 Current User ID: ${user.userId}`);

        // Calculate the start and end of "today" in the user's local timezone
        const searchParams = request.nextUrl.searchParams;
        const tzOffsetParam = searchParams.get('tzOffset');
        const tzOffset = tzOffsetParam ? parseInt(tzOffsetParam) : 330; // Default to IST (330 mins)

        const offsetMs = tzOffset * 60 * 1000;
        const nowUtc = Date.now();
        // Calculate local midnight by taking UTC time + offset, flooring to day, then subtracting offset back
        const localMidnight = new Date(Math.floor((nowUtc + offsetMs) / 86400000) * 86400000 - offsetMs);
        const localEndOfDay = new Date(localMidnight.getTime() + 86400000 - 1);

        console.log(`📅 Fetching pills for exact range: ${localMidnight.toISOString()} to ${localEndOfDay.toISOString()}`);
        let pills = await PillTracking.find({
            patientId: user.userId,
            date: { $gte: localMidnight, $lte: localEndOfDay }
        }).sort({ scheduledTime: 1 });
        console.log(`✅ Found ${pills.length} pills in database.`);

        // SMART REPAIR: If no pills found for today, but user HAS active medicines, generate them!
        if (pills.length === 0) {
            console.log("🛠️ Smart Repair: Generating missing schedule entries...");
            const activeMeds = await Medicine.find({
                userId: user.userId,
                isActive: true,
                // Ensure the medicine is within its valid date range
                $or: [
                    { endDate: { $exists: false } },
                    { endDate: null },
                    { endDate: { $gte: localMidnight } }
                ],
                startDate: { $lte: localEndOfDay }
            });

            console.log(`📝 Found ${activeMeds.length} active medicine templates.`);

            if (activeMeds.length > 0) {
                const trackingEntries = [];

                for (const med of activeMeds) {
                    const times = med.times && med.times.length > 0 ? med.times : [med.time || '09:00 AM'];
                    
                    for (const scheduledTime of times) {
                        trackingEntries.push({
                            patientId: user.userId,
                            medicineName: med.name,
                            dosage: med.dosage,
                            scheduledTime,
                            date: localMidnight, // Save exactly at local midnight
                            taken: false,
                            prescriptionId: med._id,
                            tzOffset: tzOffset
                        });
                    }
                }

                if (trackingEntries.length > 0) {
                    await PillTracking.insertMany(trackingEntries);
                    console.log(`✨ Auto-generated ${trackingEntries.length} schedule entries.`);
                    // Re-fetch to get the new entries
                    pills = await PillTracking.find({
                        patientId: user.userId,
                        date: { $gte: localMidnight, $lte: localEndOfDay }
                    }).sort({ scheduledTime: 1 });
                }
            }
        }

        return NextResponse.json({ pills: pills });

    } catch (error: any) {
        console.error('Error fetching pills:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
