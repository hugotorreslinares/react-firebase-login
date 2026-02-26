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
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.trim(),
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim(),
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim(),
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim(),
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim(),
  appId: import.meta.env.VITE_FIREBASE_APP_ID?.trim()
};

console.log('Firebase config projectId:', firebaseConfig.projectId);

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

export const addIdea = async (titulo, idea, isPublic, user) => {
  await addDoc(collection(db, 'ideas'), {
    titulo,
    idea,
    public: isPublic,
    createdBy: user.email,
    createdByName: user.displayName || user.email,
    timestamp: Date.now()
  });
};

export const getIdeas = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'ideas'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error('Error getting ideas:', err);
    return [];
  }
};

export const getPublicIdeas = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'ideas'));
    const allIdeas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return allIdeas
      .filter(doc => doc.public === true)
      .sort((a, b) => b.timestamp - a.timestamp);
  } catch (err) {
    console.error('Error getting public ideas:', err);
    return [];
  }
};

export const updateIdea = async (id, titulo, idea, isPublic) => {
  await updateDoc(doc(db, 'ideas', id), {
    titulo,
    idea,
    public: isPublic
  });
};

export const deleteIdea = async (id) => {
  await deleteDoc(doc(db, 'ideas', id));
};
