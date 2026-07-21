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

/**
 * Liste complète des membres inscrits à UN département précis
 * (utilisé par l'Espace Responsable de Département).
 */
export async function getDeptInscriptionsByDepartment(departmentId: string): Promise<DeptInscriptionData[]> {
  const path = `inscriptions_departements (departmentId=${departmentId})`;
  try {
    const q = query(
      collection(db, 'inscriptions_departements'),
      where('departmentId', '==', departmentId)
    );
    const snapshot = await getDocs(q);
    const list: DeptInscriptionData[] = [];
    snapshot.forEach((doc: any) => list.push(doc.data() as DeptInscriptionData));
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

/**
 * Abonnement temps réel à la liste des membres d'un département : dès
 * qu'une nouvelle personne s'inscrit au département, la liste du responsable
 * se met à jour automatiquement sans recharger la page.
 */
export function subscribeToDeptMembers(
  departmentId: string,
  callback: (members: DeptInscriptionData[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'inscriptions_departements'),
    where('departmentId', '==', departmentId)
  );
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

/**
 * Récupère les statistiques globales en temps réel
 * Utilisé par le tableau de bord admin
 */
export function subscribeToGlobalStats(callback: (stats: GlobalStats) => void): Unsubscribe {
  const unsubscribers: Unsubscribe[] = [];

  // État initial des stats
  let currentStats: GlobalStats = {
    totalMembers: 0,
    totalDepartments: 0,
    totalDiaspora: 0,
    solidarityFund: 0,
    countriesMap: [],
    departmentsList: [],
    membersGrowth: 0,
    departmentsGrowth: 0,
    diasporaGrowth: 0,
    fundGrowth: 0
  };

  // Cache pour les données
  let membersCache: any[] = [];
  let departmentsCache: any[] = [];
  let donationsCache: any[] = [];

  // Fonction pour mettre à jour les statistiques
  const updateStats = () => {
    // Total des membres
    currentStats.totalMembers = membersCache.length;

    // Diaspora (membres hors Côte d'Ivoire)
    const diasporaMembers = membersCache.filter(m => m.country && m.country !== 'Côte d\'Ivoire');
    currentStats.totalDiaspora = diasporaMembers.length;

    // Répartition par pays
    const countryMap = new Map<string, number>();
    membersCache.forEach(m => {
      const country = m.country || 'Non spécifié';
      countryMap.set(country, (countryMap.get(country) || 0) + 1);
    });

    const total = membersCache.length || 1;
    currentStats.countriesMap = Array.from(countryMap.entries())
      .map(([country, count]) => ({
        country,
        count,
        percentage: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 pays

    // Départements
    currentStats.totalDepartments = departmentsCache.length;
    currentStats.departmentsList = departmentsCache.map(dept => ({
      name: dept.name || 'Département sans nom',
      leader: dept.leader || 'Non assigné',
      members: dept.members?.length || 0
    }));

    // Fonds de solidarité (total des dons)
    currentStats.solidarityFund = donationsCache.reduce(
      (total, d) => total + (d.amount || 0), 
      0
    );

    // Calcul des croissances (comparaison avec le mois précédent)
    // Note: Ces calculs nécessitent des données historiques
    // Pour l'instant, on utilise des valeurs par défaut
    currentStats.membersGrowth = 0;
    currentStats.departmentsGrowth = 0;
    currentStats.diasporaGrowth = 0;
    currentStats.fundGrowth = 0;

    callback(currentStats);
  };

  // 1. Écouter les membres
  const unsubMembers = onSnapshot(
    collection(db, 'users'),
    (snapshot) => {
      membersCache = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      updateStats();
    },
    (error) => {
      console.error('Erreur d\'écoute des membres:', error);
      callback(currentStats);
    }
  );
  unsubscribers.push(unsubMembers);

  // 2. Écouter les départements
  const unsubDepartments = onSnapshot(
    collection(db, 'departments'),
    (snapshot) => {
      departmentsCache = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      updateStats();
    },
    (error) => {
      console.error('Erreur d\'écoute des départements:', error);
      callback(currentStats);
    }
  );
  unsubscribers.push(unsubDepartments);

  // 3. Écouter les dons pour le fonds de solidarité
  const unsubDonations = onSnapshot(
    collection(db, 'donations'),
    (snapshot) => {
      donationsCache = snapshot.docs
        .map(doc => ({ id: doc.id, ...(doc.data() as any) }))
        .filter((d: any) => d.status === 'Confirmé');
      updateStats();
    },
    (error) => {
      console.error('Erreur d\'écoute des dons:', error);
      callback(currentStats);
    }
  );
  unsubscribers.push(unsubDonations);

  // Retourner une fonction pour se désabonner de toutes les écoutes
  return () => {
    unsubscribers.forEach(unsub => unsub());
  };
}

/**
 * Récupération unique des statistiques (sans temps réel)
 */
export async function getGlobalStatsOnce(): Promise<GlobalStats | null> {
  try {
    // Récupérer les membres
    const membersSnapshot = await getDocs(collection(db, 'users'));
    const members = membersSnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));

    // Récupérer les départements
    const deptsSnapshot = await getDocs(collection(db, 'departments'));
    const departments = deptsSnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));

    // Récupérer les dons
    const donationsSnapshot = await getDocs(collection(db, 'donations'));
    const donations = donationsSnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));

    // Total des membres
    const totalMembers = members.length;

    // Diaspora
    const diasporaMembers = members.filter(m => m.country && m.country !== 'Côte d\'Ivoire');
    const totalDiaspora = diasporaMembers.length;

    // Répartition par pays
    const countryMap = new Map<string, number>();
    members.forEach(m => {
      const country = m.country || 'Non spécifié';
      countryMap.set(country, (countryMap.get(country) || 0) + 1);
    });

    const total = members.length || 1;
    const countriesMap = Array.from(countryMap.entries())
      .map(([country, count]) => ({
        country,
        count,
        percentage: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Départements
    const totalDepartments = departments.length;
    const departmentsList = departments.map(dept => ({
      name: dept.name || 'Département sans nom',
      leader: dept.leader || 'Non assigné',
      members: dept.members?.length || 0
    }));

    // Fonds de solidarité (uniquement les dons confirmés)
    const confirmedDonations = donations.filter((d: any) => d.status === 'Confirmé');
    const solidarityFund = confirmedDonations.reduce((total: any, d: any) => total + (d.amount || 0), 0);

    // Croissances (à calculer avec des données historiques si disponibles)
    // Pour l'instant, on retourne 0
    const stats: GlobalStats = {
      totalMembers,
      totalDepartments,
      totalDiaspora,
      solidarityFund,
      countriesMap,
      departmentsList,
      membersGrowth: 0,
      departmentsGrowth: 0,
      diasporaGrowth: 0,
      fundGrowth: 0
    };

    return stats;
  } catch (error) {
    console.error('Erreur lors de la récupération des stats:', error);
    return null;
  }
}

/**
 * Calculer la croissance en pourcentage entre deux valeurs
 */
function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Récupérer les statistiques avec historique pour calculer les croissances
 */
export async function getGlobalStatsWithGrowth(): Promise<GlobalStats | null> {
  try {
    // Récupérer les données actuelles
    const membersSnapshot = await getDocs(collection(db, 'users'));
    const members = membersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as { createdAt?: string; country?: string })
    }));

    const deptsSnapshot = await getDocs(collection(db, 'departments'));
    const departments = deptsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as { createdAt?: string; name?: string; leader?: string; members?: unknown[] })
    }));

    const donationsSnapshot = await getDocs(collection(db, 'donations'));
    const donations = donationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as { date?: string; amount?: number })
    }));

    // Récupérer les données du mois précédent (exemple: utiliser un timestamp)
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const oneMonthAgoTimestamp = oneMonthAgo.toISOString();

    // Filtrer les membres du mois précédent
    const previousMembers = members.filter(m => 
      m.createdAt && m.createdAt < oneMonthAgoTimestamp
    );
    const previousMembersCount = previousMembers.length;

    // Filtrer les dons du mois précédent
    const previousDonations = donations.filter(d => 
      d.date && d.date < oneMonthAgoTimestamp
    );
    const previousDonationsTotal = previousDonations.reduce(
      (total, d) => total + (d.amount || 0), 
      0
    );

    // Statistiques actuelles
    const totalMembers = members.length;
    const totalDiaspora = members.filter(m => m.country && m.country !== 'Côte d\'Ivoire').length;
    const totalDepartments = departments.length;
    const solidarityFund = donations.reduce((total, d) => total + (d.amount || 0), 0);

    // Calcul des croissances
    const membersGrowth = calculateGrowth(totalMembers, previousMembersCount);
    const fundGrowth = calculateGrowth(solidarityFund, previousDonationsTotal);

    // Répartition par pays
    const countryMap = new Map<string, number>();
    members.forEach(m => {
      const country = m.country || 'Non spécifié';
      countryMap.set(country, (countryMap.get(country) || 0) + 1);
    });

    const total = members.length || 1;
    const countriesMap = Array.from(countryMap.entries())
      .map(([country, count]) => ({
        country,
        count,
        percentage: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Liste des départements
    const departmentsList = departments.map(dept => ({
      name: dept.name || 'Département sans nom',
      leader: dept.leader || 'Non assigné',
      members: dept.members?.length || 0
    }));

    // Croissance de la diaspora
    const previousDiaspora = previousMembers.filter(m => 
      // TS: previousMembers items may not always have a "country" property
      // guard using in-check to satisfy the compiler
      typeof m === 'object' && m !== null && 'country' in m && (m as any).country && (m as any).country !== 'Côte d\'Ivoire'
    ).length;
    const diasporaGrowth = calculateGrowth(totalDiaspora, previousDiaspora);

    // Croissance des départements (si on a l'historique)
    const previousDepartments = departments.filter(d => 
      d.createdAt && d.createdAt < oneMonthAgoTimestamp
    ).length;
    const departmentsGrowth = calculateGrowth(totalDepartments, previousDepartments);

    return {
      totalMembers,
      totalDepartments,
      totalDiaspora,
      solidarityFund,
      countriesMap,
      departmentsList,
      membersGrowth,
      departmentsGrowth,
      diasporaGrowth,
      fundGrowth
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des stats avec croissance:', error);
    return null;
  }
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

/**
 * Enregistre un don dans Firestore
 */
export async function saveDonationToFirestore(donation: DonationData) {
  const path = `donations/${donation.id}`;
  try {
    const docRef = doc(db, 'donations', donation.id);
    await setDoc(docRef, {
      ...donation,
      timestamp: serverTimestamp()
    });
    console.log('Don enregistré dans Firestore:', donation.id);
    return donation;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

/**
 * Récupère tous les dons
 */
export async function getDonations(): Promise<DonationData[]> {
  const path = 'donations';
  try {
    const colRef = collection(db, 'donations');
    const snapshot = await getDocs(colRef);
    const list: DonationData[] = [];
    snapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as DonationData);
    });
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

/**
 * Écoute en temps réel des dons pour le dashboard admin
 */
export function subscribeToDonations(callback: (donations: DonationData[]) => void): Unsubscribe {
  return onSnapshot(
    collection(db, 'donations'),
    (snapshot) => {
      const list: DonationData[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as DonationData);
      });
      callback(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    },
    (error) => {
      console.error('Erreur d\'écoute des dons:', error);
      callback([]);
    }
  );
}

/**
 * Met à jour le statut d'un don
 */
export async function updateDonationStatus(donationId: string, status: 'Confirmé' | 'Échoué') {
  const path = `donations/${donationId}`;
  try {
    await updateDoc(doc(db, 'donations', donationId), {
      status: status,
      updatedAt: serverTimestamp()
    });
    console.log('Statut du don mis à jour:', donationId, status);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}