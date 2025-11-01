// Firebase Cloud Messaging Service Worker
// This file handles background notifications

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBCdv37V6vOFMe42rGlPyl9lVq-9JldEPg",
  authDomain: "tank-tools-knpc-c2d95.firebaseapp.com",
  projectId: "tank-tools-knpc-c2d95",
  storageBucket: "tank-tools-knpc-c2d95.appspot.com",
  messagingSenderId: "678793823159",
  appId: "1:678793823159:web:7a7b1398aefdb7f24462b9"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve Firebase Messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  
  const notificationTitle = payload.notification?.title || 'Tank Tools KNPC';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: payload.notification?.icon || '/icon.png',
    badge: '/badge.png',
    tag: payload.data?.tankId || 'tank-notification',
    requireInteraction: true,
    vibrate: [200, 100, 200],
    data: payload.data || {},
    actions: [
      {
        action: 'view',
        title: 'View Details'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received:', event);
  
  event.notification.close();
  
  if (event.action === 'view') {
    // Open Live Tanks page
    event.waitUntil(
      clients.openWindow('/live-tanks.html')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    console.log('Notification dismissed');
  } else {
    // Default action: open Notifications Manager
    event.waitUntil(
      clients.openWindow('/notifications-manager.html')
    );
  }
});
