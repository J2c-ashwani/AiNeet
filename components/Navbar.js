'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
    const pathname = usePathname();
    const { user, loading, logout } = useAuth();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const handleHaptic = () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(30);
        }
    };

    const loggedInItems = [
        { name: 'Home', path: '/' },
        { name: 'Practice', path: '/test/configure' },
        { name: 'NCERT', path: '/ncert' },
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Premium', path: '/pricing' },
    ];

    const guestItems = [
        { name: 'Home', path: '/' },
        { name: 'Practice', path: '/test/configure' },
        { name: 'NCERT', path: '/ncert' },
        { name: 'Premium', path: '/pricing' },
    ];

    const navItems = user ? loggedInItems : guestItems;

    // Hide on auth pages
    if (['/login', '/register'].includes(pathname)) return null;

    return (
        <>
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
            <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <img src="/logo.png" alt="AI NEET Coach" style={{ width: '28px', height: '28px', borderRadius: '6px' }} />
                <span style={{ fontSize: '1.1rem', fontWeight: 800, background: 'linear-gradient(135deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', whiteSpace: 'nowrap' }}>
                    AI NEET Coach
                </span>
            </a>

            {/* Nav Links */}
            <ul className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '2px', listStyle: 'none', margin: 0, padding: 0, overflow: 'hidden' }}>
                {navItems.map(item => (
                    <li key={item.path}>
                        <a
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
                        </a>
                    </li>
                ))}
            </ul>

            {/* Auth Actions */}
            <div className="desktop-auth-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                {loading ? (
                    <div style={{ width: '80px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite' }} />
                ) : user ? (
                    <>
                        <a href="/profile" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', textDecoration: 'none', color: '#f1f5f9', fontSize: '0.85rem', fontWeight: 500 }}>
                            <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'white', fontWeight: 700 }}>
                                {(user.full_name || user.email || 'U')[0].toUpperCase()}
                            </span>
                            {user.full_name?.split(' ')[0] || 'Account'}
                        </a>
                        <button
                            onClick={logout}
                            style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <a href="/login" style={{ padding: '6px 12px', borderRadius: '8px', color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
                            Sign In
                        </a>
                        <a href="/register" style={{ padding: '7px 14px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700, boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
                            Register Free
                        </a>
                    </>
                )}
            </div>
        </nav>

            {/* Mobile Bottom Nav */}
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(8,12,24,0.97)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)', justifyContent: 'space-around', padding: '8px 0 12px', zIndex: 1000 }} className="mobile-nav">
                {[
                    { name: 'Home', path: '/', icon: '🏠' },
                    { name: 'Practice', path: '/test/configure', icon: '📝' },
                    { name: 'Tools', path: '#tools', icon: '🧰' },
                    { name: 'Doubt', path: '/doubts', icon: '💬' },
                    { name: user ? 'Profile' : 'Login', path: user ? '/profile' : '/login', icon: user ? '👤' : '🔑' },
                ].map(item => {
                    if (item.name === 'Tools') {
                        return (
                            <button key="tools" onClick={() => { handleHaptic(); setIsDrawerOpen(true); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', fontSize: '0.65rem', color: '#818cf8', background: 'none', border: 'none', cursor: 'pointer' }}>
                                <span style={{ fontSize: '1.4rem', transform: 'translateY(-4px)', background: 'rgba(99,102,241,0.2)', borderRadius: '50%', padding: '6px' }}>{item.icon}</span>
                                <span>{item.name}</span>
                            </button>
                        );
                    }
                    return (
                        // Use plain <a> for ALL nav items to prevent removeChild crash from browser extensions
                        <a key={item.path} href={item.path} onClick={handleHaptic} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', fontSize: '0.65rem', color: pathname === item.path ? '#818cf8' : '#64748b', textDecoration: 'none' }}>
                            <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
                            <span>{item.name}</span>
                        </a>
                    );
                })}
            </div>

            {/* Mobile Features Drawer Overlay */}
            {isDrawerOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(8,12,24,0.95)', backdropFilter: 'blur(25px)', zIndex: 1001, display: 'flex', flexDirection: 'column', animation: 'fadeInUp 0.3s ease' }}>
                    <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>Study Tools</h2>
                        <button onClick={() => setIsDrawerOpen(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', color: 'white', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                    <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '100px' }}>
                        
                        {/* PRACTICE GROUP (Primary) */}
                        <div>
                            <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', marginBottom: '16px', fontWeight: 700 }}>Practice</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                                <a href="/test/configure" onClick={() => { handleHaptic(); setIsDrawerOpen(false); }} style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05))', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '16px', padding: '16px', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ fontSize: '2rem' }}>📝</div>
                                    <span style={{ color: '#f8fafc', fontSize: '0.9rem', fontWeight: 700 }}>Custom Mock Test</span>
                                </a>
                                <a href="/omr" onClick={() => { handleHaptic(); setIsDrawerOpen(false); }} style={{ background: 'linear-gradient(135deg, rgba(56,189,248,0.15), rgba(56,189,248,0.05))', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '16px', padding: '16px', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ fontSize: '2rem' }}>📸</div>
                                    <span style={{ color: '#f8fafc', fontSize: '0.9rem', fontWeight: 700 }}>OMR Scanner</span>
                                </a>
                                <a href="/battleground" onClick={() => { handleHaptic(); setIsDrawerOpen(false); }} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', gridColumn: '1 / -1' }}>
                                    <span style={{ fontSize: '1.5rem' }}>⚔️</span>
                                    <span style={{ color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600 }}>Battleground</span>
                                </a>
                            </div>
                        </div>

                        {/* IMPROVE GROUP */}
                        <div>
                            <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', marginBottom: '16px', fontWeight: 700 }}>Improve</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                                <a href="/doubts" onClick={() => { handleHaptic(); setIsDrawerOpen(false); }} style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '16px', padding: '16px', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: '1 / -1' }}>
                                    <div style={{ fontSize: '2rem' }}>💡</div>
                                    <span style={{ color: '#f8fafc', fontSize: '0.9rem', fontWeight: 700 }}>AI Doubt Solver</span>
                                </a>
                                <a href="/mistakes" onClick={() => { handleHaptic(); setIsDrawerOpen(false); }} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '1.5rem' }}>📓</span>
                                    <span style={{ color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600 }}>Mistakes</span>
                                </a>
                                <a href="/revision" onClick={() => { handleHaptic(); setIsDrawerOpen(false); }} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '1.5rem' }}>🔄</span>
                                    <span style={{ color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600 }}>Revision</span>
                                </a>
                            </div>
                        </div>

                        {/* TRACK GROUP */}
                        <div>
                            <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', marginBottom: '16px', fontWeight: 700 }}>Track</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                                <a href="/blueprint" onClick={() => { handleHaptic(); setIsDrawerOpen(false); }} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '1.5rem' }}>📚</span>
                                    <span style={{ color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600 }}>Blueprint</span>
                                </a>
                                <a href="/study-plan" onClick={() => { handleHaptic(); setIsDrawerOpen(false); }} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '1.5rem' }}>📅</span>
                                    <span style={{ color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600 }}>Study Plan</span>
                                </a>
                                <a href="/dashboard" onClick={() => { handleHaptic(); setIsDrawerOpen(false); }} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', gridColumn: '1 / -1' }}>
                                    <span style={{ fontSize: '1.5rem' }}>📊</span>
                                    <span style={{ color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600 }}>Dashboard Analytics</span>
                                </a>
                            </div>
                        </div>

                        {/* COMPETE GROUP */}
                        <div>
                            <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', marginBottom: '16px', fontWeight: 700 }}>Compete</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                                <a href="/leaderboard" onClick={() => { handleHaptic(); setIsDrawerOpen(false); }} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '1.5rem' }}>🏆</span>
                                    <span style={{ color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600 }}>Global Leaderboard</span>
                                </a>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
}
