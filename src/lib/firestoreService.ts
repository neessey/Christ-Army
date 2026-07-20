import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type { User } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: false,
      isAnonymous: false,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ============================================================
// ESPACE MEMBRE — Profils utilisateurs (un document par membre)
// ============================================================

export interface NewUserProfileInput {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'user' | 'admin';
}

/** Crée le document de profil d'un nouveau membre (appelé une seule fois à l'inscription). */
export async function createUserProfile(uid: string, data: NewUserProfileInput) {
  const path = `users/${uid}`;
  try {
    const docRef = doc(db, 'users', uid);
    const profile: User & { phone?: string; createdAt: unknown; notificationsEnabled: boolean; fcmTokens: string[] } = {
      id: uid,
      email: data.email,
      name: data.name,
      phone: data.phone ?? '',
      role: data.role,
      favorites: [],
      eventsRegistered: [],
      joinedDepartments: [],
      donationHistory: [],
      notificationsEnabled: false,
      fcmTokens: [],
      createdAt: serverTimestamp(),
    };
    await setDoc(docRef, profile);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/** Récupère un profil membre une seule fois (ex: garde de route au chargement). */
export async function getUserProfile(uid: string): Promise<User | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? (snap.data() as User) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

/**
 * Abonnement temps réel au profil d'un membre : dès qu'un favori, une
 * inscription ou un don est ajouté (même depuis un autre appareil), l'UI
 * se met à jour automatiquement. Retourne la fonction de désinscription.
 */
export function subscribeToUserProfile(uid: string, callback: (user: User | null) => void): Unsubscribe {
  return onSnapshot(
    doc(db, 'users', uid),
    snap => callback(snap.exists() ? (snap.data() as User) : null),
    error => console.error('Erreur d\'écoute du profil membre:', error)
  );
}

/** Ajoute ou retire un enseignement des favoris du membre connecté. */
export async function toggleFavoriteTeaching(uid: string, teachingId: string, isCurrentlyFavorite: boolean) {
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), {
      favorites: isCurrentlyFavorite ? arrayRemove(teachingId) : arrayUnion(teachingId),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/** Inscrit le membre à un événement (agenda personnel). */
export async function registerUserToEvent(uid: string, eventId: string) {
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), {
      eventsRegistered: arrayUnion(eventId),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/** Rattache le membre à un département (bénévolat / service). */
export async function addUserToDepartment(uid: string, departmentId: string) {
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), {
      joinedDepartments: arrayUnion(departmentId),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/** Ajoute un reçu de don à l'historique personnel du membre. */
export async function addDonationToHistory(uid: string, donation: User['donationHistory'][number]) {
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), {
      donationHistory: arrayUnion(donation),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ============================================================
// NOTIFICATIONS PUSH (Firebase Cloud Messaging)
// ============================================================

/** Enregistre le jeton FCM de l'appareil courant sur le profil du membre. */
export async function saveFcmToken(uid: string, token: string) {
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), {
      fcmTokens: arrayUnion(token),
      notificationsEnabled: true,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/** Retire un jeton FCM (désactivation des notifications sur cet appareil). */
export async function removeFcmToken(uid: string, token: string) {
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), {
      fcmTokens: arrayRemove(token),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function setNotificationsEnabled(uid: string, enabled: boolean) {
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), { notificationsEnabled: enabled });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ============================================================
// 1. Enrôlement / Mouvement
// ============================================================
export interface EnrolementData {
  id: string;
  name: string;
  phone: string;
  email: string;
  country: string;
  city: string;
  church: string;
  profession: string;
  availability: string;
  motivation: string;
  serviceDomain: string;
  dateJoined: string;
}

export async function saveEnrolement(data: EnrolementData) {
  const path = `enrolements/${data.id}`;
  try {
    const docRef = doc(db, 'enrolements', data.id);
    await setDoc(docRef, {
      ...data,
      createdAt: serverTimestamp()
    });
    console.log('Enrôlement enregistré dans Firestore:', data.id);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getEnrolements(): Promise<EnrolementData[]> {
  const path = 'enrolements';
  try {
    const colRef = collection(db, 'enrolements');
    const snapshot = await getDocs(colRef);
    const list: EnrolementData[] = [];
    snapshot.forEach((doc:any) => {
      list.push(doc.data() as EnrolementData);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

// ============================================================
// 2. Inscription Département
// ============================================================
export interface DeptInscriptionData {
  id: string;
  name: string;
  phone: string;
  email: string;
  country: string;
  motivation: string;
  availability: string;
  departmentId: string;
  dateJoined: string;
}

export async function saveDeptInscription(data: DeptInscriptionData) {
  const path = `inscriptions_departements/${data.id}`;
  try {
    const docRef = doc(db, 'inscriptions_departements', data.id);
    await setDoc(docRef, {
      ...data,
      createdAt: serverTimestamp()
    });
    console.log('Inscription département enregistrée dans Firestore:', data.id);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getDeptInscriptions(): Promise<DeptInscriptionData[]> {
  const path = 'inscriptions_departements';
  try {
    const colRef = collection(db, 'inscriptions_departements');
    const snapshot = await getDocs(colRef);
    const list: DeptInscriptionData[] = [];
    snapshot.forEach((doc:any) => {
      list.push(doc.data() as DeptInscriptionData);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

// ============================================================
// 3. Inscription Événement
// ============================================================
export interface EventInscriptionData {
  id: string;
  eventId: string;
  eventTitle: string;
  userEmail: string;
  userName: string;
  dateRegistered: string;
}

export async function saveEventInscription(data: EventInscriptionData) {
  const path = `inscriptions_evenements/${data.id}`;
  try {
    const docRef = doc(db, 'inscriptions_evenements', data.id);
    await setDoc(docRef, {
      ...data,
      createdAt: serverTimestamp()
    });
    console.log('Inscription événement enregistrée dans Firestore:', data.id);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getEventInscriptions(): Promise<EventInscriptionData[]> {
  const path = 'inscriptions_evenements';
  try {
    const colRef = collection(db, 'inscriptions_evenements');
    const snapshot = await getDocs(colRef);
    const list: EventInscriptionData[] = [];
    snapshot.forEach((doc:any) => {
      list.push(doc.data() as EventInscriptionData);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}