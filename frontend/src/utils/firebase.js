import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAT5qol-jbgUCF57lpV9Ty5xFG1NgTgHRs",
  authDomain: "edot-platform.firebaseapp.com",
  projectId: "edot-platform",
  storageBucket: "edot-platform.firebasestorage.app",
  messagingSenderId: "434156237374",
  appId: "1:434156237374:web:413303e8f4ea94c49bd76f"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
