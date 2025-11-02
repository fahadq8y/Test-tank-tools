/**
 * Tank Tools KNPC - Cloud Functions
 * Google Calendar integration functions
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { google } = require('googleapis');

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();

/**
 * Create Google Calendar Event
 */
async function createCalendarEvent(userToken, notification, notificationId) {
  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: userToken });
    
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    // Calculate alert time
    const finishTime = notification.finishDateTime.toDate();
    const alertMinutes = notification.alertMinutes || 30;
    const alertTime = new Date(finishTime.getTime() - (alertMinutes * 60 * 1000));
    
    const event = {
      summary: `🔔 Tank ${notification.tankNumber} Alert`,
      description: `Department: ${notification.department}\nProduct: ${notification.product}\n\nAlert: ${alertMinutes} minutes before target level`,
      start: {
        dateTime: alertTime.toISOString(),
        timeZone: 'Asia/Kuwait'
      },
      end: {
        dateTime: finishTime.toISOString(),
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
    
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event
    });
    
    console.log(`✅ Calendar event created: ${response.data.id}`);
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
    
    // Calculate alert time
    const finishTime = notification.finishDateTime.toDate();
    const alertMinutes = notification.alertMinutes || 30;
    const alertTime = new Date(finishTime.getTime() - (alertMinutes * 60 * 1000));
    
    const event = {
      summary: `🔔 Tank ${notification.tankNumber} Alert`,
      description: `Department: ${notification.department}\nProduct: ${notification.product}\n\nAlert: ${alertMinutes} minutes before target level`,
      start: {
        dateTime: alertTime.toISOString(),
        timeZone: 'Asia/Kuwait'
      },
      end: {
        dateTime: finishTime.toISOString(),
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
