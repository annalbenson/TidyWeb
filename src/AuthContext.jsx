import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

// undefined  = still initializing (Firebase restoring session)
// null       = confirmed not logged in
// User obj   = logged in
const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(undefined);

    useEffect(() => {
        // onAuthStateChanged returns an unsubscribe function
        return onAuthStateChanged(auth, setUser);
    }, []);

    return (
        <AuthContext.Provider value={user}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
