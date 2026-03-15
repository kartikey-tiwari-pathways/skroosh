// place files you want to import through the `$lib` alias in this folder.

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCCs-Ls8Qr7AJxs7NU4Lfo9dwhL519O7Q4",
  authDomain: "skroosh-3d32f.firebaseapp.com",
  projectId: "skroosh-3d32f",
  storageBucket: "skroosh-3d32f.firebasestorage.app",
  messagingSenderId: "816222419667",
  appId: "1:816222419667:web:5aab1e0963b263d451b226"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };