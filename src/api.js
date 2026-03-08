import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
} from 'firebase/auth';
import {
    doc, setDoc, getDoc, updateDoc,
    collection, addDoc, getDocs, deleteDoc, serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './firebase';

// ── Auth ─────────────────────────────────────────────────────────────────────

export const API = {
    /** Register a new account and create their Firestore profile doc. */
    async register(name, email, password) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });
        await setDoc(doc(db, 'users', cred.user.uid), {
            name,
            email,
            createdAt: serverTimestamp(),
        });
        return cred.user;
    },

    /** Log in to an existing account. */
    async login(email, password) {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        return cred.user;
    },

    /** Sign out the current user. */
    async logout() {
        await signOut(auth);
    },

    // ── Home Profile ──────────────────────────────────────────────────────────

    /** Save or overwrite the user's home profile. */
    async saveProfile(uid, profile) {
        await setDoc(doc(db, 'users', uid, 'profile', 'home'), profile);
    },

    /** Load the user's home profile. Returns null if not set yet. */
    async getProfile(uid) {
        const snap = await getDoc(doc(db, 'users', uid, 'profile', 'home'));
        return snap.exists() ? snap.data() : null;
    },

    // ── Chores ────────────────────────────────────────────────────────────────

    /** Load all chores for a user. Returns an array. */
    async getChores(uid) {
        const snap = await getDocs(collection(db, 'users', uid, 'chores'));
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    /** Add a new chore. Returns the new doc reference. */
    async addChore(uid, chore) {
        return addDoc(collection(db, 'users', uid, 'chores'), {
            ...chore,
            createdAt: serverTimestamp(),
        });
    },

    /** Update an existing chore. */
    async updateChore(uid, choreId, updates) {
        await updateDoc(doc(db, 'users', uid, 'chores', choreId), updates);
    },

    /** Delete a chore. */
    async deleteChore(uid, choreId) {
        await deleteDoc(doc(db, 'users', uid, 'chores', choreId));
    },

    /** Mark a chore complete — sets lastDone to now. */
    async completeChore(uid, choreId) {
        await updateDoc(doc(db, 'users', uid, 'chores', choreId), {
            lastDone: serverTimestamp(),
        });
    },
};
