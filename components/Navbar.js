'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
    const pathname = usePathname();
    const { user, loading, logout } = useAuth();

    const loggedInItems = [
        { name: 'Home', path: '/' },
        { name: 'Practice', path: '/test/configure' },
        { name: 'Battle', path: '/battle' },
        { name: 'Battleground', path: '/battleground' },
        { name: 'NCERT', path: '/ncert' },
        { name: 'Blueprint', path: '/blueprint' },
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Premium', path: '/pricing' },
    ];

    const guestItems = [
        { name: 'Home', path: '/' },
        { name: 'Practice', path: '/test/configure' },
        { name: 'Battle', path: '/battle' },
        { name: 'Battleground', path: '/battleground' },
        { name: 'NCERT', path: '/ncert' },
        { name: 'Leaderboard', path: '/leaderboard' },
        { name: 'Premium', path: '/pricing' },
    ];

    const navItems = user ? loggedInItems : guestItems;

    // Hide on auth pages
    if (['/login', '/register'].includes(pathname)) return null;

    return (
        <nav style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            background: 'rgba(8, 12, 24, 0.9)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
            {/* Brand */}
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <img src="/logo.png" alt="AI NEET Coach" style={{ width: '28px', height: '28px', borderRadius: '6px' }} />
                <span style={{ fontSize: '1.1rem', fontWeight: 800, background: 'linear-gradient(135deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', whiteSpace: 'nowrap' }}>
                    AI NEET Coach
                </span>
            </Link>

            {/* Nav Links */}
            <ul style={{ display: 'flex', alignItems: 'center', gap: '2px', listStyle: 'none', margin: 0, padding: 0, overflow: 'hidden' }}>
                {navItems.map(item => (
                    <li key={item.path}>
                        <Link
                            href={item.path}
                            style={{
                                display: 'block',
                                padding: '6px 10px',
                                fontSize: '0.85rem',
                                fontWeight: 500,
                                color: pathname === item.path ? '#f8fafc' : '#64748b',
                                textDecoration: 'none',
                                borderRadius: '8px',
                                background: pathname === item.path ? 'rgba(99,102,241,0.15)' : 'transparent',
                                whiteSpace: 'nowrap',
                                transition: 'color 0.15s, background 0.15s',
                            }}
                        >
                            {item.name}
                        </Link>
                    </li>
                ))}
            </ul>

            {/* Auth Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                {loading ? (
                    <div style={{ width: '80px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite' }} />
                ) : user ? (
                    <>
                        <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', textDecoration: 'none', color: '#f1f5f9', fontSize: '0.85rem', fontWeight: 500 }}>
                            <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'white', fontWeight: 700 }}>
                                {(user.full_name || user.email || 'U')[0].toUpperCase()}
                            </span>
                            {user.full_name?.split(' ')[0] || 'Account'}
                        </Link>
                        <button
                            onClick={logout}
                            style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link href="/login" style={{ padding: '6px 12px', borderRadius: '8px', color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
                            Sign In
                        </Link>
                        <Link href="/register" style={{ padding: '7px 14px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700, boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
                            Register Free
                        </Link>
                    </>
                )}
            </div>

            {/* Mobile Bottom Nav */}
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(8,12,24,0.97)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'none', justifyContent: 'space-around', padding: '8px 0 12px', zIndex: 1000 }} className="mobile-nav">
                {[
                    { name: 'Home', path: '/', icon: '🏠' },
                    { name: 'Practice', path: '/test/configure', icon: '📝' },
                    { name: 'Battle', path: '/battleground', icon: '⚔️' },
                    { name: 'NCERT', path: '/ncert', icon: '📚' },
                    { name: user ? 'Profile' : 'Login', path: user ? '/profile' : '/login', icon: user ? '👤' : '🔑' },
                ].map(item => (
                    <Link key={item.path} href={item.path} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', fontSize: '0.65rem', color: pathname === item.path ? '#818cf8' : '#64748b', textDecoration: 'none' }}>
                        <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
                        <span>{item.name}</span>
                    </Link>
                ))}
            </div>
        </nav>
    );
}
