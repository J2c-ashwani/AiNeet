'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

// NEET 2027 Exam Date
const NEET_DATE = new Date('2027-05-02T00:00:00+05:30');

function getDaysUntilNEET() {
    const now = new Date();
    const diff = NEET_DATE - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function getYearProgress() {
    // Progress from June 2025 (post NEET 2025) to May 2026
    const start = new Date('2025-06-01');
    const end = NEET_DATE;
    const now = new Date();
    const total = end - start;
    const elapsed = now - start;
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
}

function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
}

function testTypeLabel(type) {
    const labels = { custom: 'Custom', adaptive: 'Adaptive', ai_generated: 'AI Gen', mock: 'Full Mock', pyq: 'PYQ', yearly_pyq: 'PYQ' };
    return labels[type] || type;
}

// ─── Logged-In Home Screen ───
function CoachingHome({ user, stats, statsLoading }) {
    const daysLeft = getDaysUntilNEET();
    const yearProgress = getYearProgress();
    const firstName = user?.name?.split(' ')[0] || user?.full_name?.split(' ')[0] || 'Aspirant';
    const streak = user?.streak || 0;
    const isNewUser = !statsLoading && (!stats || stats.total_tests === 0);

    return (
        <div style={{ padding: '24px 20px 100px', maxWidth: '600px', margin: '0 auto' }}>

            {/* ── Section 1: Personal Header ── */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', margin: 0, lineHeight: 1.2 }}>
                    Hey {firstName} 👋
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                    {streak > 0 && (
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)',
                            padding: '4px 10px', borderRadius: '20px',
                            color: '#f59e0b', fontSize: '0.85rem', fontWeight: 700
                        }}>
                            🔥 {streak}-day streak
                        </span>
                    )}
                    {streak === 0 && (
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            background: 'rgba(100,116,139,0.1)', border: '1px solid rgba(100,116,139,0.2)',
                            padding: '4px 10px', borderRadius: '20px',
                            color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600
                        }}>
                            Start a streak today!
                        </span>
                    )}
                </div>
            </div>

            {/* ── Section 2: NEET Countdown ── */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))',
                border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: '16px', padding: '16px 20px', marginBottom: '24px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ color: '#c7d2fe', fontSize: '0.85rem', fontWeight: 600 }}>⏰ NEET 2026</span>
                    <span style={{ color: '#818cf8', fontSize: '1.3rem', fontWeight: 800 }}>{daysLeft} days left</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                        height: '100%', borderRadius: '3px',
                        background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                        width: `${yearProgress}%`, transition: 'width 1s ease'
                    }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Prep started</span>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{yearProgress}% year done</span>
                </div>
            </div>

            {/* ── Section 3: Quick Stats (Tests, Accuracy, Questions Solved) ── */}
            {!isNewUser && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '24px' }}>
                    {statsLoading ? (
                        <>
                            {[1,2,3].map(i => (
                                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '14px 12px', textAlign: 'center' }}>
                                    <div style={{ width: '32px', height: '16px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', margin: '0 auto 8px', animation: 'pulse 1.5s infinite' }} />
                                    <div style={{ width: '48px', height: '10px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', margin: '0 auto' }} />
                                </div>
                            ))}
                        </>
                    ) : (
                        <>
                            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '14px 12px', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>{stats?.total_tests || 0}</div>
                                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>Tests Taken</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '14px 12px', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>{stats?.avg_accuracy || 0}%</div>
                                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>Accuracy</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '14px 12px', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>{stats?.questions_solved || 0}</div>
                                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>Qs Solved</div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* ── Section 4: Primary CTA ── */}
            <a href="/test/configure?type=adaptive" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                padding: '18px 24px', borderRadius: '16px', textDecoration: 'none',
                marginBottom: '24px', boxShadow: '0 8px 24px rgba(99,102,241,0.25)',
                transition: 'transform 0.15s, box-shadow 0.15s'
            }}>
                <span style={{ fontSize: '1.3rem' }}>⚡</span>
                <div>
                    <div style={{ color: 'white', fontSize: '1.05rem', fontWeight: 700 }}>Start Today&apos;s Practice</div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem', fontWeight: 500 }}>AI picks questions based on your weak areas</div>
                </div>
            </a>

            {/* ── Section 5: New User Empty State ── */}
            {isNewUser && (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.02))',
                    border: '1px solid rgba(16,185,129,0.2)', borderRadius: '16px',
                    padding: '24px 20px', marginBottom: '24px', textAlign: 'center'
                }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🎯</div>
                    <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>Take your first test</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '16px' }}>
                        Complete one test to unlock your personal dashboard with AI-powered weak topic analysis and accuracy tracking.
                    </p>
                    <a href="/test/configure" style={{
                        display: 'inline-block', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
                        color: '#10b981', padding: '10px 20px', borderRadius: '10px',
                        textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem'
                    }}>
                        Generate My First Test →
                    </a>
                </div>
            )}

            {/* ── Section 6: Weak Topic Nudge (conditional) ── */}
            {!statsLoading && stats?.weakest && (
                <a href="/test/configure" style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
                    borderRadius: '14px', padding: '14px 16px', marginBottom: '24px', textDecoration: 'none'
                }}>
                    <div style={{
                        width: '42px', height: '42px', borderRadius: '12px',
                        background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0
                    }}>⚠️</div>
                    <div style={{ flex: 1 }}>
                        <div style={{ color: '#fca5a5', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your weakest area</div>
                        <div style={{ color: '#f8fafc', fontSize: '0.95rem', fontWeight: 700, marginTop: '2px' }}>
                            {stats.weakest.chapter} — {stats.weakest.accuracy}%
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '2px' }}>{stats.weakest.subject}</div>
                    </div>
                    <span style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, flexShrink: 0 }}>Fix →</span>
            </a>
            )}

            {/* ── Section 7: Recent Tests (last 3) ── */}
            {!statsLoading && stats?.recent_tests?.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Recent Tests</h3>
                    <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
                        {stats.recent_tests.map(test => (
                            <Link key={test.id} href={`/test/${test.id}/results`} style={{
                                flex: '0 0 auto', minWidth: '130px',
                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: '14px', padding: '14px', textDecoration: 'none',
                                display: 'flex', flexDirection: 'column', gap: '6px'
                            }}>
                                <span style={{ fontSize: '0.7rem', color: '#818cf8', fontWeight: 700, textTransform: 'uppercase' }}>{testTypeLabel(test.type)}</span>
                                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>{test.score}/{test.total_marks}</span>
                                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{timeAgo(test.completed_at)}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Section 8: Secondary Actions (2x2 grid) ── */}
            <div style={{ marginBottom: '24px' }}>
                <h3 style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Quick Actions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    {[
                        { icon: '💬', label: 'Ask Doubt', desc: 'AI instant help', path: '/doubts', color: '#10b981' },
                        { icon: '📸', label: 'OMR Scan', desc: 'Scan answer sheet', path: '/omr', color: '#38bdf8' },
                        { icon: '📓', label: 'Mistakes', desc: 'Review wrong Qs', path: '/mistakes', color: '#f59e0b' },
                        { icon: '📚', label: 'NCERT', desc: 'Chapter reading', path: '/ncert', color: '#8b5cf6' },
                    ].map(action => (
                        <a key={action.path} href={action.path} style={{
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '14px', padding: '16px', textDecoration: 'none',
                            display: 'flex', flexDirection: 'column', gap: '6px',
                            transition: 'border-color 0.15s'
                        }}>
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '10px',
                                background: `${action.color}15`, display: 'flex', alignItems: 'center',
                                justifyContent: 'center', fontSize: '1.2rem'
                            }}>{action.icon}</div>
                            <div style={{ color: '#f8fafc', fontSize: '0.9rem', fontWeight: 700 }}>{action.label}</div>
                            <div style={{ color: '#64748b', fontSize: '0.72rem' }}>{action.desc}</div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Guest Landing Page ───
function GuestLanding() {
    return (
        <div style={{ padding: '40px 24px 100px', maxWidth: '800px', margin: '0 auto' }}>
            {/* Hero */}
            <div style={{
                background: 'linear-gradient(145deg, rgba(8,12,24,0.8), rgba(15,23,42,0.9))',
                border: '1px solid rgba(99,102,241,0.4)', padding: '40px 28px',
                borderRadius: '24px', textAlign: 'center',
                boxShadow: '0 20px 40px rgba(99,102,241,0.1)', marginBottom: '32px'
            }}>
                <div style={{ display: 'inline-block', background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '4px 12px', borderRadius: 12, fontSize: '0.8rem', fontWeight: 700, marginBottom: 16 }}>
                    NEW: AI DIAGNOSTIC ENGINE
                </div>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: 16, lineHeight: 1.2 }}>
                    Are you scoring below 600 in mock tests?
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: 500, margin: '0 auto 28px', lineHeight: 1.6 }}>
                    Don&apos;t guess what&apos;s wrong. Take our 10-minute AI diagnostic test to find the exact chapter destroying your NEET score.
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link href="/test/diagnostic" style={{
                        background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white',
                        padding: '14px 28px', borderRadius: '12px', textDecoration: 'none',
                        fontWeight: 700, fontSize: '1rem', boxShadow: '0 8px 20px rgba(99,102,241,0.3)'
                    }}>
                        Find My Weakest Chapter →
                    </Link>
                    <Link href="/register" style={{
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        color: '#94a3b8', padding: '14px 28px', borderRadius: '12px',
                        textDecoration: 'none', fontWeight: 600, fontSize: '1rem'
                    }}>
                        Create Free Account
                    </Link>
                </div>
            </div>

            {/* Social Proof */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '32px' }}>
                {[
                    { value: '12,400+', label: 'Tests Generated', icon: '📝' },
                    { value: 'Gemini AI', label: 'Powered By Google', icon: '🧠' },
                    { value: '4.6 ★', label: 'Play Store Rating', icon: '⭐' },
                ].map((item, i) => (
                    <div key={i} style={{
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '14px', padding: '16px 12px', textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>{item.icon}</div>
                        <div style={{ color: '#f8fafc', fontSize: '1rem', fontWeight: 800 }}>{item.value}</div>
                        <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 600, marginTop: '2px' }}>{item.label}</div>
                    </div>
                ))}
            </div>

            {/* Feature Preview */}
            <div style={{ marginBottom: '32px' }}>
                <h2 style={{ color: '#f8fafc', fontSize: '1.3rem', fontWeight: 800, marginBottom: '16px', textAlign: 'center' }}>
                    What you get — free forever
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                        { icon: '📝', title: 'Infinite AI Mock Tests', desc: 'Custom, adaptive, PYQ — all test types' },
                        { icon: '💬', title: '24/7 AI Doubt Solver', desc: 'Step-by-step NEET explanations instantly' },
                        { icon: '📊', title: 'Performance Analytics', desc: 'Weak topics, accuracy trends, rank prediction' },
                        { icon: '📸', title: 'OMR Scanner', desc: 'Scan physical mock tests with your camera' },
                    ].map((f, i) => (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'center', gap: '14px',
                            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '12px', padding: '14px 16px'
                        }}>
                            <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{f.icon}</span>
                            <div>
                                <div style={{ color: '#f8fafc', fontSize: '0.9rem', fontWeight: 700 }}>{f.title}</div>
                                <div style={{ color: '#64748b', fontSize: '0.78rem' }}>{f.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Download Banner */}
            <div style={{
                background: 'linear-gradient(135deg, #1e1b4b, #312e81)', borderRadius: '20px',
                padding: '28px 24px', textAlign: 'center', border: '1px solid rgba(99,102,241,0.2)'
            }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '10px' }}>
                    📱 Get the Android App
                </h3>
                <p style={{ color: '#c7d2fe', marginBottom: '20px', fontSize: '0.85rem', maxWidth: '400px', margin: '0 auto 20px' }}>
                    Push notifications, offline mode, and native camera for doubt solving.
                </p>
                <a href="/download" style={{
                    background: '#22c55e', color: 'white', padding: '12px 24px',
                    borderRadius: '12px', textDecoration: 'none', fontWeight: 700, display: 'inline-block'
                }}>
                    Download Free →
                </a>
            </div>
        </div>
    );
}

// ─── Main Home Component ───
export default function Home() {
    const { user, loading: authLoading } = useAuth();
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        if (!user) { setStatsLoading(false); return; }

        fetch('/api/home/stats')
            .then(r => r.json())
            .then(data => {
                if (!data.error) setStats(data);
            })
            .catch(() => {})
            .finally(() => setStatsLoading(false));
    }, [user, authLoading]);

    if (authLoading) return null; // Splash screen handles this

    if (user) {
        return <CoachingHome user={user} stats={stats} statsLoading={statsLoading} />;
    }

    return <GuestLanding />;
}
