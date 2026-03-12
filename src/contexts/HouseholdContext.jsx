import { createContext, useContext, useState, useEffect } from 'react';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase';

const HouseholdCtx = createContext(null);

export function HouseholdProvider({ uid, children }) {
    const [householdId, setHouseholdId] = useState(undefined); // undefined = loading
    const [members, setMembers] = useState({});
    const [createdBy, setCreatedBy] = useState(null);

    // Watch users/{uid}.householdId
    useEffect(() => {
        if (!uid) return;
        return onSnapshot(doc(db, 'users', uid), snap => {
            setHouseholdId(snap.data()?.householdId ?? null);
        });
    }, [uid]);

    // Watch household doc when householdId is known
    useEffect(() => {
        if (!householdId) { setMembers({}); setCreatedBy(null); return; }
        return onSnapshot(doc(db, 'households', householdId), snap => {
            const data = snap.data() ?? {};
            setMembers(data.members ?? {});
            setCreatedBy(data.createdBy ?? null);
        });
    }, [householdId]);

    return (
        <HouseholdCtx.Provider value={{ householdId, members, createdBy, loading: householdId === undefined }}>
            {children}
        </HouseholdCtx.Provider>
    );
}

export function useHousehold() { return useContext(HouseholdCtx); }
