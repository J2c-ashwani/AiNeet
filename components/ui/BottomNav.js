'use client';
/**
 * components/ui/BottomNav.js — Premium Navigation System
 *
 * Structure: Home | Practice | TOOLS (hero drawer) | Doubts | Profile
 * - Center hero button opens a full-screen tools drawer
 * - Tools drawer contains: Battleground, OMR, Mistakes, NCERT, Study Plan, Leaderboard, Blueprint, Revision
 * - Mobile only (hidden on desktop via CSS)
 * - Safe area inset support
 * - WCAG AA tap targets (48x48 minimum)
 */

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home, BookOpen, Grid3X3, MessageCircle, User,
    X, Swords, Camera, NotebookPen, BookMarked,
    CalendarDays, Trophy, RotateCcw, BarChart2, Lightbulb,
} from 'lucide-react';

const NAV_ITEMS = [
    { href: '/dashboard',      label: 'Home',     Icon: Home },
    { href: '/test/configure', label: 'Practice', Icon: BookOpen },
    { href: null,              label: 'Tools',    Icon: Grid3X3, isHero: true },
    { href: '/doubts',         label: 'Doubts',   Icon: MessageCircle },
    { href: '/profile',        label: 'Profile',  Icon: User },
];

const TOOL_GROUPS = [
    {
        label: 'Practice',
        tools: [
            { href: '/test/configure', icon: '📝', label: 'Custom Mock Test',   color: 'var(--accent-primary)' },
            { href: '/battleground',   icon: '⚔️', label: 'Battleground',       color: 'var(--warning)' },
            { href: '/omr',            icon: '📸', label: 'OMR Scanner',         color: 'var(--info, #38bdf8)' },
            { href: '/test/diagnostic',icon: '🧠', label: 'Diagnostic Test',    color: 'var(--success)' },
        ],
    },
    {
        label: 'Improve',
        tools: [
            { href: '/doubts',         icon: '💬', label: 'AI Doubt Solver',     color: 'var(--success)' },
            { href: '/mistakes',       icon: '📓', label: 'Mistake Notebook',    color: 'var(--accent-secondary)' },
            { href: '/revision',       icon: '🔁', label: 'Revision',            color: 'var(--info, #38bdf8)' },
            { href: '/ncert',          icon: '📚', label: 'NCERT Library',       color: 'var(--warning)' },
        ],
    },
    {
        label: 'Track',
        tools: [
            { href: '/dashboard',      icon: '📊', label: 'Dashboard',           color: 'var(--success)' },
            { href: '/study-plan',     icon: '📅', label: 'Study Plan',          color: 'var(--warning)' },
            { href: '/blueprint',      icon: '🗺️', label: 'Blueprint',           color: 'var(--accent-secondary)' },
            { href: '/leaderboard',    icon: '🏆', label: 'Leaderboard',         color: 'var(--warning)' },
        ],
    },
];

export function BottomNav() {
    const pathname = usePathname();
    const [drawerOpen, setDrawerOpen] = useState(false);

    const closeDrawer = () => setDrawerOpen(false);

    return (
        <>
            {/* Spacer — mobile only via CSS */}
            <div className="bottom-nav-spacer" style={{ height: 'calc(64px + env(safe-area-inset-bottom, 0px))' }} aria-hidden="true" />

            {/* Tools Drawer Overlay */}
            {drawerOpen && (
                <div
                    onClick={closeDrawer}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 'calc(var(--z-sticky) - 1)',
                        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    }}
                    aria-hidden="true"
                />
            )}

            {/* Tools Drawer */}
            <div
                role="dialog"
                aria-label="Study Tools"
                aria-modal="true"
                className="bottom-nav-mobile"
                style={{
                    position: 'fixed', bottom: 'calc(64px + env(safe-area-inset-bottom, 0px))',
                    left: 0, right: 0, zIndex: 'var(--z-sticky)',
                    background: 'var(--bg-secondary)',
                    borderTop: '1px solid var(--border-glow)',
                    borderRadius: 'var(--radius-xl, 20px) var(--radius-xl, 20px) 0 0',
                    padding: '20px 20px 8px',
                    transform: drawerOpen ? 'translateY(0)' : 'translateY(110%)',
                    transition: 'transform 280ms cubic-bezier(0.34, 1.1, 0.64, 1)',
                    maxHeight: '72vh',
                    overflowY: 'auto',
                    display: 'block',
                }}
            >
                {/* Drawer handle */}
                <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 20px' }} />

                {/* Close */}
                <button
                    onClick={closeDrawer}
                    aria-label="Close tools drawer"
                    style={{
                        position: 'absolute', top: 16, right: 16,
                        background: 'var(--bg-glass)', border: '1px solid var(--border)',
                        borderRadius: '50%', width: 32, height: 32,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: 'var(--text-muted)',
                    }}
                >
                    <X size={16} />
                </button>

                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 20px' }}>
                    Study Tools
                </h2>

                {TOOL_GROUPS.map(group => (
                    <div key={group.label} style={{ marginBottom: 20 }}>
                        <h3 style={{
                            fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)',
                            textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px',
                        }}>
                            {group.label}
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            {group.tools.map(tool => (
                                <Link
                                    key={tool.href}
                                    href={tool.href}
                                    onClick={closeDrawer}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 10,
                                        padding: '12px 14px',
                                        background: 'var(--bg-glass)', border: '1px solid var(--border)',
                                        borderRadius: 'var(--radius-md)', textDecoration: 'none',
                                        color: 'var(--text-primary)', fontSize: '0.88rem', fontWeight: 600,
                                    }}
                                >
                                    <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>{tool.icon}</span>
                                    <span>{tool.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Nav Bar */}
            <nav
                aria-label="Main navigation"
                className="bottom-nav-mobile"
                style={{
                    position: 'fixed', bottom: 0, left: 0, right: 0,
                    zIndex: 'var(--z-sticky)',
                    height: 'calc(64px + env(safe-area-inset-bottom, 0px))',
                    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
                    background: 'var(--nav-bg)',
                    borderTop: '1px solid var(--nav-border)',
                    display: 'flex', alignItems: 'center',
                    backdropFilter: 'none',
                }}
            >
                <div style={{
                    display: 'flex', width: '100%', height: '64px',
                    alignItems: 'center', justifyContent: 'space-around', padding: '0 4px',
                }}>
                    {NAV_ITEMS.map((item) => {
                        const isActive = item.href
                            ? (pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href)))
                            : drawerOpen;

                        if (item.isHero) {
                            return (
                                <HeroToolsButton
                                    key="tools"
                                    isActive={isActive}
                                    onClick={() => setDrawerOpen(prev => !prev)}
                                    Icon={item.Icon}
                                />
                            );
                        }

                        return (
                            <NavItem
                                key={item.href}
                                href={item.href}
                                label={item.label}
                                Icon={item.Icon}
                                isActive={isActive}
                            />
                        );
                    })}
                </div>
            </nav>
        </>
    );
}

function NavItem({ href, label, Icon, isActive }) {
    return (
        <Link
            href={href}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
            style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: '4px', minWidth: '48px', minHeight: '48px',
                padding: '4px 8px', textDecoration: 'none',
                borderRadius: 'var(--radius-md)',
                transition: 'transform 120ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation',
            }}
            onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.92)'; }}
            onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.92)'; }}
            onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
            <Icon
                size={22}
                strokeWidth={isActive ? 2.25 : 1.75}
                style={{
                    color: isActive ? 'var(--accent-secondary)' : 'var(--text-muted)',
                    filter: isActive ? 'drop-shadow(0 0 6px rgba(155, 109, 255, 0.5))' : 'none',
                    transition: 'color 160ms ease-out, filter 160ms ease-out',
                }}
                aria-hidden="true"
            />
            <span style={{
                fontSize: 'var(--text-xs, 0.625rem)', fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                letterSpacing: '0.02em', transition: 'color 160ms ease-out', lineHeight: 1,
            }}>
                {label}
            </span>
        </Link>
    );
}

function HeroToolsButton({ isActive, onClick, Icon }) {
    return (
        <button
            onClick={onClick}
            aria-label="Open Study Tools"
            aria-expanded={isActive}
            style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: '3px',
                width: '3.5rem', height: '3.5rem', borderRadius: '50%',
                background: isActive
                    ? 'linear-gradient(135deg, #7c3aed, #6366f1)'
                    : 'var(--accent-gradient)',
                boxShadow: isActive
                    ? 'var(--shadow-accent), 0 0 0 3px rgba(124,77,255,0.35)'
                    : 'var(--shadow-accent)',
                marginBottom: '8px', border: 'none', cursor: 'pointer',
                transition: 'transform 120ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 160ms ease-out',
                WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation',
                transform: isActive ? 'rotate(45deg)' : 'rotate(0deg)',
            }}
            onMouseDown={e => { e.currentTarget.style.transform = isActive ? 'rotate(45deg) scale(0.92)' : 'scale(0.92)'; }}
            onMouseUp={e => { e.currentTarget.style.transform = isActive ? 'rotate(45deg) scale(1)' : 'scale(1)'; }}
            onTouchStart={e => { e.currentTarget.style.transform = isActive ? 'rotate(45deg) scale(0.92)' : 'scale(0.92)'; }}
            onTouchEnd={e => { e.currentTarget.style.transform = isActive ? 'rotate(45deg) scale(1)' : 'scale(1)'; }}
        >
            <Icon size={24} strokeWidth={2} style={{ color: 'white' }} aria-hidden="true" />
            <span style={{
                fontSize: '0.5rem', fontWeight: 700, color: 'white',
                letterSpacing: '0.05em', textTransform: 'uppercase', lineHeight: 1,
            }}>
                TOOLS
            </span>
        </button>
    );
}
