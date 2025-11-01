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
        .where('enabled', '==', true)
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
        const alertMinutes = notification.alertTime || 30;
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
              body: `${notification.department} - ${notification.product}\n⏰ ${timeRemaining} minutes remaining until target level`,
              icon: '/icon.png'
            },
            data: {
              tankId: notification.tankId || '',
              tankNumber: notification.tankNumber || '',
              department: notification.department || '',
              notificationId: notificationId,
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
          
          // Send notification
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
        body: 'This is a test notification from Tank Tools KNPC',
        icon: '/icon.png'
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
