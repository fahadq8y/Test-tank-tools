/**
 * Tank Tools KNPC - Cloud Functions
 * Scheduled notifications sender using Firebase Cloud Messaging
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

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
    // Map sound files to Pushover sounds
    const soundMap = {
      'sound1': 'persistent',
      'sound2': 'spacealarm',
      'sound3': 'siren'
    };
    
    const pushoverSound = soundMap[notification.soundFile] || 'persistent';
    
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
