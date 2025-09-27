
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBFLVodFi7NfdWqVcraEd1lieB-JhG_hVk",
  authDomain: "taskmaster-877a7.firebaseapp.com",
  projectId: "taskmaster-877a7",
  storageBucket: "taskmaster-877a7.firebasestorage.app",
  messagingSenderId: "983441329455",
  appId: "1:983441329455:web:c15cb016860437c4ffa5da"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)
export const auth = getAuth(app)