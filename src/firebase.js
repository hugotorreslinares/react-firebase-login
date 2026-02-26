import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBP1-gRkeijlgvkHGIN_C1xZvVzt6YeR_o",
  authDomain: "react-login-146db.firebaseapp.com",
  projectId: "react-login-146db",
  storageBucket: "react-login-146db.firebasestorage.app",
  messagingSenderId: "583805545963",
  appId: "1:583805545963:web:f1548356b019fc0b24fdae"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logOut = () => signOut(auth);
