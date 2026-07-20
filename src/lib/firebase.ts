import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getMessaging, isSupported, type Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyBmyS_6UO6LLOGEWG58WKovP5C1bONiCMc",
  authDomain: "christ-army-41aae.firebaseapp.com",
  projectId: "christ-army-41aae",
  storageBucket: "christ-army-41aae.firebasestorage.app",
  messagingSenderId: "373976237099",
  appId: "1:373976237099:web:fa306c79cbeb605745566e"
};

const app = initializeApp(firebaseConfig);

// Using custom databaseId from firebase-applet-config.json
const db = getFirestore(app, "(default)");
const auth = getAuth(app);

// Messaging is only available in the browser, over HTTPS, and on supported
// browsers (no Safari < 16.4, no private/incognito in some cases). We lazily
// resolve it so importing this file never crashes SSR or unsupported clients.
let messagingInstance: Messaging | null = null;
let messagingPromise: Promise<Messaging | null> | null = null;

export function getMessagingInstance(): Promise<Messaging | null> {
  if (messagingInstance) return Promise.resolve(messagingInstance);
  if (!messagingPromise) {
    messagingPromise = isSupported().then(supported => {
      if (!supported) {
        console.warn('Firebase Cloud Messaging is not supported on ce navigateur.');
        return null;
      }
      messagingInstance = getMessaging(app);
      return messagingInstance;
    }).catch(err => {
      console.error('Erreur d\'initialisation FCM:', err);
      return null;
    });
  }
  return messagingPromise;
}

export { app, db, auth };