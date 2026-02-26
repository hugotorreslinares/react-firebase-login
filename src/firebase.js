import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  isSignInWithEmailLink
} from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logOut = () => signOut(auth);
export const registerWithEmail = (email, password) => 
  createUserWithEmailAndPassword(auth, email, password);
export const loginWithEmail = (email, password) => 
  signInWithEmailAndPassword(auth, email, password);

export const sendEmailLink = async (email) => {
  await sendSignInLinkToEmail(auth, email, {
    url: `https://google-login-app-beta.vercel.app/login?email=${email}`,
    handleCodeInApp: true,
  });
  localStorage.setItem('emailForSignIn', email);
};

export const signInWithLink = (email, link) => 
  signInWithEmailLink(auth, email, link);

export const isEmailLinkSignIn = (link) => 
  isSignInWithEmailLink(link);

export const getStoredEmail = () => localStorage.getItem('emailForSignIn');

export const addIdea = async (titulo, idea) => {
  await addDoc(collection(db, 'ideas'), {
    titulo,
    idea,
    timestamp: Date.now()
  });
};

export const getIdeas = async () => {
  const snapshot = await getDocs(collection(db, 'ideas'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
