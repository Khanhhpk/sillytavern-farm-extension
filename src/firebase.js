import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Parse obfuscated env vars from esbuild
function dec(base64Str) {
    if (!base64Str) return '';
    try {
        return atob(base64Str);
    } catch (e) {
        return '';
    }
}

const firebaseConfig = {
  apiKey: dec(process.env.FIREBASE_API_KEY),
  authDomain: dec(process.env.FIREBASE_PROJECT_ID) + ".firebaseapp.com",
  projectId: dec(process.env.FIREBASE_PROJECT_ID),
  storageBucket: dec(process.env.FIREBASE_PROJECT_ID) + ".appspot.com",
  messagingSenderId: dec(process.env.FIREBASE_SENDER_ID),
  appId: dec(process.env.FIREBASE_APP_ID)
};

let app = null;
export let db = null;

try {
    if (firebaseConfig.apiKey) {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        console.log("[Farm] Firebase Initialized");
    }
} catch (e) {
    console.error("[Farm] Firebase Init Error:", e);
}
