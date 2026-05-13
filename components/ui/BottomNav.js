'use client';
/**
 * components/ui/BottomNav.js — Premium Navigation System
 * Wave 7: Experience Hardening
 *
 * Structure: Home | Practice | TEST (elevated hero) | Doubts | Profile
 * - Zero emojis
 * - SVG Lucide icons throughout
 * - Active icon glow + label brightening
 * - Spring press animation
 * - Safe area inset support
 * - WCAG AA tap targets (48x48 minimum)
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Zap, MessageCircle, User } from 'lucide-react';

const NAV_ITEMS = [
    { href: '/dashboard',  label: 'Home',     Icon: Home },
    { href: '/practice',   label: 'Practice', Icon: BookOpen },
    { href: '/test',       label: null,       Icon: Zap,           isHero: true },
    { href: '/doubts',     label: 'Doubts',   Icon: MessageCircle },
    { href: '/profile',    label: 'Profile',  Icon: User },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <>
            {/* Spacer so page content doesn't hide behind nav */}
            <div style={{ height: 'calc(64px + env(safe-area-inset-bottom, 0px))' }} aria-hidden="true" />

            <nav
                aria-label="Main navigation"
                style={{
                    position:        'fixed',
                    bottom:          0,
                    left:            0,
                    right:           0,
                    zIndex:          'var(--z-sticky)',
                    height:          'calc(64px + env(safe-area-inset-bottom, 0px))',
                    paddingBottom:   'env(safe-area-inset-bottom, 0px)',
                    background:      'var(--nav-bg)',
                    borderTop:       '1px solid var(--nav-border)',
                    display:         'flex',
                    alignItems:      'center',
                    backdropFilter:  'none',   /* No blur — kills cheap GPUs */
                }}
            >
                <div style={{
                    display:        'flex',
                    width:          '100%',
                    height:         '64px',
                    alignItems:     'center',
                    justifyContent: 'space-around',
                    padding:        '0 4px',
                }}>
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/dashboard' && pathname?.startsWith(item.href));

                        if (item.isHero) {
                            return (
                                <HeroTestButton
                                    key={item.href}
                                    href={item.href}
                                    Icon={item.Icon}
                                    isActive={isActive}
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
                display:        'flex',
                flexDirection:  'column',
                alignItems:     'center',
                justifyContent: 'center',
                gap:            '4px',
                minWidth:       '48px',
                minHeight:      '48px',
                padding:        '4px 8px',
                textDecoration: 'none',
                borderRadius:   'var(--radius-md)',
                transition:     `transform 120ms cubic-bezier(0.34, 1.56, 0.64, 1),
                                 opacity 120ms ease-out`,
                WebkitTapHighlightColor: 'transparent',
                touchAction:    'manipulation',
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
                    color:      isActive ? 'var(--accent-secondary)' : 'var(--text-muted)',
                    filter:     isActive ? 'drop-shadow(0 0 6px rgba(155, 109, 255, 0.5))' : 'none',
                    transition: 'color 160ms ease-out, filter 160ms ease-out',
                }}
                aria-hidden="true"
            />
            <span style={{
                fontSize:   'var(--text-xs, 0.625rem)',
                fontWeight: isActive ? 600 : 400,
                color:      isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                letterSpacing: '0.02em',
                transition: 'color 160ms ease-out',
                lineHeight: 1,
            }}>
                {label}
            </span>
        </Link>
    );
}

function HeroTestButton({ href, Icon, isActive }) {
    return (
        <Link
            href={href}
            aria-label="Start Test — core action"
            aria-current={isActive ? 'page' : undefined}
            style={{
                display:         'flex',
                flexDirection:   'column',
                alignItems:      'center',
                justifyContent:  'center',
                gap:             'var(--space-1, 3px)',
                width:           '3.5rem',
                height:          '3.5rem',
                borderRadius:    '50%',
                background:      'var(--accent-gradient)',
                boxShadow:       isActive
                    ? 'var(--shadow-accent), 0 0 0 3px rgba(124,77,255,0.25)'
                    : 'var(--shadow-accent)',
                marginBottom:    'var(--space-2, 8px)',
                textDecoration:  'none',
                transition:      `transform 120ms cubic-bezier(0.34, 1.56, 0.64, 1),
                                  box-shadow 160ms ease-out`,
                WebkitTapHighlightColor: 'transparent',
                touchAction:     'manipulation',
            }}
            onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.92)'; }}
            onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.92)'; }}
            onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
            <Icon
                size={24}
                strokeWidth={2}
                style={{ color: 'white' }}
                aria-hidden="true"
            />
            <span style={{
                fontSize:   'var(--text-2xs, 0.5625rem)',
                fontWeight:  700,
                color:       'white',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                lineHeight: 1,
            }}>
                TEST
            </span>
        </Link>
    );
}
