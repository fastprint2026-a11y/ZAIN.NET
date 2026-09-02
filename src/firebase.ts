import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  collection 
} from 'firebase/firestore';
import firebaseConfigJson from '../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfigJson.firestoreDatabaseId || undefined);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const loginWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    // If popup was blocked or iframe restriction happened, attempt redirect
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
      console.warn('Popup blocked, attempting redirect sign-in...', error);
      await signInWithRedirect(auth, googleProvider);
      throw new Error('Membuka halaman otorisasi Google...');
    }
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

export { onAuthStateChanged, type User };
