'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
    const pathname = usePathname();

    // Hide footer on full-screen app experiences
    const hideOnRoutes = ['/doubts', '/battleground'];
    if (hideOnRoutes.includes(pathname)) return null;

    return (
        <footer style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            padding: '40px 32px 32px',
            marginTop: 'auto',
            background: '#080c18',
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '32px', marginBottom: '40px' }}>
                    
                    {/* Brand */}
                    <div style={{ maxWidth: '280px' }}>
                        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                            <img src="/logo.png" alt="AI NEET Coach" style={{ width: '28px', height: '28px', borderRadius: '6px' }} />
                            <span style={{ fontSize: '1.1rem', fontWeight: 800, background: 'linear-gradient(135deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                AI NEET Coach
                            </span>
                        </Link>
                        <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6 }}>
                            India's #1 AI-powered NEET preparation platform. Crack NEET 2026 with infinite mocks, live battles, and personalized analytics.
                        </p>
                    </div>

                    {/* Links */}
                    <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
                        <div>
                            <p style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: '16px', fontSize: '0.9rem' }}>Platform</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {[
                                    { label: 'Practice Tests', href: '/test/configure' },
                                    { label: 'Battleground', href: '/battleground' },
                                    { label: 'NCERT Blueprint', href: '/blueprint' },
                                    { label: 'AI Doubt Solver', href: '/doubts' },
                                    { label: 'Leaderboard', href: '/leaderboard' },
                                ].map(l => (
                                    <Link key={l.href} href={l.href} style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.2s' }}
                                        onMouseEnter={e => e.target.style.color = '#94a3b8'}
                                        onMouseLeave={e => e.target.style.color = '#64748b'}>
                                        {l.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: '16px', fontSize: '0.9rem' }}>Account</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {[
                                    { label: 'Sign In', href: '/login' },
                                    { label: 'Register Free', href: '/register' },
                                    { label: 'Dashboard', href: '/dashboard' },
                                    { label: 'Pricing', href: '/pricing' },
                                ].map(l => (
                                    <Link key={l.href} href={l.href} style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.2s' }}
                                        onMouseEnter={e => e.target.style.color = '#94a3b8'}
                                        onMouseLeave={e => e.target.style.color = '#64748b'}>
                                        {l.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: '16px', fontSize: '0.9rem' }}>Legal</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {[
                                    { label: 'Privacy Policy', href: '#' },
                                    { label: 'Terms of Service', href: '#' },
                                    { label: 'Refund Policy', href: '#' },
                                ].map(l => (
                                    <Link key={l.label} href={l.href} style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.2s' }}
                                        onMouseEnter={e => e.target.style.color = '#94a3b8'}
                                        onMouseLeave={e => e.target.style.color = '#64748b'}>
                                        {l.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div style={{ paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <p style={{ color: '#475569', fontSize: '0.8rem' }}>
                        &copy; {new Date().getFullYear()} AI NEET Coach. All rights reserved.
                    </p>
                    <p style={{ color: '#475569', fontSize: '0.8rem' }}>
                        Powered by Google Gemini AI
                    </p>
                </div>
            </div>
        </footer>
    );
}
