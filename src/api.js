import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
} from 'firebase/auth';
import {
    doc, setDoc, getDoc, updateDoc,
    collection, addDoc, getDocs, deleteDoc, serverTimestamp, increment,
    query, where, deleteField,
} from 'firebase/firestore';
import { auth, db } from './firebase';

// ── Private routing helpers ───────────────────────────────────────────────────

function choreCol(uid, householdId) {
    return householdId
        ? collection(db, 'households', householdId, 'chores')
        : collection(db, 'users', uid, 'chores');
}

function choreRef(uid, choreId, householdId) {
    return householdId
        ? doc(db, 'households', householdId, 'chores', choreId)
        : doc(db, 'users', uid, 'chores', choreId);
}

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I

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
            householdId: null,
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

    /** Delete the user's home profile (used for full reset / re-onboard). */
    async deleteProfile(uid) {
        await deleteDoc(doc(db, 'users', uid, 'profile', 'home'));
    },

    // ── Rooms ─────────────────────────────────────────────────────────────────

    /** Get all user-created named rooms. Returns [{ id, name, type }]. */
    async getRooms(uid) {
        const snap = await getDocs(collection(db, 'users', uid, 'rooms'));
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    /** Create a named room. Returns the new room id. */
    async addRoom(uid, { name, type }) {
        const ref = await addDoc(collection(db, 'users', uid, 'rooms'), { name, type, createdAt: serverTimestamp() });
        return ref.id;
    },

    /** Update a named room (e.g. rename). */
    async updateRoom(uid, roomId, updates) {
        await updateDoc(doc(db, 'users', uid, 'rooms', roomId), updates);
    },

    /** Delete a named room. */
    async deleteRoom(uid, roomId) {
        await deleteDoc(doc(db, 'users', uid, 'rooms', roomId));
    },

    // ── Chores ────────────────────────────────────────────────────────────────

    /** Load all chores for a user or household. Returns an array. */
    async getChores(uid, householdId = null) {
        const snap = await getDocs(choreCol(uid, householdId));
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    /** Add a new chore. Returns the new doc reference. */
    async addChore(uid, chore, householdId = null) {
        return addDoc(choreCol(uid, householdId), {
            ...chore,
            createdAt: serverTimestamp(),
        });
    },

    /** Update an existing chore. */
    async updateChore(uid, choreId, updates, householdId = null) {
        await updateDoc(choreRef(uid, choreId, householdId), updates);
    },

    /** Delete a chore. */
    async deleteChore(uid, choreId, householdId = null) {
        await deleteDoc(choreRef(uid, choreId, householdId));
    },

    /** Mark a chore complete — sets lastDone to now and increments completionCount. */
    async completeChore(uid, choreId, householdId = null) {
        await updateDoc(choreRef(uid, choreId, householdId), {
            lastDone: serverTimestamp(),
            completionCount: increment(1),
        });
    },

    /** Schedule a chore to a specific date and time slot. */
    async scheduleChore(uid, choreId, { scheduledDate, scheduledTime }, householdId = null) {
        await updateDoc(choreRef(uid, choreId, householdId), { scheduledDate, scheduledTime });
    },

    /** Remove scheduling from a chore. */
    async unscheduleChore(uid, choreId, householdId = null) {
        await updateDoc(choreRef(uid, choreId, householdId), {
            scheduledDate: null,
            scheduledTime: null,
        });
    },

    // ── Households ────────────────────────────────────────────────────────────

    /** Create a new household and link the user to it. */
    async createHousehold(uid, userName) {
        const joinCode = Array.from({ length: 6 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
        const householdRef = doc(collection(db, 'households'));
        await setDoc(householdRef, {
            joinCode,
            createdBy: uid,
            createdAt: serverTimestamp(),
            members: { [uid]: { name: userName } },
        });
        await setDoc(doc(db, 'users', uid), { householdId: householdRef.id }, { merge: true });
        return householdRef.id;
    },

    /** Join an existing household by join code. */
    async joinHousehold(uid, userName, joinCode) {
        const snap = await getDocs(query(collection(db, 'households'), where('joinCode', '==', joinCode.toUpperCase())));
        if (snap.empty) throw new Error('No household found with that code.');
        const householdDoc = snap.docs[0];
        await updateDoc(householdDoc.ref, { [`members.${uid}`]: { name: userName } });
        await setDoc(doc(db, 'users', uid), { householdId: householdDoc.id }, { merge: true });
        return householdDoc.id;
    },

    /** Get household data. */
    async getHousehold(householdId) {
        const snap = await getDoc(doc(db, 'households', householdId));
        return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    },

    /** Leave a household. Deletes the household if last member. */
    async leaveHousehold(uid, householdId) {
        const snap = await getDoc(doc(db, 'households', householdId));
        if (!snap.exists()) return;
        const members = snap.data().members ?? {};
        const remaining = Object.keys(members).filter(id => id !== uid);
        if (remaining.length === 0) {
            await deleteDoc(doc(db, 'households', householdId));
        } else {
            await updateDoc(doc(db, 'households', householdId), { [`members.${uid}`]: deleteField() });
        }
        await setDoc(doc(db, 'users', uid), { householdId: null }, { merge: true });
    },
};
