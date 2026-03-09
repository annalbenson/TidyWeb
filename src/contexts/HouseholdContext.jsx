import { createContext, useContext, useState, useEffect } from 'react';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase';

const HouseholdCtx = createContext(null);

export function HouseholdProvider({ uid, children }) {
    const [householdId, setHouseholdId] = useState(undefined); // undefined = loading
    const [members, setMembers] = useState({});

    // Watch users/{uid}.householdId
    useEffect(() => {
        if (!uid) return;
        return onSnapshot(doc(db, 'users', uid), snap => {
            setHouseholdId(snap.data()?.householdId ?? null);
        });
    }, [uid]);

    // Watch household doc when householdId is known
    useEffect(() => {
        if (!householdId) { setMembers({}); return; }
        return onSnapshot(doc(db, 'households', householdId), snap => {
            setMembers(snap.data()?.members ?? {});
        });
    }, [householdId]);

    return (
        <HouseholdCtx.Provider value={{ householdId, members, loading: householdId === undefined }}>
            {children}
        </HouseholdCtx.Provider>
    );
}

export function useHousehold() { return useContext(HouseholdCtx); }
