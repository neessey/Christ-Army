import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
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
  role: 'user' | 'manager' | 'admin';
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

/** Récupère un profil membre une seule fois. */
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

/** Abonnement temps réel au profil d'un membre. */
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

/** Inscrit le membre à un événement. */
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

/** Rattache le membre à un département. */
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
    await setDoc(docRef, { ...data, createdAt: serverTimestamp() });
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
    snapshot.forEach((doc: any) => list.push(doc.data() as EnrolementData));
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
    await setDoc(docRef, { ...data, createdAt: serverTimestamp() });
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
    snapshot.forEach((doc: any) => list.push(doc.data() as DeptInscriptionData));
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export async function getDeptInscriptionsByDepartment(departmentId: string): Promise<DeptInscriptionData[]> {
  const path = `inscriptions_departements (departmentId=${departmentId})`;
  try {
    const q = query(collection(db, 'inscriptions_departements'), where('departmentId', '==', departmentId));
    const snapshot = await getDocs(q);
    const list: DeptInscriptionData[] = [];
    snapshot.forEach((doc: any) => list.push(doc.data() as DeptInscriptionData));
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export function subscribeToDeptMembers(
  departmentId: string,
  callback: (members: DeptInscriptionData[]) => void
): Unsubscribe {
  const q = query(collection(db, 'inscriptions_departements'), where('departmentId', '==', departmentId));
  return onSnapshot(
    q,
    snapshot => {
      const list: DeptInscriptionData[] = [];
      snapshot.forEach(doc => list.push(doc.data() as DeptInscriptionData));
      callback(list);
    },
    error => console.error('Erreur d\'écoute des membres du département:', error)
  );
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
    await setDoc(docRef, { ...data, createdAt: serverTimestamp() });
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
    snapshot.forEach((doc: any) => list.push(doc.data() as EventInscriptionData));
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

// ============================================================
// 4. STATISTIQUES GLOBALES
// ============================================================

export interface CountryStat {
  country: string;
  count: number;
  percentage: number;
}

export interface DepartmentStat {
  name: string;
  leader: string;
  members: number;
}

export interface GlobalStats {
  totalMembers: number;
  totalDepartments: number;
  totalDiaspora: number;
  solidarityFund: number;
  countriesMap: CountryStat[];
  departmentsList: DepartmentStat[];
  membersGrowth: number;
  departmentsGrowth: number;
  diasporaGrowth: number;
  fundGrowth: number;
}

export function subscribeToGlobalStats(callback: (stats: GlobalStats) => void): Unsubscribe {
  const unsubscribers: Unsubscribe[] = [];
  let currentStats: GlobalStats = {
    totalMembers: 0, totalDepartments: 0, totalDiaspora: 0, solidarityFund: 0,
    countriesMap: [], departmentsList: [], membersGrowth: 0, departmentsGrowth: 0,
    diasporaGrowth: 0, fundGrowth: 0
  };

  let membersCache: any[] = [];
  let departmentsCache: any[] = [];
  let donationsCache: any[] = [];

  const updateStats = () => {
    currentStats.totalMembers = membersCache.length;
    const diasporaMembers = membersCache.filter(m => m.country && m.country !== 'Côte d\'Ivoire');
    currentStats.totalDiaspora = diasporaMembers.length;

    const countryMap = new Map<string, number>();
    membersCache.forEach(m => {
      const country = m.country || 'Non spécifié';
      countryMap.set(country, (countryMap.get(country) || 0) + 1);
    });

    const total = membersCache.length || 1;
    currentStats.countriesMap = Array.from(countryMap.entries())
      .map(([country, count]) => ({ country, count, percentage: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    currentStats.totalDepartments = departmentsCache.length;
    currentStats.departmentsList = departmentsCache.map(dept => ({
      name: dept.name || 'Département sans nom',
      leader: dept.leader || 'Non assigné',
      members: dept.members?.length || 0
    }));

    currentStats.solidarityFund = donationsCache.reduce((total, d) => total + (d.amount || 0), 0);
    callback(currentStats);
  };

  unsubscribers.push(onSnapshot(collection(db, 'users'), snap => {
    membersCache = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    updateStats();
  }));

  unsubscribers.push(onSnapshot(collection(db, 'departments'), snap => {
    departmentsCache = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    updateStats();
  }));

  unsubscribers.push(onSnapshot(collection(db, 'donations'), snap => {
    donationsCache = snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) })).filter((d: any) => d.status === 'Confirmé');
    updateStats();
  }));

  return () => unsubscribers.forEach(unsub => unsub());
}

// ============================================================
// 5. GESTION DES DONS / COTISATIONS
// ============================================================

export interface DonationData {
  id: string;
  amount: number;
  paymentMethod: string;
  date: string;
  status: 'En attente' | 'Confirmé' | 'Échoué';
  referenceCode: string;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  createdAt: string;
}

export async function saveDonationToFirestore(donation: DonationData) {
  const path = `donations/${donation.id}`;
  try {
    const docRef = doc(db, 'donations', donation.id);
    await setDoc(docRef, { ...donation, timestamp: serverTimestamp() });
    return donation;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function getDonations(): Promise<DonationData[]> {
  const path = 'donations';
  try {
    const snapshot = await getDocs(collection(db, 'donations'));
    const list: DonationData[] = [];
    snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as DonationData));
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export function subscribeToDonations(callback: (donations: DonationData[]) => void): Unsubscribe {
  return onSnapshot(collection(db, 'donations'), (snapshot) => {
    const list: DonationData[] = [];
    snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as DonationData));
    callback(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  });
}

export async function updateDonationStatus(donationId: string, status: 'Confirmé' | 'Échoué') {
  const path = `donations/${donationId}`;
  try {
    await updateDoc(doc(db, 'donations', donationId), { status, updatedAt: serverTimestamp() });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

export { db };
