// Firebase Cloud Messaging Service Worker
// This file handles background notifications

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

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
