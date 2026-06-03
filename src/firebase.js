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
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, increment, runTransaction, arrayUnion, arrayRemove, query, where, orderBy } from "firebase/firestore";

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
    timestamp: Date.now(),
    likes: 0,
    dislikes: 0,
    likedBy: [],
    dislikedBy: []
  });
};

export const likeIdea = async (id, uidParam) => {
  const uid = uidParam || auth.currentUser?.uid;
  if (!uid) throw new Error('User must be authenticated to like');
  const ideaRef = doc(db, 'ideas', id);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ideaRef);
    if (!snap.exists()) throw new Error('Idea not found');
    const data = snap.data();
    const likedBy = data.likedBy || [];
    const dislikedBy = data.dislikedBy || [];
    if (likedBy.includes(uid)) return; // already liked, no-op
    const updates = {};
    updates.likes = increment(1);
    updates.likedBy = arrayUnion(uid);
    if (dislikedBy.includes(uid)) {
      updates.dislikes = increment(-1);
      updates.dislikedBy = arrayRemove(uid);
    }
    tx.update(ideaRef, updates);
  });
};

export const dislikeIdea = async (id, uidParam) => {
  const uid = uidParam || auth.currentUser?.uid;
  if (!uid) throw new Error('User must be authenticated to dislike');
  const ideaRef = doc(db, 'ideas', id);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ideaRef);
    if (!snap.exists()) throw new Error('Idea not found');
    const data = snap.data();
    const likedBy = data.likedBy || [];
    const dislikedBy = data.dislikedBy || [];
    if (dislikedBy.includes(uid)) return; // already disliked, no-op
    const updates = {};
    updates.dislikes = increment(1);
    updates.dislikedBy = arrayUnion(uid);
    if (likedBy.includes(uid)) {
      updates.likes = increment(-1);
      updates.likedBy = arrayRemove(uid);
    }
    tx.update(ideaRef, updates);
  });
};

// Migration helper for existing documents: sets missing fields to defaults
export const migrateAddLikesDefaults = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'ideas'));
    const promises = snapshot.docs.map((d) => {
      const data = d.data();
      const updates = {};
      if (data.likes === undefined) updates.likes = 0;
      if (data.dislikes === undefined) updates.dislikes = 0;
      if (data.likedBy === undefined) updates.likedBy = [];
      if (data.dislikedBy === undefined) updates.dislikedBy = [];
      if (Object.keys(updates).length === 0) return Promise.resolve();
      return updateDoc(doc(db, 'ideas', d.id), updates);
    });
    await Promise.all(promises);
    console.log('Migration complete');
  } catch (err) {
    console.error('Migration error:', err);
    throw err;
  }
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

export const getUserIdeas = async (user) => {
  if (!user) return [];
  try {
    const q = query(collection(db, 'ideas'), where('createdBy', '==', user.email));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error('Error getting user ideas:', err);
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
