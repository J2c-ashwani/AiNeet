'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ghostDefeat, setGhostDefeat] = useState(null);
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

        // VIRAL FLYWHEEL: Ghost Reconnaissance
        const ghost_id = localStorage.getItem('ghost_id');
        if (ghost_id) {
            fetch(`/api/challenge/status?ghost_id=${ghost_id}`)
                .then(r => r.json())
                .then(d => {
                    if (d.defeated && d.data) {
                        setGhostDefeat(d.data);
                    }
                })
                .catch(()=>{});
        }
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
            {ghostDefeat && (
                <div style={{ position: 'fixed', zIndex: 9999, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(8, 12, 24, 0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <div style={{ background: 'linear-gradient(145deg, #1e293b, #0f172a)', border: '1px solid #ef4444', borderRadius: 24, padding: 40, maxWidth: 500, width: '100%', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.4)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔥</div>
                        <h2 style={{ fontSize: '2rem', color: '#fff', fontWeight: 800, margin: '0 0 16px 0', lineHeight: 1.2 }}>You Have Been Defeated</h2>
                        <p style={{ color: '#cbd5e1', fontSize: '1.1rem', marginBottom: 32 }}>
                            Someone just beat your {ghostDefeat.subject} score, claiming <strong style={{ color: '#ef4444' }}>{ghostDefeat.new_score}%</strong> accuracy.
                        </p>
                        <button 
                            onClick={() => {
                                // Destroy trace so it doesn't loop infinitely, redirect to exact revenge UI
                                localStorage.removeItem('ghost_id');
                                setGhostDefeat(null);
                                window.location.href = '/test/diagnostic';
                            }}
                            style={{ background: '#ef4444', color: 'white', border: 'none', padding: '16px 32px', borderRadius: 12, fontWeight: 800, fontSize: '1.2rem', cursor: 'pointer', width: '100%', boxShadow: '0 10px 20px rgba(239, 68, 68, 0.3)' }}
                        >
                            Reclaim Your Rank Immediately →
                        </button>
                    </div>
                </div>
            )}
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
