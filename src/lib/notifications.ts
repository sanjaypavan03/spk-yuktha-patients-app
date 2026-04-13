import dbConnect from './db';
import User from '@/models/User';
import MedicalInfo from '@/models/MedicalInfo';

/**
 * Emergency Notification Service
 * 
 * Handles alerting emergency contacts via SMS/WhatsApp/Push
 * when a patient's QR code is scanned.
 */

export async function sendEmergencyAlert(patientId: string, scanType: 'public' | 'professional' = 'public') {
    try {
        await dbConnect();

        const user = await User.findById(patientId);
        const medicalInfo = await MedicalInfo.findOne({ userId: patientId });

        if (!user || !medicalInfo) {
            console.error('[NotificationService] Failed to find user or medical info for alert');
            return false;
        }

        const primaryContact = medicalInfo.emergencyContacts?.[0] || {};
        const primaryContactName = primaryContact.name || 'Emergency contact';
        const primaryContactPhone = primaryContact.phone || 'unknown';

        const patientName = `${user.firstName} ${user.lastName}`;
        const alertType = scanType === 'public' ? 'EMERGENCY QR SCAN' : 'AUTHORIZED HOSPITAL SCAN';

        console.log(`\n--- 🚨 EMERGENCY NOTIFICATION TRIGGERED 🚨 ---`);
        console.log(`Alert Type: ${alertType}`);
        console.log(`Patient: ${patientName}`);
        console.log(`Notifying: ${primaryContactName} (${primaryContactPhone})`);
        console.log(`Message Template: "CRITICAL ALERT: ${patientName}'s Yuktha Emergency ID was just accessed by a responder. Standby for contact."`);
        console.log(`--- 🚨 END OF ALERT 🚨 ---\n`);

        /**
         * TODO: INTEGRATE SMS PROVIDER HERE
         * 
         * Example Twilio Implementation:
         * const twilio = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH);
         * await twilio.messages.create({
         *   body: `CRITICAL ALERT from Yuktha: ${patientName}'s Emergency ID was just scanned.`,
         *   to: primaryContactPhone,
         *   from: process.env.TWILIO_PHONE
         * });
         */

        return true;
    } catch (error) {
        console.error('[NotificationService] Error sending emergency alert:', error);
        return false;
    }
}
