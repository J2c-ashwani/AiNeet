'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetch('/api/auth/me')
            .then(r => r.json())
            .then(data => {
                if (data.user) {
                    setUser(data.user);
                    
                    // ACQUISITION ENGINE FLAG: Seamlessly map pending stateless diagnostics to this new user profile
                    const storedDiagnostic = localStorage.getItem('pending_diagnostic_grade');
                    if (storedDiagnostic) {
                        fetch('/api/tests/diagnostic/claim', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: storedDiagnostic
                        }).then(r => {
                            if (r.ok) localStorage.removeItem('pending_diagnostic_grade');
                        }).catch(e => console.error('Acquisition merge failed:', e));
                    }
                }
            })
            .catch(err => console.error('Auth check failed:', err))
            .finally(() => setLoading(false));
    }, []);

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            setUser(null);
            // Hard navigate to completely purge local active session state memory
            window.location.href = '/';
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
