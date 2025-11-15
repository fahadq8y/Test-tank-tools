// Vercel Cron Job - Check WhatsApp Reminders
// Runs every minute to check if reminders need to be sent

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin (only once)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

export default async function handler(req, res) {
  // Verify cron secret for security
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  console.log('🔄 Running WhatsApp reminders check...');

  try {
    const now = new Date();
    const currentTime = now.getTime();
    
    // Get all active reminders
    const remindersSnapshot = await db.collection('whatsappReminders')
      .where('active', '==', true)
      .get();

    if (remindersSnapshot.empty) {
      console.log('📭 No active reminders found');
      return res.status(200).json({ 
        success: true, 
        message: 'No active reminders',
        checked: 0
      });
    }

    console.log(`📋 Found ${remindersSnapshot.size} active reminders`);

    let sentCount = 0;
    let errorCount = 0;

    // Process each reminder
    for (const reminderDoc of remindersSnapshot.docs) {
      const reminder = reminderDoc.data();
      const { tankId, userId, phoneNumber, intervals } = reminder;

      try {
        // Get tank data
        const tankDoc = await db.collection('tanks').doc(tankId).get();
        
        if (!tankDoc.exists) {
          console.log(`⚠️ Tank ${tankId} not found, skipping...`);
          continue;
        }

        const tank = tankDoc.data();
        
        // Check if tank has end time
        if (!tank.endTime || !tank.endTime.seconds) {
          console.log(`⚠️ Tank ${tankId} has no end time, skipping...`);
          continue;
        }

        // Calculate time until tank ends (in minutes)
        const tankEndTime = tank.endTime.seconds * 1000;
        const timeUntilEnd = Math.floor((tankEndTime - currentTime) / 1000 / 60);

        console.log(`⏰ Tank ${tank.name || tankId}: ${timeUntilEnd} minutes remaining`);

        // Check if tank has already ended
        if (timeUntilEnd <= 0) {
          console.log(`⏰ Tank ${tank.name || tankId} has already ended, skipping...`);
          continue;
        }

        // Get sent reminders for this tank (to avoid duplicates)
        const sentRemindersKey = `sentReminders_${tankId}`;
        const sentReminders = reminder[sentRemindersKey] || [];

        // Check each interval
        for (const interval of intervals) {
          // Check if this interval was already sent
          if (sentReminders.includes(interval)) {
            continue;
          }

          // Check if current time matches the interval (±1 minute tolerance)
          const timeDiff = Math.abs(timeUntilEnd - interval);
          
          if (timeDiff <= 1) {
            console.log(`📱 Sending ${interval}-minute reminder for tank ${tank.name || tankId}`);

            // Prepare WhatsApp message data
            const messageData = {
              to: phoneNumber,
              tankName: tank.name || tankId,
              status: tank.status || 'Active',
              remainingTime: `${timeUntilEnd} minutes`
            };

            // Send WhatsApp message
            const whatsappResponse = await fetch(`${process.env.VERCEL_URL || 'https://devtools-psi.vercel.app'}/api/send-whatsapp`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(messageData)
            });

            const whatsappResult = await whatsappResponse.json();

            if (whatsappResult.success) {
              console.log(`✅ Reminder sent successfully to ${phoneNumber}`);
              sentCount++;

              // Mark this interval as sent
              sentReminders.push(interval);
              await db.collection('whatsappReminders').doc(reminderDoc.id).update({
                [sentRemindersKey]: sentReminders,
                lastSent: now
              });

              // Log the sent reminder
              await db.collection('whatsappLogs').add({
                tankId,
                tankName: tank.name || tankId,
                userId,
                phoneNumber,
                interval,
                timeRemaining: timeUntilEnd,
                sentAt: now,
                status: 'sent',
                messageSid: whatsappResult.messageSid
              });

            } else {
              console.error(`❌ Failed to send reminder: ${whatsappResult.error}`);
              errorCount++;

              // Log the error
              await db.collection('whatsappLogs').add({
                tankId,
                tankName: tank.name || tankId,
                userId,
                phoneNumber,
                interval,
                timeRemaining: timeUntilEnd,
                sentAt: now,
                status: 'failed',
                error: whatsappResult.error
              });
            }
          }
        }

        // Deactivate reminder if tank has ended or all intervals sent
        if (timeUntilEnd <= 0 || sentReminders.length >= intervals.length) {
          await db.collection('whatsappReminders').doc(reminderDoc.id).update({
            active: false,
            completedAt: now
          });
          console.log(`✅ Reminder for tank ${tank.name || tankId} completed`);
        }

      } catch (error) {
        console.error(`❌ Error processing reminder for tank ${tankId}:`, error);
        errorCount++;
      }
    }

    console.log(`✅ Cron job completed: ${sentCount} sent, ${errorCount} errors`);

    return res.status(200).json({
      success: true,
      checked: remindersSnapshot.size,
      sent: sentCount,
      errors: errorCount,
      timestamp: now.toISOString()
    });

  } catch (error) {
    console.error('❌ Cron job error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
