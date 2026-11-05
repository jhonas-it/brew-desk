// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getApp, getApps } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
    apiKey: "AIzaSyAZHtOLZ3nqEKVIWdBeeT5AlNoOMGco1pE",
    authDomain: "brew-desk-b9f27.firebaseapp.com",
    databaseURL: "https://brew-desk-b9f27-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "brew-desk-b9f27",
    storageBucket: "brew-desk-b9f27.firebasestorage.app",
    messagingSenderId: "222916663747",
    appId: "1:222916663747:web:9f3cf3fdeabaacf3390576",
    measurementId: "G-3XETHJYN8S"
};

// Initialize Firebase
const app = getApps().some((item) => item.name === "[DEFAULT]")
  ? getApp()
  : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);
export const analytics = getAnalytics(app);

export const secondaryApp = getApps().some(
  (item) => item.name === "StaffCreation"
)
  ? getApp("StaffCreation")
  : initializeApp(firebaseConfig, "StaffCreation");

export const secondaryAuth = getAuth(secondaryApp);