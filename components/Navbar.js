'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui';
import { BottomNav } from '@/components/ui/BottomNav';
import { triggerHaptic } from '@/lib/platform';
import {
    BookOpen, Camera, Swords, Lightbulb, NotebookPen,
    RotateCcw, BookMarked, CalendarDays, BarChart2,
    Trophy, X,
} from 'lucide-react';

export default function Navbar() {
    const pathname = usePathname();
    const { user, loading, logout } = useAuth();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const handleHaptic = () => {
        triggerHaptic('medium');
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
        <nav className="navbar-root">
            {/* Brand */}
            <Link href="/" className="navbar-brand">
                <img src="/logo.png" alt="AI NEET Coach" className="navbar-logo" />
                <span className="navbar-brand-text">AI NEET Coach</span>
            </Link>

            {/* Nav Links */}
            <ul className="navbar-links">
                {navItems.map(item => (
                    <li key={item.path}>
                        <Link
                            href={item.path}
                            className={`navbar-link${pathname === item.path ? ' is-active' : ''}`}
                        >
                            {item.name}
                        </Link>
                    </li>
                ))}
            </ul>

            {/* Auth Actions */}
            <div className="navbar-actions">
                <Link
                    href="/download"
                    className="navbar-app-pill"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        borderRadius: '9999px',
                        background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.15), rgba(16, 185, 129, 0.25))',
                        border: '1px solid rgba(16, 185, 129, 0.5)',
                        color: '#10b981',
                        fontSize: '0.825rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                    }}
                >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.996-3.4572c.1146-.1986.0467-.4528-.152-.5674-.1986-.1146-.4527-.0467-.5673.152l-2.0233 3.5045c-1.5238-.6968-3.2393-1.085-5.0849-1.085s-3.5611.3882-5.0849 1.085L4.9411 5.4491c-.1146-.1987-.3687-.2666-.5673-.152-.1987.1146-.2666.3688-.152.5674l1.996 3.4572C2.6889 11.2867.3195 14.8697.0019 19.1242h23.9962c-.3176-4.2545-2.687-7.8375-6.1171-9.8028"/>
                    </svg>
                    <span>Get Android App</span>
                </Link>

                {loading ? (
                    <div className="navbar-skeleton" />
                ) : user ? (
                    <>
                        <Link href="/profile" className="navbar-profile-btn">
                            <span className="navbar-avatar">
                                {(user.full_name || user.email || 'U')[0].toUpperCase()}
                            </span>
                            {user.full_name?.split(' ')[0] || 'Account'}
                        </Link>
                        <Button variant="ghost" size="sm" onClick={logout} className="navbar-logout-btn">
                            Logout
                        </Button>
                    </>
                ) : (
                    <>
                        <Link href="/login" className="navbar-signin-link">Sign In</Link>
                        <Link href="/register" className="navbar-register-btn">Register Free</Link>
                    </>
                )}
            </div>
        </nav>

        {/* Wave 7: Premium bottom nav — SVG icons, hero TEST button, safe-area aware */}
        <BottomNav />

            {/* Mobile Features Drawer Overlay */}
            {isDrawerOpen && (
                <div className="navbar-drawer-overlay">
                    <div className="navbar-drawer-header">
                        <h2 className="navbar-drawer-title">Study Tools</h2>
                        <Button variant="ghost" size="sm" onClick={() => setIsDrawerOpen(false)} aria-label="Close tools drawer" className="navbar-drawer-close space_pa_2">
                            <X size={18} aria-hidden="true" />
                        </Button>
                    </div>
                    <div className="navbar-drawer-body">

                        {/* PRACTICE GROUP (Primary) */}
                        <div>
                            <h3 className="navbar-section-label">Practice</h3>
                            <div className="navbar-tool-grid">
                                <Link href="/test/configure" onClick={() => { handleHaptic(); setIsDrawerOpen(false); }} className="navbar-tool-card-primary">
                                    <BookOpen size={28} style={{ color: 'var(--accent-primary)' }} aria-hidden="true" />
                                    <span className="navbar-tool-label-lg">Custom Mock Test</span>
                                </Link>
                                <Link href="/omr" onClick={() => { handleHaptic(); setIsDrawerOpen(false); }} className="navbar-tool-card-primary-cyan">
                                    <Camera size={28} style={{ color: 'var(--text-accent)' }} aria-hidden="true" />
                                    <span className="navbar-tool-label-lg">OMR Scanner</span>
                                </Link>
                                <Link href="/battleground" onClick={() => { handleHaptic(); setIsDrawerOpen(false); }} className="navbar-tool-card-fullwidth">
                                    <Swords size={20} style={{ color: 'var(--warning)', flexShrink: 0 }} aria-hidden="true" />
                                    <span className="navbar-tool-label">Battleground</span>
                                </Link>
                            </div>
                        </div>

                        {/* IMPROVE GROUP */}
                        <div>
                            <h3 className="navbar-section-label">Improve</h3>
                            <div className="navbar-tool-grid">
                                <Link href="/doubts" onClick={() => { handleHaptic(); setIsDrawerOpen(false); }} className="navbar-tool-card-primary-green">
                                    <Lightbulb size={28} style={{ color: 'var(--success)' }} aria-hidden="true" />
                                    <span className="navbar-tool-label-lg">AI Doubt Solver</span>
                                </Link>
                                <Link href="/mistakes" onClick={() => { handleHaptic(); setIsDrawerOpen(false); }} className="navbar-tool-card">
                                    <NotebookPen size={18} style={{ color: 'var(--accent-secondary)', flexShrink: 0 }} aria-hidden="true" />
                                    <span className="navbar-tool-label">Mistakes</span>
                                </Link>
                                <Link href="/revision" onClick={() => { handleHaptic(); setIsDrawerOpen(false); }} className="navbar-tool-card">
                                    <RotateCcw size={18} style={{ color: 'var(--text-accent)', flexShrink: 0 }} aria-hidden="true" />
                                    <span className="navbar-tool-label">Revision</span>
                                </Link>
                            </div>
                        </div>

                        {/* TRACK GROUP */}
                        <div>
                            <h3 className="navbar-section-label">Track</h3>
                            <div className="navbar-tool-grid">
                                <Link href="/blueprint" onClick={() => { handleHaptic(); setIsDrawerOpen(false); }} className="navbar-tool-card">
                                    <BookMarked size={18} style={{ color: 'var(--accent-secondary)', flexShrink: 0 }} aria-hidden="true" />
                                    <span className="navbar-tool-label">Blueprint</span>
                                </Link>
                                <Link href="/study-plan" onClick={() => { handleHaptic(); setIsDrawerOpen(false); }} className="navbar-tool-card">
                                    <CalendarDays size={18} style={{ color: 'var(--warning)', flexShrink: 0 }} aria-hidden="true" />
                                    <span className="navbar-tool-label">Study Plan</span>
                                </Link>
                                <Link href="/dashboard" onClick={() => { handleHaptic(); setIsDrawerOpen(false); }} className="navbar-tool-card-fullwidth">
                                    <BarChart2 size={18} style={{ color: 'var(--success)', flexShrink: 0 }} aria-hidden="true" />
                                    <span className="navbar-tool-label">Dashboard Analytics</span>
                                </Link>
                            </div>
                        </div>

                        {/* COMPETE GROUP */}
                        <div>
                            <h3 className="navbar-section-label">Compete</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                                <Link href="/leaderboard" onClick={() => { handleHaptic(); setIsDrawerOpen(false); }} className="navbar-tool-card">
                                    <Trophy size={18} style={{ color: 'var(--warning)', flexShrink: 0 }} aria-hidden="true" />
                                    <span className="navbar-tool-label">Global Leaderboard</span>
                                </Link>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
}
