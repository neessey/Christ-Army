import { getToken, onMessage } from 'firebase/messaging';
import { getMessagingInstance } from './firebase';
import { saveFcmToken, removeFcmToken } from './firestoreService';

// Clé VAPID publique : Firebase Console > Paramètres du projet > Cloud Messaging
// > "Certificats push web" > générer une paire de clés, puis coller ici.
const VAPID_KEY = 'BG8E983KDmHCHJ2Sp9zb1ffCPyW58YP57J4vAL7xXg8yvAOTPCNizD1_Jvc6btMcB-fuGgS99KcEGbsPnxuroYU';

// URL de votre petit serveur Node (même principe que celui de Huinest Food sur
// Render) qui utilise firebase-admin pour abonner un jeton à un topic FCM.
type ImportMetaWithEnv = ImportMeta & {
  readonly env: {
    readonly VITE_NOTIFICATIONS_API_URL?: string;
  };
};

const NOTIFICATIONS_API_URL = (import.meta as ImportMetaWithEnv).env.VITE_NOTIFICATIONS_API_URL;
 
// URL de votre petit serveur Node (même principe que celui de Huinest Food sur
// Render) qui utilise firebase-admin pour abonner un jeton à un topic FCM.
 
async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    return await navigator.serviceWorker.register('/firebase-messaging-sw.js');
  } catch (err) {
    console.error('Échec d\'enregistrement du service worker FCM:', err);
    return null;
  }
}
 
/**
 * Abonne le jeton FCM déjà enregistré d'un membre à un nouveau topic de
 * département — à appeler quand il rejoint un département APRÈS avoir déjà
 * activé les notifications (sinon il ne recevrait jamais les messages du
 * responsable de ce département tant qu'il ne réactive pas manuellement).
 */
export async function subscribeMemberToDepartmentTopic(
  uid: string,
  existingToken: string,
  departmentId: string
) {
  await subscribeTokenToTopics(uid, existingToken, [`dept-${departmentId}`]);
}
 
async function subscribeTokenToTopics(uid: string, token: string, topics: string[]) {
  if (!NOTIFICATIONS_API_URL) {
    console.warn('VITE_NOTIFICATIONS_API_URL non configurée : abonnement aux topics ignoré.');
    return;
  }
  try {
    await fetch(`${NOTIFICATIONS_API_URL}/api/register-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, token, topics }),
    });
  } catch (err) {
    console.error('Erreur d\'abonnement aux topics de notification:', err);
  }
}
 
/**
 * Flux complet d'activation des notifications pour un membre connecté :
 * 1. enregistre le service worker
 * 2. demande la permission navigateur
 * 3. récupère le jeton FCM de l'appareil
 * 4. le sauvegarde sur le profil Firestore du membre
 * 5. abonne l'appareil au topic "all-members" (+ topics de départements)
 *
 * Retourne le jeton obtenu, ou null si l'utilisateur a refusé / navigateur
 * non supporté.
 */
export async function enableNotificationsForMember(
  uid: string,
  extraTopics: string[] = []
): Promise<string | null> {
  const messaging = await getMessagingInstance();
  if (!messaging) return null;
 
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return null;
 
  const registration = await registerServiceWorker();
  if (!registration) return null;
 
  try {
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
    if (!token) return null;
 
    await saveFcmToken(uid, token);
    await subscribeTokenToTopics(uid, token, ['all-members', ...extraTopics]);
    return token;
  } catch (err) {
    console.error('Erreur lors de la récupération du jeton FCM:', err);
    return null;
  }
}
 
export async function disableNotificationsForMember(uid: string, token: string) {
  await removeFcmToken(uid, token);
  const { setNotificationsEnabled } = await import('./firestoreService');
  await setNotificationsEnabled(uid, false);
}
 
/** Écoute les notifications reçues pendant que l'app est ouverte au premier plan. */
export async function listenToForegroundNotifications(
  onNotification: (title: string, body: string) => void
) {
  const messaging = await getMessagingInstance();
  if (!messaging) return () => {};
 
  return onMessage(messaging, payload => {
    const title = payload.notification?.title ?? 'Christ Army';
    const body = payload.notification?.body ?? '';
    onNotification(title, body);
  });
}