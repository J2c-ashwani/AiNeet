'use client';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function AdminLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const [authState, setAuthState] = useState('loading'); // 'loading' | 'authorized' | 'denied'

    useEffect(() => {
        async function checkAdmin() {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    if (data.user?.role === 'admin') {
                        setAuthState('authorized');
                    } else {
                        setAuthState('denied');
                    }
                } else {
                    setAuthState('denied');
                }
            } catch {
                setAuthState('denied');
            }
        }
        checkAdmin();
    }, []);

    if (authState === 'loading') {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', }}>
                <div style={{ width: 40, height: 40, border: '2px solid #6366f1', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
                <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (authState === 'denied') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 16 }}>
                <div ><Icon name="Lock" /></div>
                <h1 style={{ fontWeight: 800, }}>Access Denied</h1>
                <p style={{ maxWidth: 400, textAlign: 'center' }}>
                    You don't have permission to access the Admin Portal. This area is restricted to administrators only.
                </p>
                <Button onClick={() => window.location.href = '/dashboard'} style={{
                    marginTop: 16, padding: '12px 32px', border: '1px solid rgba(99,102,241,0.3)',
                    fontWeight: 600, cursor: 'pointer',
                    transition: 'all 0.2s'
                }}>
                    ← Back to Dashboard
                </Button>
            </div>
        );
    }

    const navItems = [
        { name: 'Overview', path: '/admin', icon: '<Icon name="BarChart2" />' },
        { name: 'Runtime Dashboard', path: '/admin/runtime', icon: '🖥️' },
        { name: 'Content Quality', path: '/admin/content-quality', icon: '<Icon name="GraduationCap" />', badge: 'MD Mandate' },
        { name: 'Integrity', path: '/admin/integrity', icon: '🛡️' },
        { name: 'Ops Control Room', path: '/admin/ops', icon: '🧯' },
        { name: 'Question Bank', path: '/admin/questions', icon: '<Icon name="FileText" />' },
        { name: 'NCERT Library', path: '/admin/ncert', icon: '<Icon name="BookOpen" />' },
        { name: 'User Management', path: '/admin/users', icon: '👥' },
        { name: 'Revenue', path: '/admin/revenue', icon: '💰' },
    ];

    const bottomItems = [
        { name: 'Back to App', path: '/dashboard', icon: '⬅️' },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', }}>
            {/* Ambient Background Glow */}
            <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: 500, height: 500, filter: 'blur(120px)' }}></div>
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 500, height: 500, filter: 'blur(120px)' }}></div>
            </div>

            {/* Glass Sidebar */}
            <aside style={{
                width: 280, borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column',
                position: 'relative'
            }}>
                <div style={{ padding: '28px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <h1 style={{
                        fontWeight: 800,
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                    }}>
                        Admin Portal
                    </h1>
                    <p style={{ marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Command Center</p>
                </div>

                <nav style={{ flex: 1, padding: '12px 12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {navItems.map(item => {
                            const isActive = pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path));
                            return (
                                <a key={item.path} href={item.path} style={{
                                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                                    textDecoration: 'none', transition: 'all 0.2s',
                                    fontWeight: 500,
                                    background: isActive ? 'var(--bg-glass)' : 'transparent',
                                    color: isActive ? 'var(--text-primary)' : 'var(--text-primary)',
                                    border: isActive ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
                                    boxShadow: isActive ? '0 0 20px rgba(99,102,241,0.1)' : 'none'
                                }}>
                                    <span >{item.icon}</span>
                                    <span>{item.name}</span>
                                    {item.badge && (
                                        <span style={{
                                            marginLeft: 'auto', fontWeight: 700,
                                            padding: '2px 6px', border: '1px solid rgba(245,158,11,0.25)', letterSpacing: '0.05em'
                                        }}>{item.badge}</span>
                                    )}
                                    {isActive && !item.badge && (
                                        <div style={{ marginLeft: 'auto', width: 6, height: 6, boxShadow: '0 0 10px #6366f1' }}></div>
                                    )}
                                </a>
                            );
                        })}
                    </div>
                </nav>

                <div style={{ padding: '12px 12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    {bottomItems.map(item => (
                        <a key={item.path} href={item.path} style={{
                            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                            textDecoration: 'none', fontWeight: 500, transition: 'all 0.15s'
                        }}>
                            <span >{item.icon}</span>
                            <span>{item.name}</span>
                        </a>
                    ))}
                </div>

                <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{
                        padding: 16, border: '1px solid rgba(255,255,255,0.08)'
                    }}>
                        <p style={{ marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>System Status</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ width: 8, height: 8, boxShadow: '0 0 8px rgba(34,197,94,0.5)' }}></span>
                            <span style={{ fontWeight: 600, }}>Operational</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main style={{ flex: 1, overflow: 'auto', position: 'relative', }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    {children}
                </div>
            </main>
        </div>
    );
}
