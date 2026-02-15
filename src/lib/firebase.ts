import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const isPlaceholder = (v?: string) =>
  !v ||
  v.includes("your_project_id") ||
  v.includes("your_api_key_here") ||
  v.includes("your_");

export const isFirebaseConfigured = Object.values(firebaseConfig).every((v) => !!v && !isPlaceholder(v));

let app: ReturnType<typeof getApp> | ReturnType<typeof initializeApp> | null = null;
const createThrowingProxy = <T>(name: string) =>
  new Proxy({}, {
    get() {
      throw new Error(`${name} not configured: set NEXT_PUBLIC_FIREBASE_* in .env.local`);
    }
  }) as unknown as T;

let db: Firestore = createThrowingProxy<Firestore>("Firebase");
let storage: FirebaseStorage = createThrowingProxy<FirebaseStorage>("Firebase Storage");
let auth: Auth = createThrowingProxy<Auth>("Firebase Auth");

if (isFirebaseConfigured) {
  app = !getApps().length ? initializeApp(firebaseConfig as Required<typeof firebaseConfig>) : getApp();
  db = getFirestore(app);
  storage = getStorage(app);
  auth = getAuth(app);
} else {
  if (process.env.NODE_ENV !== "production") {
    // Surface a clear message in development so issues are caught early
    // eslint-disable-next-line no-console
  }
}

export { app, db, storage, auth };
