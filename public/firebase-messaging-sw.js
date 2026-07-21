// Ce fichier DOIT être servi tel quel depuis la racine du site
// (ex: https://votresite.store/firebase-messaging-sw.js), et pas depuis /assets.
// Vite/CRA : placez-le dans le dossier `public/`.

importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBmyS_6UO6LLOGEWG58WKovP5C1bONiCMc",
  authDomain: "christ-army-41aae.firebaseapp.com",
  projectId: "christ-army-41aae",
  storageBucket: "christ-army-41aae.firebasestorage.app",
  messagingSenderId: "373976237099",
  appId: "1:373976237099:web:fa306c79cbeb605745566e"
});

const messaging = firebase.messaging();

// Notifications reçues quand l'app/onglet est fermé ou en arrière-plan.
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'Christ Army';
  const options = {
    body: payload.notification?.body || '',
    icon: '/assets/logo.png',
    badge: '/assets/logo.png',
    data: payload.data || {},
  };
  self.registration.showNotification(title, options);
});

// Clic sur la notification : ouvre (ou focus) l'app.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});