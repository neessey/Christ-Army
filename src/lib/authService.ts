import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth } from './firebase';
import { createUserProfile } from './firestoreService';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

/**
 * Crée un compte Firebase Auth + le document de profil Firestore associé.
 * Chaque membre obtient ainsi son propre espace (favoris, agenda, dons, etc.)
 * isolé par son uid.
 */
export async function registerMember({ name, email, password, phone }: RegisterInput) {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  const firebaseUser = credential.user;

  await updateProfile(firebaseUser, { displayName: name });

  await createUserProfile(firebaseUser.uid, {
    id: firebaseUser.uid,
    email: firebaseUser.email ?? email,
    name,
    phone: phone ?? '',
    role: 'user',
  });

  return firebaseUser;
}

export async function loginMember(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  return credential.user;
}

export async function logoutMember() {
  await signOut(auth);
}

export async function sendResetPasswordEmail(email: string) {
  await sendPasswordResetEmail(auth, email.trim());
}

/**
 * S'abonne aux changements d'état de connexion Firebase Auth.
 * Retourne la fonction de désinscription (à appeler dans le cleanup du useEffect).
 */
export function subscribeToAuthChanges(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/** Traduit les codes d'erreur Firebase Auth en messages lisibles en français. */
export function translateAuthError(error: unknown): string {
  const code = (error as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Cette adresse email est déjà associée à un compte membre.';
    case 'auth/invalid-email':
      return 'Adresse email invalide.';
    case 'auth/weak-password':
      return 'Le mot de passe doit contenir au moins 6 caractères.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Email ou mot de passe incorrect.';
    case 'auth/too-many-requests':
      return 'Trop de tentatives. Merci de réessayer dans quelques minutes.';
    default:
      return 'Une erreur est survenue. Merci de réessayer.';
  }
}