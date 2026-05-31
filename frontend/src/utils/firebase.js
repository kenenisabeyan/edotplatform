import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider, OAuthProvider } from 'firebase/auth';

const cleanEnvVar = (val) => {
  if (!val) return '';
  return val.replace(/^["']|["']$/g, '').trim();
};

const firebaseConfig = {
  apiKey: cleanEnvVar(import.meta.env.VITE_FIREBASE_API_KEY) || "AIzaSyAT5qol-jbgUCF57lpV9Ty5xFG1NgTgHRs",
  authDomain: cleanEnvVar(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) || "edot-platform.firebaseapp.com",
  projectId: cleanEnvVar(import.meta.env.VITE_FIREBASE_PROJECT_ID) || "edot-platform",
  storageBucket: cleanEnvVar(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET) || "edot-platform.firebasestorage.app",
  messagingSenderId: cleanEnvVar(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID) || "434156237374",
  appId: cleanEnvVar(import.meta.env.VITE_FIREBASE_APP_ID) || "1:434156237374:web:413303e8f4ea94c49bd76f"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
export const microsoftProvider = new OAuthProvider('microsoft.com');
