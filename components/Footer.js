'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isInsideNativeApp } from '@/lib/platform';

export default function Footer() {
    const pathname = usePathname();
    const [isNative, setIsNative] = useState(false);

    useEffect(() => {
        setIsNative(isInsideNativeApp());
    }, []);

    // Hide footer on full-screen app experiences or when inside native mobile shell
    const hideOnRoutes = ['/doubts', '/battleground'];
    if (isNative || hideOnRoutes.includes(pathname)) return null;

    return (
        <footer style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            padding: '40px 32px 32px',
            marginTop: 'auto',
            background: 'var(--bg-primary)',
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '32px', marginBottom: '40px' }}>
                    
                    {/* Brand */}
                    <div style={{ maxWidth: '280px' }}>
                        <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                            <img src="/logo.png" alt="AI NEET Coach" style={{ width: '28px', height: '28px', borderRadius: '6px' }} />
                            <span style={{ fontSize: '1.1rem', fontWeight: 800, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                AI NEET Coach
                            </span>
                        </a>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                            India's #1 AI-powered NEET preparation platform. Crack NEET 2026 with infinite mocks, live battles, and personalized analytics.
                        </p>
                    </div>

                    {/* Links */}
                    <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
                        <div>
                            <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '16px', fontSize: '0.9rem' }}>Platform</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {[
                                    { label: 'Practice Tests', href: '/test/configure' },
                                    { label: 'Battleground', href: '/battleground' },
                                    { label: 'NCERT Blueprint', href: '/blueprint' },
                                    { label: 'AI Doubt Solver', href: '/doubts' },
                                    { label: 'Leaderboard', href: '/leaderboard' },
                                ].map(l => (
                                    <a key={l.href} href={l.href} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.2s' }}
                                        onMouseEnter={e => e.target.style.color = 'var(--text-secondary)'}
                                        onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
                                        {l.label}
                                    </a>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '16px', fontSize: '0.9rem' }}>Account</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {[
                                    { label: 'Sign In', href: '/login' },
                                    { label: 'Register Free', href: '/register' },
                                    { label: 'Dashboard', href: '/dashboard' },
                                    { label: 'Pricing', href: '/pricing' },
                                ].map(l => (
                                    l.href === '/login' || l.href === '/register' ? (
                                        // Plain <a> for auth pages — prevents removeChild crash from browser extensions
                                        <a key={l.href} href={l.href} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.2s' }}
                                            onMouseEnter={e => e.target.style.color = 'var(--text-secondary)'}
                                            onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
                                            {l.label}
                                        </a>
                                    ) : (
                                        <a key={l.href} href={l.href} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.2s' }}
                                            onMouseEnter={e => e.target.style.color = 'var(--text-secondary)'}
                                            onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
                                            {l.label}
                                        </a>
                                    )
                                ))}
                            </div>
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '16px', fontSize: '0.9rem' }}>Legal</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {[
                                    { label: 'Privacy Policy', href: '/privacy' },
                                    { label: 'Terms of Service', href: '/terms' },
                                    { label: 'Refund Policy', href: '/refund-policy' },
                                    { label: 'Account Deletion', href: '/account-deletion' },
                                ].map(l => (
                                    <Link key={l.label} href={l.href} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.2s' }}
                                        onMouseEnter={e => e.target.style.color = 'var(--text-secondary)'}
                                        onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
                                        {l.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div style={{ paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        &copy; {new Date().getFullYear()} AI NEET Coach. All rights reserved.
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        Powered by Google Gemini AI
                    </p>
                </div>
            </div>
        </footer>
    );
}
