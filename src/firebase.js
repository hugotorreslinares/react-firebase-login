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
  isSignInWithEmailLink,
  fetchSignInMethodsForEmail
} from "firebase/auth";
import { getFirestore, collection, addDoc, query, where, orderBy, getDocs, serverTimestamp } from "firebase/firestore";

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
  const actionCodeSettings = {
    url: `https://google-login-app-beta.vercel.app/login?email=${encodeURIComponent(email)}`,
    handleCodeInApp: true,
  };
  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  localStorage.setItem('emailForSignIn', email);
};

export const signInWithLink = (email, link) => 
  signInWithEmailLink(auth, email, link);

export const checkSignInMethods = (email) => 
  fetchSignInMethodsForEmail(auth, email);

export const isEmailLinkSignIn = (link) => 
  isSignInWithEmailLink(link);

export const getStoredEmail = () => localStorage.getItem('emailForSignIn');

export const logLogin = async (user) => {
  try {
    console.log('DB:', db);
    console.log('User:', user.uid, user.email);
    const loginData = {
      uid: user.uid,
      email: user.email || null,
      displayName: user.displayName || null,
      timestamp: new Date(),
    };
    console.log('Saving:', loginData);
    const docRef = await addDoc(collection(db, 'loginHistory'), loginData);
    console.log('Login logged with ID:', docRef.id);
  } catch (err) {
    console.error('Error logging login:', err);
    alert('Error guardando login: ' + err.message);
  }
};

export const getLoginHistory = async (uid) => {
  try {
    console.log('Fetching history for uid:', uid);
    const q = query(
      collection(db, 'loginHistory'),
      where('uid', '==', uid)
    );
    const snapshot = await getDocs(q);
    console.log('Docs found:', snapshot.size);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (err) {
    console.error('Error fetching:', err);
    return [];
  }
};
