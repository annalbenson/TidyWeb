// Firebase config is intentionally public — access control is enforced
// by Firestore Security Rules and Firebase Auth, not by keeping this secret.
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBVX2CxbBSaflc8uMqkeaQGsHHsglIoKfs",
    authDomain: "tidy-5ad72.firebaseapp.com",
    projectId: "tidy-5ad72",
    storageBucket: "tidy-5ad72.firebasestorage.app",
    messagingSenderId: "724714124711",
    appId: "1:724714124711:web:5811878e64f24248c23282",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);
