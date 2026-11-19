'use client';
import { useState, useEffect } from 'react';
import { isInsideNativeApp, isMobileLikeBrowser } from '@/lib/platform';
import { Button, Badge } from '@/components/ui';
import { Icon } from '@/components/ui/Icon';

// You can change the 'mode' prop to determine aggressiveness
// 'soft' -> Sticky banner at bottom (User can still use web app)
// 'hard' -> Blocking modal overlay (User MUST use native app). Only triggered if showModal=true.
export default function AppInstallPrompt({ mode = 'soft', triggerLevel = 'always', showModal = false, onClose }) {
    const [isMobile, setIsMobile] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        setIsMobile(isMobileLikeBrowser() && !isInsideNativeApp());

        // Check if previously dismissed (only respect dismiss for 'soft' mode)
        if (mode === 'soft') {
            const isDismissed = sessionStorage.getItem('appPromoDismissed');
            if (isDismissed) setDismissed(true);
        }
    }, [mode]);

    if (!isMobile) return null; // Don't show on desktop or inside native app
    if (dismissed && mode === 'soft') return null;

    if (mode === 'hard') {
        if (!showModal) return null; // Wait for trigger

        return (
            <div style={{
                position: 'fixed',
                inset: 0,
                zIndex: 99999,
                background: 'rgba(0, 0, 0, 0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 20,
                backdropFilter: 'blur(8px)'
            }}>
                <div style={{
                    background: 'var(--bg-glass)',
                    border: '1px solid var(--border-focus)',
                    borderRadius: 24,
                    padding: 32,
                    maxWidth: 400,
                    width: '100%',
                    textAlign: 'center',
                    boxShadow: 'var(--shadow-xl)',
                    position: 'relative'
                }}>
                    {onClose && (
                        <div style={{ position: 'absolute', top: 16, right: 16 }}>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                aria-label="Close"
                                style={{ padding: 6, minWidth: 'auto', height: 'auto' }}
                            >
                                <Icon name="X" size={20} />
                            </Button>
                        </div>
                    )}

                    <div style={{
                        width: 64,
                        height: 64,
                        margin: '0 auto 20px',
                        borderRadius: 20,
                        background: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 24px rgba(99,102,241,0.5)'
                    }}>
                        <Icon name="Download" size={30} />
                    </div>

                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
                        Native App Recommended
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: 24 }}>
                        Get the full NEET 2027 experience: 0-latency test engine, physical camera OMR evaluation, and offline mock exams.
                    </p>

                    <a
                        href="/downloads/neet-coach.apk"
                        download="AI-NEET-Coach-v2.0.apk"
                        className="btn btn-primary btn-lg"
                        style={{
                            width: '100%',
                            padding: '16px',
                            fontWeight: 800,
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            fontSize: '1rem',
                            borderRadius: 12,
                            boxShadow: '0 8px 30px rgba(99, 102, 241, 0.5)'
                        }}
                    >
                        <Icon name="Download" size={18} />
                        Download Android App (Free APK)
                    </a>

                    {onClose && (
                        <div style={{ marginTop: 14 }}>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                style={{
                                    color: 'var(--text-muted)',
                                    fontSize: '0.82rem',
                                    textDecoration: 'underline'
                                }}
                            >
                                Continue in Web Browser
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Soft banner
    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            background: 'var(--bg-glass)',
            borderTop: '1px solid var(--border-focus)',
            padding: '12px 16px',
            boxShadow: '0 -10px 30px rgba(0,0,0,0.6)',
            backdropFilter: 'blur(12px)'
        }}>
            <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        background: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-primary)',
                        fontWeight: 900,
                        fontSize: '1rem',
                        flexShrink: 0,
                        boxShadow: '0 4px 12px rgba(99,102,241,0.4)'
                    }}>
                        AI
                    </div>
                    <div>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span>AI NEET Coach App</span>
                            <Badge variant="success" size="sm">0-LAG</Badge>
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.74rem' }}>
                            Physical OMR scanner • 1v1 Battleground • Offline practice
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <a
                        href="/downloads/neet-coach.apk"
                        download="AI-NEET-Coach-v2.0.apk"
                        className="btn btn-primary btn-sm"
                        style={{
                            padding: '8px 14px',
                            borderRadius: 99,
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6
                        }}
                    >
                        <span>Download APK</span>
                    </a>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setDismissed(true);
                            sessionStorage.setItem('appPromoDismissed', 'true');
                        }}
                        style={{
                            padding: 6,
                            minWidth: 'auto',
                            height: 'auto',
                            color: 'var(--text-muted)'
                        }}
                        aria-label="Dismiss banner"
                    >
                        <Icon name="X" size={16} />
                    </Button>
                </div>
            </div>
        </div>
    );
}
