
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }) {
    const pathname = usePathname();

    const navItems = [
        { name: 'Overview', path: '/admin', icon: '📊' },
        { name: 'Question Bank', path: '/admin/questions', icon: '📝' },
        { name: 'NCERT Library', path: '/admin/ncert', icon: '📚' },
        { name: 'User Management', path: '/admin/users', icon: '👥' },
        { name: 'Revenue', path: '/admin/revenue', icon: '💰' },
    ];

    const bottomItems = [
        { name: 'Back to App', path: '/dashboard', icon: '⬅️' },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#050510', color: 'white' }}>
            {/* Ambient Background Glow */}
            <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: 500, height: 500, background: 'rgba(99,102,241,0.04)', borderRadius: '50%', filter: 'blur(120px)' }}></div>
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 500, height: 500, background: 'rgba(139,92,246,0.04)', borderRadius: '50%', filter: 'blur(120px)' }}></div>
            </div>

            {/* Glass Sidebar */}
            <aside style={{
                width: 280, background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)',
                borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column',
                zIndex: 20, position: 'relative'
            }}>
                <div style={{ padding: '28px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <h1 style={{
                        fontSize: '1.3rem', fontWeight: 800,
                        background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                    }}>
                        Admin Portal
                    </h1>
                    <p style={{ fontSize: '0.65rem', color: '#475569', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Command Center</p>
                </div>

                <nav style={{ flex: 1, padding: '12px 12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {navItems.map(item => {
                            const isActive = pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path));
                            return (
                                <Link key={item.path} href={item.path} style={{
                                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                                    borderRadius: 12, textDecoration: 'none', transition: 'all 0.2s',
                                    fontSize: '0.9rem', fontWeight: 500,
                                    background: isActive ? 'rgba(99,102,241,0.1)' : 'transparent',
                                    color: isActive ? '#a5b4fc' : '#64748b',
                                    border: isActive ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
                                    boxShadow: isActive ? '0 0 20px rgba(99,102,241,0.1)' : 'none'
                                }}>
                                    <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                                    <span>{item.name}</span>
                                    {isActive && (
                                        <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#6366f1', boxShadow: '0 0 10px #6366f1' }}></div>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                <div style={{ padding: '12px 12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    {bottomItems.map(item => (
                        <Link key={item.path} href={item.path} style={{
                            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                            borderRadius: 12, textDecoration: 'none', color: '#64748b',
                            fontSize: '0.9rem', fontWeight: 500, transition: 'all 0.15s'
                        }}>
                            <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                            <span>{item.name}</span>
                        </Link>
                    ))}
                </div>

                <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(17,24,39,0.9), rgba(0,0,0,0.9))',
                        padding: 16, borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)'
                    }}>
                        <p style={{ fontSize: '0.65rem', color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>System Status</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 8px rgba(34,197,94,0.5)' }}></span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4ade80' }}>Operational</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main style={{ flex: 1, overflow: 'auto', position: 'relative', zIndex: 10 }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    {children}
                </div>
            </main>
        </div>
    );
}
