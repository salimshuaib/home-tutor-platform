import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAs8f05aOnxXvsMwtypdr1k_4DhpIIxIbc",
  authDomain: "hometutor-2dbc0.firebaseapp.com",
  projectId: "hometutor-2dbc0",
  storageBucket: "hometutor-2dbc0.firebasestorage.app",
  messagingSenderId: "792391008247",
  appId: "1:792391008247:web:fa9e76a8caa448351d38f2",
  measurementId: "G-YEJZRFBNDC"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, { experimentalForceLongPolling: true });
export const storage = getStorage(app);
export default app;
