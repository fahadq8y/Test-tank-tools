/**
 * Tank Tools KNPC - Cloud Functions
 * Scheduled notifications sender using Firebase Cloud Messaging
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { google } = require('googleapis');

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

// Pushover configuration
const PUSHOVER_API_URL = 'https://api.pushover.net/1/messages.json';
const PUSHOVER_APP_TOKEN = functions.config().pushover?.token || 'YOUR_PUSHOVER_APP_TOKEN';

/**
 * Send notification via Pushover
 */
async function sendPushoverNotification(userKey, notification, notificationId, timeRemaining) {
  const fetch = require('node-fetch');
  
  try {
    // Use persistent sound for all notifications (emergency alarm)
    const pushoverSound = 'persistent';
    
    const response = await fetch(PUSHOVER_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: PUSHOVER_APP_TOKEN,
        user: userKey,
        message: `${notification.department} - ${notification.product}\n⏰ ${timeRemaining} minutes remaining until target level`,
        title: `🔔 Tank ${notification.tankNumber} Alert`,
        priority: 2,  // Emergency priority (repeats until acknowledged)
        retry: 30,    // Retry every 30 seconds
        expire: 3600, // Expire after 1 hour
        sound: pushoverSound,
        url: 'https://test-tank-tools.vercel.app/live-tanks.html',
        url_title: 'View Tank Details'
      })
    });
    
    const result = await response.json();
    
    if (result.status === 1) {
      console.log(`✅ Pushover notification sent for Tank ${notification.tankNumber}`);
      
      // Mark as sent
      return db.collection('notificationsManager').doc(notificationId).update({
        sent: true,
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        pushoverResponse: result.request
      });
    } else {
      throw new Error(result.errors ? result.errors.join(', ') : 'Unknown Pushover error');
    }
  } catch (error) {
    console.error(`❌ Error sending Pushover notification for Tank ${notification.tankNumber}:`, error);
    
    // Mark as sent with error
    return db.collection('notificationsManager').doc(notificationId).update({
      sent: true,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      error: error.message
    });
  }
}

/**
 * Scheduled function that runs every minute
 * Checks for notifications that need to be sent
 */
exports.checkAndSendNotifications = functions.pubsub
  .schedule('every 1 minutes')
  .timeZone('Asia/Kuwait') // Kuwait timezone (GMT+3)
  .onRun(async (context) => {
    console.log('🔍 Checking for notifications to send...');
    
    try {
      const now = admin.firestore.Timestamp.now();
      const currentTime = now.toDate();
      
      // Query notifications that:
      // 1. Are enabled
      // 2. Haven't been sent yet
      // 3. Alert time has passed
      const notificationsSnapshot = await db.collection('notificationsManager')
        .where('active', '==', true)
        .where('sent', '==', false)
        .get();
      
      if (notificationsSnapshot.empty) {
        console.log('✅ No notifications to send');
        return null;
      }
      
      console.log(`📊 Found ${notificationsSnapshot.size} potential notifications`);
      
      const promises = [];
      
      for (const doc of notificationsSnapshot.docs) {
        const notification = doc.data();
        const notificationId = doc.id;
        
        // Calculate alert time
        const finishTime = notification.finishDateTime.toDate();
        const alertMinutes = notification.alertMinutes || 30;
        const alertTime = new Date(finishTime.getTime() - (alertMinutes * 60 * 1000));
        
        // Check if it's time to send
        if (currentTime >= alertTime) {
          console.log(`🔔 Sending notification for Tank ${notification.tankNumber}`);
          
          // Get user's FCM token
          const userDoc = await db.collection('users').doc(notification.userId).get();
          
          if (!userDoc.exists) {
            console.log(`❌ User ${notification.userId} not found`);
            continue;
          }
          
          const userData = userDoc.data();
          const fcmToken = userData.fcmToken;
          
          if (!fcmToken) {
            console.log(`❌ No FCM token for user ${notification.userId}`);
            // Mark as sent anyway to avoid repeated attempts
            promises.push(
              db.collection('notificationsManager').doc(notificationId).update({
                sent: true,
                sentAt: admin.firestore.FieldValue.serverTimestamp(),
                error: 'No FCM token'
              })
            );
            continue;
          }
          
          // Prepare notification message
          const timeRemaining = Math.round((finishTime - currentTime) / (60 * 1000));
          const message = {
            token: fcmToken,
            notification: {
              title: `🔔 Tank ${notification.tankNumber} Alert`,
              body: `${notification.department} - ${notification.product}\n⏰ ${timeRemaining} minutes remaining until target level`
            },
            data: {
              tankId: notification.tankId || '',
              tankNumber: notification.tankNumber || '',
              department: notification.department || '',
              notificationId: notificationId,
              soundFile: notification.soundFile || 'sound1',
              product: notification.product || '',
              type: 'tank_alert',
              url: '/live-tanks.html'
            },
            android: {
              priority: 'high',
              notification: {
                sound: 'default',
                channelId: 'tank_alerts',
                priority: 'high',
                defaultSound: true,
                defaultVibrateTimings: true
              }
            },
            apns: {
              payload: {
                aps: {
                  sound: 'default',
                  badge: 1
                }
              }
            },
            webpush: {
              notification: {
                requireInteraction: true,
                vibrate: [200, 100, 200],
                tag: `tank-${notification.tankNumber}`,
                renotify: true
              }
            }
          };
          
          // Check notification method and send accordingly
          const notificationMethod = userData.notificationMethod || 'pwa';
          
          if (notificationMethod === 'pushover' && userData.pushoverKey) {
            // Send via Pushover
            promises.push(
              sendPushoverNotification(userData.pushoverKey, notification, notificationId, timeRemaining)
            );
          } else if (notificationMethod === 'calendar' && userData.googleCalendarToken) {
            // Calendar events are created when notification is created, not here
            // Just mark as sent when time arrives
            promises.push(
              db.collection('notificationsManager').doc(notificationId).update({
                sent: true,
                sentAt: admin.firestore.FieldValue.serverTimestamp(),
                calendarNotificationTriggered: true
              }).then(() => {
                console.log(`✅ Calendar notification marked as sent for Tank ${notification.tankNumber}`);
              }).catch((error) => {
                console.error(`❌ Error marking calendar notification as sent:`, error);
              })
            );
          } else {
            // Send via FCM (default)
            promises.push(
              messaging.send(message)
              .then((response) => {
                console.log(`✅ Notification sent successfully for Tank ${notification.tankNumber}:`, response);
                
                // Mark as sent
                return db.collection('notificationsManager').doc(notificationId).update({
                  sent: true,
                  sentAt: admin.firestore.FieldValue.serverTimestamp(),
                  fcmResponse: response
                });
              })
              .catch((error) => {
                console.error(`❌ Error sending notification for Tank ${notification.tankNumber}:`, error);
                
                // Mark as sent with error to avoid repeated attempts
                return db.collection('notificationsManager').doc(notificationId).update({
                  sent: true,
                  sentAt: admin.firestore.FieldValue.serverTimestamp(),
                  error: error.message
                });
              })
            );
          }
        }
      }
      
      await Promise.all(promises);
      
      console.log(`✅ Processed ${promises.length} notifications`);
      return null;
      
    } catch (error) {
      console.error('❌ Error in checkAndSendNotifications:', error);
      return null;
    }
  });

/**
 * HTTP function to manually trigger notification check (for testing)
 */
exports.triggerNotificationCheck = functions.https.onRequest(async (req, res) => {
  console.log('🔍 Manual notification check triggered');
  
  try {
    // Call the scheduled function logic
    await exports.checkAndSendNotifications.run();
    
    res.status(200).json({
      success: true,
      message: 'Notification check completed'
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * HTTP function to send a test notification
 */
exports.sendTestNotification = functions.https.onRequest(async (req, res) => {
  const { userId } = req.query;
  
  if (!userId) {
    res.status(400).json({
      success: false,
      error: 'userId parameter required'
    });
    return;
  }
  
  try {
    // Get user's FCM token
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }
    
    const userData = userDoc.data();
    const fcmToken = userData.fcmToken;
    
    if (!fcmToken) {
      res.status(400).json({
        success: false,
        error: 'No FCM token for this user'
      });
      return;
    }
    
    // Send test notification
    const message = {
      token: fcmToken,
      notification: {
        title: '🧪 Test Notification',
        body: 'This is a test notification from Tank Tools KNPC'
      },
      data: {
        type: 'test',
        timestamp: new Date().toISOString()
      }
    };
    
    const response = await messaging.send(message);
    
    console.log('✅ Test notification sent:', response);
    
    res.status(200).json({
      success: true,
      message: 'Test notification sent successfully',
      response: response
    });
    
  } catch (error) {
    console.error('❌ Error sending test notification:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Create Google Calendar Event
 */
async function createCalendarEvent(userToken, notification, notificationId) {
  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: userToken });
    
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    // Calculate event time (notification time)
    const finishTime = notification.finishDateTime.toDate();
    const alertMinutes = notification.alertMinutes || 0;
    const eventTime = new Date(finishTime.getTime() - (alertMinutes * 60 * 1000));
    
    // Create event
    const event = {
      summary: `🔔 Tank ${notification.tankNumber} Alert`,
      description: `${notification.department} - ${notification.product}\n⏰ Alert: ${alertMinutes} minutes before finish\n🎯 Target finish time: ${finishTime.toLocaleString('en-US', { timeZone: 'Asia/Kuwait' })}\n\n🔗 View details: https://test-tank-tools.vercel.app/live-tanks.html`,
      start: {
        dateTime: eventTime.toISOString(),
        timeZone: 'Asia/Kuwait'
      },
      end: {
        dateTime: new Date(eventTime.getTime() + 15 * 60 * 1000).toISOString(), // 15 minutes duration
        timeZone: 'Asia/Kuwait'
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 0 },
          { method: 'popup', minutes: 5 }
        ]
      },
      colorId: '11' // Red color for alerts
    };
    
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event
    });
    
    console.log(`✅ Calendar event created: ${response.data.id}`);
    
    // Save event ID to notification document
    await db.collection('notificationsManager').doc(notificationId).update({
      calendarEventId: response.data.id,
      calendarEventCreated: true,
      calendarEventLink: response.data.htmlLink
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Error creating calendar event:', error);
    throw error;
  }
}

/**
 * Update Google Calendar Event
 */
async function updateCalendarEvent(userToken, notification, notificationId) {
  try {
    if (!notification.calendarEventId) {
      console.log('⚠️ No calendar event ID found, creating new event');
      return await createCalendarEvent(userToken, notification, notificationId);
    }
    
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: userToken });
    
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    // Calculate event time
    const finishTime = notification.finishDateTime.toDate();
    const alertMinutes = notification.alertMinutes || 0;
    const eventTime = new Date(finishTime.getTime() - (alertMinutes * 60 * 1000));
    
    // Update event
    const event = {
      summary: `🔔 Tank ${notification.tankNumber} Alert`,
      description: `${notification.department} - ${notification.product}\n⏰ Alert: ${alertMinutes} minutes before finish\n🎯 Target finish time: ${finishTime.toLocaleString('en-US', { timeZone: 'Asia/Kuwait' })}\n\n🔗 View details: https://test-tank-tools.vercel.app/live-tanks.html`,
      start: {
        dateTime: eventTime.toISOString(),
        timeZone: 'Asia/Kuwait'
      },
      end: {
        dateTime: new Date(eventTime.getTime() + 15 * 60 * 1000).toISOString(),
        timeZone: 'Asia/Kuwait'
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 0 },
          { method: 'popup', minutes: 5 }
        ]
      },
      colorId: '11'
    };
    
    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId: notification.calendarEventId,
      resource: event
    });
    
    console.log(`✅ Calendar event updated: ${response.data.id}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error updating calendar event:', error);
    throw error;
  }
}

/**
 * Delete Google Calendar Event
 */
async function deleteCalendarEvent(userToken, eventId) {
  try {
    if (!eventId) {
      console.log('⚠️ No event ID provided');
      return;
    }
    
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: userToken });
    
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId
    });
    
    console.log(`✅ Calendar event deleted: ${eventId}`);
  } catch (error) {
    console.error('❌ Error deleting calendar event:', error);
    throw error;
  }
}

/**
 * HTTP function to send Pushover test notification
 */
exports.sendPushoverTest = functions.https.onCall(async (data, context) => {
  const fetch = require('node-fetch');
  
  try {
    const { userKey } = data;
    
    if (!userKey) {
      throw new functions.https.HttpsError('invalid-argument', 'User key is required');
    }
    
    const response = await fetch(PUSHOVER_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: PUSHOVER_APP_TOKEN,
        user: userKey,
        message: 'This is a test alarm from Tank Tools KNPC!\n🧪 Testing Pushover integration',
        title: '🧪 Test Alarm',
        priority: 2,  // Emergency
        retry: 30,
        expire: 300,  // 5 minutes for test
        sound: 'siren'
      })
    });
    
    const result = await response.json();
    
    if (result.status === 1) {
      console.log('✅ Pushover test sent successfully');
      return {
        success: true,
        message: 'Test alarm sent successfully'
      };
    } else {
      throw new Error(result.errors ? result.errors.join(', ') : 'Unknown error');
    }
  } catch (error) {
    console.error('❌ Error sending Pushover test:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});


/**
 * HTTP Callable Function: Create Calendar Event
 */
exports.createCalendarEvent = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    
    const { notificationId } = data;
    
    if (!notificationId) {
      throw new functions.https.HttpsError('invalid-argument', 'notificationId is required');
    }
    
    // Get user's Google token
    const userId = context.auth.uid;
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    if (!userData?.googleCalendarToken) {
      throw new functions.https.HttpsError('failed-precondition', 'Google Calendar not connected');
    }
    
    // Get notification data
    const notificationDoc = await db.collection('notificationsManager').doc(notificationId).get();
    
    if (!notificationDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Notification not found');
    }
    
    const notification = notificationDoc.data();
    
    // Create calendar event
    const event = await createCalendarEvent(userData.googleCalendarToken, notification, notificationId);
    
    return {
      success: true,
      eventId: event.id,
      eventLink: event.htmlLink
    };
  } catch (error) {
    console.error('❌ Error in createCalendarEvent function:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * HTTP Callable Function: Update Calendar Event
 */
exports.updateCalendarEvent = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    
    const { notificationId } = data;
    
    if (!notificationId) {
      throw new functions.https.HttpsError('invalid-argument', 'notificationId is required');
    }
    
    // Get user's Google token
    const userId = context.auth.uid;
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    if (!userData?.googleCalendarToken) {
      throw new functions.https.HttpsError('failed-precondition', 'Google Calendar not connected');
    }
    
    // Get notification data
    const notificationDoc = await db.collection('notificationsManager').doc(notificationId).get();
    
    if (!notificationDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Notification not found');
    }
    
    const notification = notificationDoc.data();
    
    // Update calendar event
    const event = await updateCalendarEvent(userData.googleCalendarToken, notification, notificationId);
    
    return {
      success: true,
      eventId: event.id,
      eventLink: event.htmlLink
    };
  } catch (error) {
    console.error('❌ Error in updateCalendarEvent function:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * HTTP Callable Function: Delete Calendar Event
 */
exports.deleteCalendarEvent = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    
    const { notificationId } = data;
    
    if (!notificationId) {
      throw new functions.https.HttpsError('invalid-argument', 'notificationId is required');
    }
    
    // Get user's Google token
    const userId = context.auth.uid;
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    if (!userData?.googleCalendarToken) {
      throw new functions.https.HttpsError('failed-precondition', 'Google Calendar not connected');
    }
    
    // Get notification data
    const notificationDoc = await db.collection('notificationsManager').doc(notificationId).get();
    
    if (!notificationDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Notification not found');
    }
    
    const notification = notificationDoc.data();
    
    if (!notification.calendarEventId) {
      return { success: true, message: 'No calendar event to delete' };
    }
    
    // Delete calendar event
    await deleteCalendarEvent(userData.googleCalendarToken, notification.calendarEventId);
    
    // Remove event ID from notification
    await db.collection('notificationsManager').doc(notificationId).update({
      calendarEventId: admin.firestore.FieldValue.delete(),
      calendarEventCreated: false,
      calendarEventLink: admin.firestore.FieldValue.delete()
    });
    
    return {
      success: true,
      message: 'Calendar event deleted'
    };
  } catch (error) {
    console.error('❌ Error in deleteCalendarEvent function:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
