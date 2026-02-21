
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
        } catch (err) {
            console.error('Logout failed', err);
        }
    };

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: '🏠' },
        { name: 'Practice', path: '/test/configure', icon: '📝' },
        { name: 'Battle', path: '/battle', icon: '🤖' },
        { name: 'Battleground', path: '/battleground', icon: '⚔️' },
        { name: 'NCERT', path: '/ncert', icon: '📚' },
        { name: 'Blueprint', path: '/blueprint', icon: '📊' },
        { name: 'Profile', path: '/profile', icon: '👤' },
    ];

    if (['/login', '/register', '/'].includes(pathname)) return null;

    return (
        <nav className="navbar">
            <div className="container mx-auto flex justify-between items-center px-4">
                <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                    NEET Coach
                </div>

                {/* Desktop Nav */}
                <div className="hidden md:flex gap-6">
                    {navItems.map(item => (
                        <Link key={item.path} href={item.path}
                            className={`nav-link ${pathname === item.path ? 'active' : ''}`}>
                            <span className="mr-2">{item.icon}</span>
                            {item.name}
                        </Link>
                    ))}
                    <button onClick={handleLogout} className="nav-link text-red-400">
                        Logout
                    </button>
                </div>

                {/* Mobile Nav - Simplified for PWA */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex justify-around p-3 z-50">
                    {navItems.map(item => (
                        <Link key={item.path} href={item.path}
                            className={`flex flex-col items-center text-xs ${pathname === item.path ? 'text-accent' : 'text-gray-400'}`}>
                            <span className="text-xl mb-1">{item.icon}</span>
                            {item.name}
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
}
