// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, addDoc } from "firebase/firestore"; // ✅ Import getAuth
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB5duQiF3eBY7_Ch7QcteXBmdwW7rOvSdk",
  authDomain: "skincancerhackathon.firebaseapp.com",
  projectId: "skincancerhackathon",
  storageBucket: "skincancerhackathon.firebasestorage.app",
  messagingSenderId: "186205196282",
  appId: "1:186205196282:web:091586b02f56b3a2685e43",
  measurementId: "G-NQMFKWRJBG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // ✅ Export auth properly
const storage = getStorage(app);
const db = getFirestore(app);

export { storage, db, ref, uploadBytes, getDownloadURL, collection, addDoc };