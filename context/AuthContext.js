'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { resilientStorage, STORAGE_KEYS } from '@/lib/storage-resilient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ghostDefeat, setGhostDefeat] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const initStorage = async () => {
            const storedDiagnostic = await resilientStorage.get(STORAGE_KEYS.PENDING_DIAGNOSTIC);
            const ghost_id = await resilientStorage.get(STORAGE_KEYS.GHOST_ID);

            fetch('/api/auth/me')
                .then(r => r.json())
                .then(data => {
                    if (data.user) {
                        setUser(data.user);
                        
                        // ACQUISITION ENGINE FLAG: Seamlessly map pending stateless diagnostics to this new user profile
                        if (storedDiagnostic) {
                            fetch('/api/tests/diagnostic/claim', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: storedDiagnostic
                            }).then(async r => {
                                if (r.ok) await resilientStorage.remove(STORAGE_KEYS.PENDING_DIAGNOSTIC);
                            }).catch(e => console.error('Acquisition merge failed:', e));
                        }
                    }
                })
                .catch(err => console.error('Auth check failed:', err))
                .finally(() => setLoading(false));

            // VIRAL FLYWHEEL: Ghost Reconnaissance
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
        };

        initStorage();
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
                <div style={{ position: 'fixed', zIndex: 'var(--z-critical)', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(8, 12, 24, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <div style={{ background: 'linear-gradient(145deg, #1e293b, #0f172a)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 24, padding: '40px 40px 32px 40px', maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)', position: 'relative' }}>
                        
                        <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📉</div>
                        <h2 style={{ fontSize: '1.75rem', color: '#fff', fontWeight: 800, margin: '0 0 12px 0', lineHeight: 1.2 }}>Your rank slipped</h2>
                        <p style={{ color: '#94a3b8', fontSize: '1.05rem', marginBottom: 24 }}>
                            Someone just beat your score in <strong>{ghostDefeat.subject}</strong>.
                        </p>

                        <div style={{ background: 'rgba(15, 23, 42, 0.6)', borderRadius: 16, padding: 20, marginBottom: 32, display: 'flex', justifyContent: 'center', gap: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>You</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>{ghostDefeat.original_score}%</div>
                            </div>
                            <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }}></div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>New Top</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fbbf24' }}>{ghostDefeat.new_score}%</div>
                            </div>
                        </div>

                        <p style={{ color: '#4ade80', fontWeight: 600, marginBottom: 24 }}>
                            Close gap: +{ghostDefeat.new_score - (ghostDefeat.original_score || 0)}%
                        </p>

                        <button 
                            onClick={async () => {
                                await resilientStorage.remove(STORAGE_KEYS.GHOST_ID);
                                setGhostDefeat(null);
                                window.location.href = '/test/diagnostic';
                            }}
                            style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#000', border: 'none', padding: '16px 32px', borderRadius: 12, fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', width: '100%', boxShadow: '0 10px 20px rgba(245, 158, 11, 0.2)', marginBottom: 16 }}
                        >
                            Take a quick test → reclaim it
                        </button>

                        <button 
                            onClick={() => setGhostDefeat(null)}
                            style={{ background: 'transparent', color: '#94a3b8', border: 'none', padding: '8px 20px', borderRadius: 8, fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}
                        >
                            Later
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
