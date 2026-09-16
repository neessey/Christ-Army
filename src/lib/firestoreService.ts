import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
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
import { db, auth } from './firebase';
import type { User, Department } from '../types';
import { DEPARTMENTS_DATA } from '../mockData';

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
      userId: auth.currentUser?.uid ?? null,
      email: auth.currentUser?.email ?? null,
      emailVerified: auth.currentUser?.emailVerified ?? false,
      isAnonymous: auth.currentUser?.isAnonymous ?? false,
      tenantId: auth.currentUser?.tenantId ?? null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email ?? null,
      })) ?? []
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

/** Abonnement temps réel à TOUTES les inscriptions de département, tous départements confondus (vue Leader). */
export function subscribeToAllDeptInscriptions(
  callback: (members: DeptInscriptionData[]) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, 'inscriptions_departements'),
    snapshot => {
      const list: DeptInscriptionData[] = [];
      snapshot.forEach(doc => list.push(doc.data() as DeptInscriptionData));
      callback(list);
    },
    error => console.error('Erreur d\'écoute globale des inscriptions:', error)
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
// 4. RÉFÉRENTIEL DÉPARTEMENTS — Firestore
// ============================================================

/**
 * Les départements sont la source de vérité du dashboard.
 * La lecture est publique afin que le site puisse afficher les départements.
 * L'écriture reste réservée à l'administrateur via les règles Firestore.
 */
export function subscribeToAllMembers(
  callback: (members: User[]) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, 'users'),
    snapshot => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as User));
      list.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
      callback(list);
    },
    error => console.error('Erreur d’écoute des membres:', error)
  );
}

export function subscribeToDepartments(
  callback: (departments: Department[]) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, 'departments'),
    snapshot => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Department));
      list.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
      callback(list);
    },
    error => console.error('Erreur d’écoute des départements:', error)
  );
}

/** Lit les départements une seule fois. */
export async function getDepartments(): Promise<Department[]> {
  try {
    const snapshot = await getDocs(collection(db, 'departments'));
    return snapshot.docs
      .map(d => ({ id: d.id, ...d.data() } as Department))
      .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'departments');
    return [];
  }
}

/**
 * Initialise les départements Firestore à partir du référentiel du projet,
 * uniquement lorsqu'un document n'existe pas encore.
 * Cela évite d'écraser des modifications faites depuis le dashboard.
 */
export async function ensureDepartmentsSeeded(): Promise<void> {
  try {
    const existing = await getDocs(collection(db, 'departments'));
    const existingIds = new Set(existing.docs.map(d => d.id));

    await Promise.all(
      DEPARTMENTS_DATA
        .filter(department => !existingIds.has(department.id))
        .map(department =>
          setDoc(doc(db, 'departments', department.id), {
            ...department,
            updatedAt: serverTimestamp(),
          })
        )
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'departments');
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

export function subscribeToGlobalStats(
  callback: (stats: GlobalStats) => void
): Unsubscribe {
  const unsubscribers: Unsubscribe[] = [];

  let membersCache: any[] = [];
  let departmentsCache: any[] = [];

  const updateStats = () => {
    // =========================
    // MEMBRES
    // =========================
    const totalMembers = membersCache.length;

    const diasporaMembers = membersCache.filter(
      member =>
        member.country &&
        member.country.trim().toLowerCase() !== "côte d'ivoire" &&
        member.country.trim().toLowerCase() !== "cote d'ivoire"
    );

    const totalDiaspora = diasporaMembers.length;

    // =========================
    // PAYS
    // =========================
    const countryMap = new Map<string, number>();

    membersCache.forEach(member => {
      const country = member.country?.trim() || "Non spécifié";

      countryMap.set(
        country,
        (countryMap.get(country) || 0) + 1
      );
    });

    const countriesMap = Array.from(countryMap.entries())
      .map(([country, count]) => ({
        country,
        count,
        percentage:
          totalMembers > 0
            ? Math.round((count / totalMembers) * 100)
            : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // =========================
    // DÉPARTEMENTS
    // =========================
    const totalDepartments = departmentsCache.length;

    const departmentsList = departmentsCache.map(department => ({
      name: department.name || "Département sans nom",
      leader: department.leader || "Non assigné",
      members: Array.isArray(department.members)
        ? department.members.length
        : 0,
    }));

    // =========================
    // DONS
    // donationHistory est dans users
    // =========================
    let solidarityFund = 0;

    membersCache.forEach(member => {
      const history = Array.isArray(member.donationHistory)
        ? member.donationHistory
        : [];

      history.forEach((donation: any) => {
        const status = donation.status;

        // On ne comptabilise que les dons confirmés.
        // Si ton historique ne contient pas de status,
        // le don est également comptabilisé.
        if (
          !status ||
          status === "Confirmé" ||
          status === "confirmed" ||
          status === "CONFIRMED"
        ) {
          solidarityFund += Number(donation.amount) || 0;
        }
      });
    });

    callback({
      totalMembers,
      totalDepartments,
      totalDiaspora,
      solidarityFund,
      countriesMap,
      departmentsList,

      // Pas d'historique fiable pour le moment.
      // On évite donc d'afficher de faux pourcentages.
      membersGrowth: 0,
      departmentsGrowth: 0,
      diasporaGrowth: 0,
      fundGrowth: 0,
    });
  };

  // =========================
  // USERS
  // =========================
  const unsubscribeUsers = onSnapshot(
    collection(db, "users"),
    snapshot => {
      membersCache = snapshot.docs.map(snapshotDoc => ({
        id: snapshotDoc.id,
        ...snapshotDoc.data(),
      }));

      updateStats();
    },
    error => {
      console.error(
        "Erreur d'écoute des membres :",
        error
      );

      updateStats();
    }
  );

  unsubscribers.push(unsubscribeUsers);

  // =========================
  // DEPARTMENTS
  // =========================
  const unsubscribeDepartments = onSnapshot(
    collection(db, "departments"),
    snapshot => {
      departmentsCache = snapshot.docs.map(snapshotDoc => ({
        id: snapshotDoc.id,
        ...snapshotDoc.data(),
      }));

      updateStats();
    },
    error => {
      console.error(
        "Erreur d'écoute des départements :",
        error
      );

      updateStats();
    }
  );

  unsubscribers.push(unsubscribeDepartments);

  return () => {
    unsubscribers.forEach(unsubscribe => unsubscribe());
  };
}

// ============================================================
// 5. FEUILLES DE PRÉSENCE (par département, visibles en temps réel par le Leader)
// ============================================================

export interface AttendanceSessionData {
  id: string;
  departmentId: string;
  departmentName: string;
  title: string;
  date: string;
  presentMemberIds: string[];
  totalMembers: number;
  createdAt?: unknown;
}

/** Crée une nouvelle session de présence pour un département. */
export async function saveAttendanceSession(session: AttendanceSessionData) {
  const path = `attendance_sessions/${session.id}`;
  try {
    const docRef = doc(db, 'attendance_sessions', session.id);
    await setDoc(docRef, { ...session, createdAt: serverTimestamp() });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/** Coche / décoche un membre comme présent sur une session donnée. */
export async function toggleAttendancePresence(sessionId: string, memberId: string, isCurrentlyPresent: boolean) {
  const path = `attendance_sessions/${sessionId}`;
  try {
    await updateDoc(doc(db, 'attendance_sessions', sessionId), {
      presentMemberIds: isCurrentlyPresent ? arrayRemove(memberId) : arrayUnion(memberId),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/** Met à jour le nombre total de membres rattachés à une session (ex: nouveaux inscrits). */
export async function updateAttendanceTotalMembers(sessionId: string, totalMembers: number) {
  const path = `attendance_sessions/${sessionId}`;
  try {
    await updateDoc(doc(db, 'attendance_sessions', sessionId), { totalMembers });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteAttendanceSession(sessionId: string) {
  const path = `attendance_sessions/${sessionId}`;
  try {
    await deleteDoc(doc(db, 'attendance_sessions', sessionId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/** Abonnement temps réel aux sessions de présence d'UN département (vue Manager). */
export function subscribeToDeptAttendance(
  departmentId: string,
  callback: (sessions: AttendanceSessionData[]) => void
): Unsubscribe {
  const q = query(collection(db, 'attendance_sessions'), where('departmentId', '==', departmentId));
  return onSnapshot(
    q,
    snapshot => {
      const list: AttendanceSessionData[] = [];
      snapshot.forEach(doc => list.push(doc.data() as AttendanceSessionData));
      list.sort((a: any, b: any) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      callback(list);
    },
    error => console.error('Erreur d\'écoute des présences du département:', error)
  );
}

/** Abonnement temps réel à TOUTES les sessions de présence, tous départements confondus (vue Leader). */
export function subscribeToAllAttendance(
  callback: (sessions: AttendanceSessionData[]) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, 'attendance_sessions'),
    snapshot => {
      const list: AttendanceSessionData[] = [];
      snapshot.forEach(doc => list.push(doc.data() as AttendanceSessionData));
      list.sort((a: any, b: any) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      callback(list);
    },
    error => console.error('Erreur d\'écoute globale des présences:', error)
  );
}

// ============================================================
// 6. GESTION DES DONS / COTISATIONS
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

// ============================================================
// 7. GESTION DES ÉVÉNEMENTS
// ============================================================

export interface FirestoreEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  speaker?: string;
  imageUrl: string;
  description: string;
  fullProgram?: string[];
  isFree?: boolean;
  countdownTarget: string;
  registeredCount?: number;
  maxCapacity?: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

/**
 * Crée un événement dans Firestore.
 */
export async function saveEvent(event: FirestoreEvent) {
  const path = `events/${event.id}`;

  try {
    await setDoc(doc(db, "events", event.id), {
      ...event,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log("Événement enregistré dans Firestore :", event.id);

    return event;
  } catch (error) {
    handleFirestoreError(
      error,
      OperationType.CREATE,
      path
    );

    throw error;
  }
}

/**
 * Met à jour un événement.
 */
export async function updateEvent(
  eventId: string,
  data: Partial<FirestoreEvent>
) {
  const path = `events/${eventId}`;

  try {
    await updateDoc(doc(db, "events", eventId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(
      error,
      OperationType.UPDATE,
      path
    );

    throw error;
  }
}

/**
 * Supprime un événement.
 */
export async function deleteEvent(eventId: string) {
  const path = `events/${eventId}`;

  try {
    await deleteDoc(doc(db, "events", eventId));
  } catch (error) {
    handleFirestoreError(
      error,
      OperationType.DELETE,
      path
    );

    throw error;
  }
}

/**
 * Écoute tous les événements en temps réel.
 */
export function subscribeToEvents(
  callback: (events: FirestoreEvent[]) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, "events"),
    snapshot => {
      const events: FirestoreEvent[] = snapshot.docs.map(
        snapshotDoc => ({
          id: snapshotDoc.id,
          ...(snapshotDoc.data() as Omit<FirestoreEvent, "id">),
        })
      );

      events.sort((a, b) => {
        const dateA = new Date(
          a.countdownTarget || a.date
        ).getTime();

        const dateB = new Date(
          b.countdownTarget || b.date
        ).getTime();

        return dateA - dateB;
      });

      callback(events);
    },
    error => {
      console.error(
        "Erreur d'écoute des événements :",
        error
      );

      callback([]);
    }
  );
}

/**
 * Récupère les événements une seule fois.
 */
export async function getEvents(): Promise<FirestoreEvent[]> {
  const path = "events";

  try {
    const snapshot = await getDocs(
      collection(db, "events")
    );

    return snapshot.docs.map(snapshotDoc => ({
      id: snapshotDoc.id,
      ...(snapshotDoc.data() as Omit<FirestoreEvent, "id">),
    }));
  } catch (error) {
    handleFirestoreError(
      error,
      OperationType.GET,
      path
    );

    return [];
  }
}

export { db };