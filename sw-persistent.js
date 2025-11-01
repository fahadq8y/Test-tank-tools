// Persistent Notification Service Worker
// Handles persistent notifications for active tank reminders

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD7lJcoY33FEC9d6eWy67QIO9SV4lS24pg",
  authDomain: "tank-tools-knpc-c2d95.firebaseapp.com",
  projectId: "tank-tools-knpc-c2d95",
  storageBucket: "tank-tools-knpc-c2d95.firebasestorage.app",
  messagingSenderId: "510062594324",
  appId: "1:510062594324:web:b892fd02007a5ca2f0da01"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Store active reminders
let activeReminders = new Map();
let updateInterval = null;

// Start persistent notification updates
self.addEventListener('message', async (event) => {
  console.log('[sw-persistent.js] Received message:', event.data);
  
  if (event.data.type === 'START_PERSISTENT_NOTIFICATIONS') {
    const { username } = event.data;
    console.log(`🔔 Starting persistent notifications for user: ${username}`);
    
    // Start interval to update notifications every minute
    if (updateInterval) {
      clearInterval(updateInterval);
    }
    
    updateInterval = setInterval(async () => {
      await updatePersistentNotifications(username);
    }, 60000); // Every 1 minute
    
    // Initial update
    await updatePersistentNotifications(username);
  } else if (event.data.type === 'STOP_PERSISTENT_NOTIFICATIONS') {
    console.log('🔕 Stopping persistent notifications');
    
    if (updateInterval) {
      clearInterval(updateInterval);
      updateInterval = null;
    }
    
    // Close all persistent notifications
    const notifications = await self.registration.getNotifications();
    notifications.forEach(notification => {
      if (notification.tag && notification.tag.startsWith('tank-persistent-')) {
        notification.close();
      }
    });
    
    activeReminders.clear();
  } else if (event.data.type === 'SNOOZE_ALARM') {
    const { tankId } = event.data;
    console.log(`😴 Snoozing alarm for tank: ${tankId}`);
    
    // Close current alarm notification
    const notifications = await self.registration.getNotifications();
    notifications.forEach(notification => {
      if (notification.tag === `tank-alarm-${tankId}`) {
        notification.close();
      }
    });
    
    // Schedule snooze (5 minutes)
    setTimeout(async () => {
      await triggerAlarm(tankId);
    }, 5 * 60 * 1000);
  } else if (event.data.type === 'STOP_ALARM') {
    const { tankId } = event.data;
    console.log(`🛑 Stopping alarm for tank: ${tankId}`);
    
    // Close alarm notification
    const notifications = await self.registration.getNotifications();
    notifications.forEach(notification => {
      if (notification.tag === `tank-alarm-${tankId}`) {
        notification.close();
      }
    });
    
    // Mark alarm as stopped in activeReminders
    if (activeReminders.has(tankId)) {
      const reminder = activeReminders.get(tankId);
      reminder.alarmStopped = true;
      activeReminders.set(tankId, reminder);
    }
  }
});

// Update persistent notifications for active reminders
async function updatePersistentNotifications(username) {
  try {
    console.log(`🔄 Updating persistent notifications for: ${username}`);
    
    // Get active reminders from Firestore
    const remindersSnapshot = await db.collection('tankReminders')
      .where('username', '==', username)
      .where('active', '==', true)
      .get();
    
    const currentReminders = new Map();
    
    for (const doc of remindersSnapshot.docs) {
      const reminder = doc.data();
      const tankId = reminder.tankId;
      
      currentReminders.set(tankId, {
        id: doc.id,
        ...reminder
      });
      
      // Calculate time remaining
      const finishDateTime = reminder.finishDateTime.toDate();
      const now = new Date();
      const timeRemaining = finishDateTime - now;
      
      if (timeRemaining > 0) {
        // Update persistent notification
        await showPersistentNotification(tankId, reminder, timeRemaining);
        
        // Check if alarm should be triggered
        const alertTime = new Date(finishDateTime.getTime() - (reminder.alertMinutes * 60 * 1000));
        
        if (now >= alertTime && !reminder.alarmTriggered && !reminder.alarmStopped) {
          // Trigger alarm
          await triggerAlarm(tankId, reminder);
          
          // Mark as triggered
          await db.collection('tankReminders').doc(doc.id).update({
            alarmTriggered: true
          });
        }
      } else {
        // Tank finished, remove notification
        await closePersistentNotification(tankId);
        
        // Deactivate reminder
        await db.collection('tankReminders').doc(doc.id).update({
          active: false
        });
      }
    }
    
    // Close notifications for reminders that are no longer active
    const notifications = await self.registration.getNotifications();
    for (const notification of notifications) {
      if (notification.tag && notification.tag.startsWith('tank-persistent-')) {
        const tankId = notification.tag.replace('tank-persistent-', '');
        if (!currentReminders.has(tankId)) {
          notification.close();
        }
      }
    }
    
    activeReminders = currentReminders;
    
  } catch (error) {
    console.error('❌ Error updating persistent notifications:', error);
  }
}

// Show persistent notification
async function showPersistentNotification(tankId, reminder, timeRemaining) {
  const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  
  const finishDateTime = reminder.finishDateTime.toDate();
  const finishTimeStr = finishDateTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  
  const title = `🔔 Tank ${reminder.tankNumber} - ${reminder.department}`;
  const body = `⏱️ ${hours}h ${minutes}m remaining\n📊 Finishes at ${finishTimeStr}`;
  
  const options = {
    body: body,
    icon: '/icon.png',
    badge: '/badge.png',
    tag: `tank-persistent-${tankId}`,
    requireInteraction: false,
    silent: true,
    renotify: true,
    data: {
      tankId: tankId,
      type: 'persistent',
      ...reminder
    }
  };
  
  await self.registration.showNotification(title, options);
}

// Close persistent notification
async function closePersistentNotification(tankId) {
  const notifications = await self.registration.getNotifications();
  notifications.forEach(notification => {
    if (notification.tag === `tank-persistent-${tankId}`) {
      notification.close();
    }
  });
}

// Trigger alarm with snooze/stop buttons
async function triggerAlarm(tankId, reminder) {
  console.log(`🚨 Triggering alarm for tank: ${tankId}`);
  
  const title = `🚨 ALARM: Tank ${reminder.tankNumber}`;
  const body = `Tank ${reminder.tankNumber} (${reminder.department}) is finishing NOW!\n${reminder.product}`;
  
  const options = {
    body: body,
    icon: '/icon.png',
    badge: '/badge.png',
    tag: `tank-alarm-${tankId}`,
    requireInteraction: true,
    vibrate: [500, 200, 500, 200, 500],
    renotify: true,
    data: {
      tankId: tankId,
      type: 'alarm',
      ...reminder
    },
    actions: [
      {
        action: 'snooze',
        title: '😴 Snooze (5 min)'
      },
      {
        action: 'stop',
        title: '🛑 Stop'
      }
    ]
  };
  
  await self.registration.showNotification(title, options);
  
  // Play alarm sound (if possible in service worker context)
  // Note: Sound playback in service workers is limited
}

// Handle notification click
self.addEventListener('notificationclick', async (event) => {
  console.log('[sw-persistent.js] Notification click:', event);
  
  const notification = event.notification;
  const data = notification.data;
  
  if (event.action === 'snooze') {
    // Snooze alarm
    notification.close();
    
    // Send message to client to handle snooze
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach(client => {
      client.postMessage({
        type: 'SNOOZE_ALARM',
        tankId: data.tankId
      });
    });
    
    // Schedule snooze
    setTimeout(async () => {
      await triggerAlarm(data.tankId, data);
    }, 5 * 60 * 1000);
    
  } else if (event.action === 'stop') {
    // Stop alarm
    notification.close();
    
    // Send message to client to stop alarm
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach(client => {
      client.postMessage({
        type: 'STOP_ALARM',
        tankId: data.tankId
      });
    });
    
    // Update reminder to mark alarm as stopped
    if (data.id) {
      await db.collection('tankReminders').doc(data.id).update({
        alarmStopped: true
      });
    }
    
  } else {
    // Default action: open Live Tanks
    notification.close();
    
    event.waitUntil(
      clients.openWindow('/live-tanks.html')
    );
  }
});

console.log('[sw-persistent.js] Service Worker loaded');
