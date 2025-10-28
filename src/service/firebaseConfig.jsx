// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCtyVitDjORqZ_xAXGZ4pxEyn4craTwWKY",
  authDomain: "aitravel1-287e3.firebaseapp.com",
  projectId: "aitravel1-287e3",
  storageBucket: "aitravel1-287e3.firebasestorage.app",
  messagingSenderId: "898295263979",
  appId: "1:898295263979:web:a45b36ef368914487344ae",
  measurementId: "G-HLDKS6WMZ1"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)