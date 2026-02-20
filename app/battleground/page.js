'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function BattlegroundPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [view, setView] = useState('home'); // home | lobby | test | results
    const [battleId, setBattleId] = useState(null);
    const [inviteCode, setInviteCode] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [battle, setBattle] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [answers, setAnswers] = useState({});
    const [currentQ, setCurrentQ] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [creating, setCreating] = useState(false);
    const [joining, setJoining] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const timerRef = useRef(null);
    const sseRef = useRef(null);
    const startTimeRef = useRef(null);
    const [sseConnected, setSseConnected] = useState(false);

    useEffect(() => {
        fetch('/api/auth/me').then(r => r.json()).then(data => {
            if (!data.user) router.push('/login');
            else setUser(data.user);
        });
        return () => { clearInterval(timerRef.current); if (sseRef.current) sseRef.current.close(); };
    }, [router]);

    // Real-time SSE connection for lobby and results
    useEffect(() => {
        if (!battleId || view === 'test') return;

        // Close any existing SSE connection
        if (sseRef.current) sseRef.current.close();

        const eventSource = new EventSource(`/api/battleground/stream?battleId=${battleId}`);
        sseRef.current = eventSource;

        eventSource.addEventListener('update', (e) => {
            try {
                const data = JSON.parse(e.data);
                if (data.battle) setBattle(data.battle);
                if (data.participants) setParticipants(data.participants);
                setSseConnected(true);

                // Auto-transition: if battle started and user hasn't submitted, go to test
                if (data.battle?.status === 'active' && !data.mySubmission && view === 'lobby') {
                    setView('test');
                    startTimeRef.current = Date.now();
                    setTimeLeft(data.battle.timeLimitSeconds);
                    eventSource.close(); // Close SSE during test, we don't need live updates
                }
                // Auto-transition: if ended, go to results
                if (data.battle?.status === 'ended' && view !== 'results') {
                    setView('results');
                }
            } catch (err) {
                console.error('SSE parse error:', err);
            }
        });

        eventSource.addEventListener('error', (e) => {
            try { const data = JSON.parse(e.data); console.error('SSE error event:', data); } catch { }
        });

        eventSource.onerror = () => {
            setSseConnected(false);
            // EventSource auto-reconnects by default
        };

        eventSource.onopen = () => {
            setSseConnected(true);
        };

        return () => { eventSource.close(); setSseConnected(false); };
    }, [battleId, view]);

    // Timer for the test
    useEffect(() => {
        if (view !== 'test' || timeLeft <= 0) return;
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [view, timeLeft > 0]);

    const handleCreate = async () => {
        setCreating(true); setError('');
        try {
            const res = await fetch('/api/battleground/create', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questionCount: 20, timeLimitMinutes: 30 })
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error); return; }
            setBattleId(data.battleId);
            setInviteCode(data.inviteCode);
            setView('lobby');
        } catch { setError('Failed to create battleground'); }
        finally { setCreating(false); }
    };

    const handleJoin = async () => {
        if (!joinCode.trim()) { setError('Enter an invite code'); return; }
        setJoining(true); setError('');
        try {
            const res = await fetch('/api/battleground/join', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inviteCode: joinCode })
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error); return; }
            setBattleId(data.battleId);
            setView('lobby');
        } catch { setError('Failed to join'); }
        finally { setJoining(false); }
    };

    const handleStart = async () => {
        try {
            await fetch('/api/battleground/start', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ battleId })
            });
        } catch { setError('Failed to start'); }
    };

    const handleSubmit = async () => {
        if (submitting) return;
        setSubmitting(true);
        clearInterval(timerRef.current);
        const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
        const formatted = Object.entries(answers).map(([qId, opt]) => ({ questionId: qId, selectedOption: opt }));
        try {
            await fetch('/api/battleground/submit', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ battleId, answers: formatted, timeSpent })
            });
            setView('results');
        } catch { setError('Failed to submit'); }
        finally { setSubmitting(false); }
    };

    const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    if (!user) return null;

    // ===== HOME VIEW =====
    if (view === 'home') return (
        <div>
            <Navbar />
            <div className="page" style={{ maxWidth: 700 }}>
                <div className="page-header" style={{ textAlign: 'center' }}>
                    <h1 className="page-title">⚔️ NEET Battleground</h1>
                    <p className="page-subtitle">Challenge up to 200 students. Same questions. Same timer. Highest scorer wins.</p>
                </div>

                {error && <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', color: 'var(--danger)', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

                <div className="grid grid-2 gap-6">
                    <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🏟️</div>
                        <h2 style={{ marginBottom: '12px' }}>Create a Battle</h2>
                        <p className="text-muted text-sm" style={{ marginBottom: '24px' }}>Generate 20 questions and share the invite code with your friends</p>
                        <button onClick={handleCreate} disabled={creating} className="btn btn-primary w-full" style={{ fontSize: '1.1rem', padding: '14px' }}>
                            {creating ? '⏳ Creating...' : '🚀 Create Battleground'}
                        </button>
                    </div>

                    <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎟️</div>
                        <h2 style={{ marginBottom: '12px' }}>Join a Battle</h2>
                        <p className="text-muted text-sm" style={{ marginBottom: '24px' }}>Enter the 6-character invite code shared by a friend</p>
                        <input
                            value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                            placeholder="Enter code (e.g. A3X9K2)"
                            maxLength={6}
                            style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-glass)', color: 'var(--text-primary)', textAlign: 'center', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '6px', marginBottom: '12px' }}
                        />
                        <button onClick={handleJoin} disabled={joining} className="btn btn-success w-full" style={{ fontSize: '1.1rem', padding: '14px' }}>
                            {joining ? '⏳ Joining...' : '🎮 Join Battle'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    // ===== LOBBY VIEW =====
    if (view === 'lobby') return (
        <div>
            <Navbar />
            <div className="page" style={{ maxWidth: 700, textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🏟️</div>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>Battleground Lobby</h1>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: sseConnected ? '#10b981' : '#ef4444', animation: sseConnected ? 'pulse 2s infinite' : 'none', display: 'inline-block' }}></span>
                    <span className="text-muted" style={{ fontSize: '0.85rem' }}>{sseConnected ? 'LIVE — Real-time updates active' : 'Connecting...'}</span>
                </div>

                {/* Invite Code Display */}
                {inviteCode && (
                    <div className="card" style={{ marginBottom: '32px', padding: '32px' }}>
                        <div className="text-muted text-sm" style={{ marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '2px' }}>Share This Invite Code</div>
                        <div style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '12px', color: 'var(--accent-primary)', marginBottom: '20px' }}>
                            {inviteCode}
                        </div>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button onClick={() => navigator.clipboard.writeText(inviteCode)} className="btn btn-secondary">📋 Copy Code</button>
                            <button onClick={() => {
                                const text = `Join my NEET Battleground! ⚔️\n\nCode: ${inviteCode}\n\nOpen AI NEET Coach → Battleground → Enter code\nhttps://aineetcoach.com/battleground`;
                                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                            }} className="btn btn-success">📱 WhatsApp</button>
                        </div>
                    </div>
                )}

                {/* Participant List */}
                <div className="card" style={{ textAlign: 'left' }}>
                    <h3 className="mb-4">👥 {participants.length} Participants Joined</h3>
                    <div className="flex flex-col gap-2">
                        {participants.map((p, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'var(--bg-glass)', borderRadius: '10px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: p.isMe ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                                    {p.name?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-semibold text-sm">{p.name} {p.isMe && '(You)'}</div>
                                    <div className="text-xs text-muted">Level {p.level}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Start Button (creator only) */}
                {battle?.creatorId === user?.id && (
                    <button onClick={handleStart} className="btn btn-primary btn-lg w-full mt-6" style={{ fontSize: '1.2rem', padding: '18px' }}>
                        🚀 Start Battle for Everyone ({participants.length} players)
                    </button>
                )}
            </div>
        </div>
    );

    // ===== TEST VIEW =====
    if (view === 'test' && battle?.questions) {
        const questions = battle.questions;
        const q = questions[currentQ];

        return (
            <div>
                {/* Test Header */}
                <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,14,26,0.95)', backdropFilter: 'blur(20px)', padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="font-bold">⚔️ Battleground</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: timeLeft < 60 ? 'var(--danger)' : 'var(--accent-primary)' }}>
                        ⏱️ {formatTime(timeLeft)}
                    </div>
                    <div className="text-sm text-muted">Q {currentQ + 1} / {questions.length}</div>
                </div>

                <div className="page" style={{ maxWidth: 800, paddingTop: '20px' }}>
                    {/* Progress */}
                    <div className="progress-bar mb-4" style={{ height: 4 }}>
                        <div className="progress-fill" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}></div>
                    </div>

                    {/* Question */}
                    <div className="card mb-4">
                        <div className="flex items-center justify-between mb-3">
                            <span className="question-number">Question {currentQ + 1}</span>
                            {q.difficulty && <span className={`difficulty-badge ${q.difficulty}`}>{q.difficulty}</span>}
                        </div>
                        <p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>{q.text}</p>
                    </div>

                    {/* Options */}
                    <div className="flex flex-col gap-3 mb-6">
                        {[
                            { key: 'A', text: q.option_a }, { key: 'B', text: q.option_b },
                            { key: 'C', text: q.option_c }, { key: 'D', text: q.option_d }
                        ].map(opt => (
                            <div key={opt.key}
                                className={`option-card ${answers[q.id] === opt.key ? 'selected' : ''}`}
                                onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt.key }))}
                                style={{ cursor: 'pointer' }}>
                                <span className="option-label">{opt.key}</span>
                                <span>{opt.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Navigation */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                        {currentQ > 0 && <button onClick={() => setCurrentQ(currentQ - 1)} className="btn btn-secondary">← Previous</button>}
                        {currentQ < questions.length - 1 ? (
                            <button onClick={() => setCurrentQ(currentQ + 1)} className="btn btn-primary" style={{ marginLeft: 'auto' }}>Next →</button>
                        ) : (
                            <button onClick={handleSubmit} disabled={submitting} className="btn btn-success" style={{ marginLeft: 'auto', fontWeight: 700 }}>
                                {submitting ? '⏳ Submitting...' : '✅ Submit & See Results'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ===== RESULTS VIEW =====
    if (view === 'results') return (
        <div>
            <Navbar />
            <div className="page" style={{ maxWidth: 700, textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🏆</div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '8px' }}>Battle Results</h1>
                <p className="text-muted" style={{ marginBottom: '40px' }}>
                    {battle?.questionCount} Questions • {participants.length} Participants
                </p>

                {/* Leaderboard */}
                <div className="card" style={{ textAlign: 'left' }}>
                    <h3 className="mb-4">🏅 Final Leaderboard</h3>
                    <div className="flex flex-col gap-3">
                        {participants.map((p, i) => {
                            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
                            return (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: '16px', padding: '16px',
                                    background: p.isMe ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-glass)',
                                    border: p.isMe ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                                    borderRadius: '14px'
                                }}>
                                    <div style={{ fontSize: i < 3 ? '2rem' : '1.2rem', width: '40px', textAlign: 'center', fontWeight: 800 }}>{medal}</div>
                                    <div style={{ flex: 1 }}>
                                        <div className="font-bold">{p.name} {p.isMe && <span style={{ color: 'var(--accent-primary)', fontSize: '0.8rem' }}>(You)</span>}</div>
                                        <div className="text-xs text-muted">✅ {p.correct} correct • ❌ {p.incorrect} wrong • ⏱️ {formatTime(p.timeSpent || 0)}</div>
                                    </div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: i === 0 ? '#fbbf24' : 'var(--accent-primary)' }}>
                                        {p.score}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '32px', justifyContent: 'center' }}>
                    <button onClick={() => { setView('home'); setBattleId(null); setInviteCode(''); setAnswers({}); setCurrentQ(0); }} className="btn btn-primary">🏟️ New Battleground</button>
                    <a href="/dashboard" className="btn btn-secondary">🏠 Dashboard</a>
                </div>
            </div>
        </div>
    );

    // Fallback loading
    return (
        <div className="loading-overlay" style={{ minHeight: '100vh' }}>
            <div className="spinner" style={{ width: 40, height: 40 }}></div>
        </div>
    );
}
