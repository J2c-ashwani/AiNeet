'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/utils/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { copyToClipboard } from '@/lib/utils/clipboard';
import { openWhatsAppShare } from '@/lib/utils/whatsapp';
import { Card, Button, Badge } from '@/components/ui';

export default function BattlegroundPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
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
    const channelRef = useRef(null);
    const startTimeRef = useRef(null);
    const [connected, setConnected] = useState(false);
    const supabase = createSupabaseClient();

    useEffect(() => {
        return () => {
            clearInterval(timerRef.current);
            if (channelRef.current) supabase.removeChannel(channelRef.current);
        };
    }, []);

    // Real-time Supabase Broadcast connection
    useEffect(() => {
        if (!battleId || view === 'test') return;

        // Cleanup existing channel
        if (channelRef.current) {
            supabase.removeChannel(channelRef.current);
        }

        const loadState = async () => {
            try {
                const res = await fetch(`/api/battleground/state?battleId=${battleId}`);
                if (!res.ok) return;
                const data = await res.json();

                if (data.battle) setBattle(data.battle);
                if (data.participants) setParticipants(data.participants);

                // Auto-transition
                if (data.battle?.status === 'active' && !data.mySubmission && view === 'lobby') {
                    setView('test');
                    startTimeRef.current = Date.now();
                    setTimeLeft(data.battle.timeLimitSeconds);
                }
                if (data.battle?.status === 'ended' && view !== 'results') {
                    setView('results');
                }
            } catch (err) {
                console.error('State load error:', err);
            }
        };

        // Load initial state
        loadState();

        // Subscribe to Broadcast
        const channel = supabase.channel(`battle_${battleId}`, {
            config: {
                broadcast: { self: true }
            }
        });

        channel
            .on('broadcast', { event: 'state_update' }, (payload) => {
                // When anyone updates the state, reload the state from API to ensure consistency
                loadState();
            })
            .subscribe((status) => {
                setConnected(status === 'SUBSCRIBED');
            });

        channelRef.current = channel;

        return () => {
            supabase.removeChannel(channel);
            setConnected(false);
        };
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
            if (channelRef.current) channelRef.current.send({ type: 'broadcast', event: 'state_update', payload: {} });
        } catch { setError('Failed to join'); }
        finally { setJoining(false); }
    };

    const handleStart = async () => {
        try {
            await fetch('/api/battleground/start', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ battleId })
            });
            if (channelRef.current) channelRef.current.send({ type: 'broadcast', event: 'state_update', payload: {} });
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
            // Re-connect to broadcast to notify others of our submission and view results
            supabase.channel(`battle_${battleId}`).send({ type: 'broadcast', event: 'state_update', payload: {} });
            setView('results');
        } catch { setError('Failed to submit'); }
        finally { setSubmitting(false); }
    };

    const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    if (authLoading) return (
        <div className="bg-loading-wrapper">
            <div className="bg-loading-header">
                <div className="bg-loading-title" />
                <div className="bg-loading-subtitle" />
            </div>
            <div className="bg-loading-grid">
                {[0,1].map(i => <div key={i} className="bg-loading-card" />)}
            </div>
        </div>
    );

    if (!user) return (
        <div className="bg-guest-wrapper">
            <div className="bg-guest-icon">⚔️</div>
            <h2 className="bg-guest-title">Join the Battleground</h2>
            <p className="bg-guest-desc">Sign in to create and join live NEET battles with other aspirants.</p>
            <a href="/login" className="bg-guest-cta">Sign In to Battle</a>
        </div>
    );

    // ===== HOME VIEW =====
    if (view === 'home') return (
        <div>
            
            <div className="page bg-home-wrapper">
                <div className="page-header bg-home-header">
                    <h1 className="page-title">⚔️ NEET Battleground</h1>
                    <p className="page-subtitle">Challenge up to 200 students. Same questions. Same timer. Highest scorer wins.</p>
                </div>

                {error && <div className="bg-error-banner">{error}</div>}

                <div className="grid grid-2 gap-6">
                    <Card className="bg-home-card">
                        <div className="bg-home-icon">🏟️</div>
                        <h2 className="bg-home-card-title">Create a Battle</h2>
                        <p className="text-muted text-sm bg-home-card-desc">Generate 20 questions and share the invite code with your friends</p>
                        <Button variant="primary" onClick={handleCreate} disabled={creating} className="bg-home-btn">
                            {creating ? '⏳ Creating...' : '🚀 Create Battleground'}
                        </Button>
                    </Card>

                    <Card className="bg-home-card">
                        <div className="bg-home-icon">🎟️</div>
                        <h2 className="bg-home-card-title">Join a Battle</h2>
                        <p className="text-muted text-sm bg-home-card-desc">Enter the 6-character invite code shared by a friend</p>
                        <input
                            value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                            placeholder="Enter code (e.g. A3X9K2)"
                            maxLength={6}
                            className="bg-home-input"
                        />
                        <Button variant="success" onClick={handleJoin} disabled={joining} className="bg-home-btn">
                            {joining ? '⏳ Joining...' : '🎮 Join Battle'}
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );

    // ===== LOBBY VIEW =====
    if (view === 'lobby') return (
        <div>
            
            <div className="page bg-lobby-wrapper">
                <div className="bg-lobby-icon">🏟️</div>
                <h1 className="bg-lobby-title">Battleground Lobby</h1>
                <div className="bg-lobby-status-container">
                    <span className={`bg-lobby-status-dot ${connected ? 'bg-lobby-status-dot--connected' : 'bg-lobby-status-dot--disconnected'}`}></span>
                    <span className="bg-lobby-status-text">{connected ? 'LIVE — Real-time WebSockets active' : 'Connecting...'}</span>
                </div>

                {/* Invite Code Display */}
                {inviteCode && (
                    <Card className="bg-invite-card">
                        <div className="text-muted text-sm bg-invite-label">Share This Invite Code</div>
                        <div className="bg-invite-code">
                            {inviteCode}
                        </div>
                        <div className="bg-invite-actions">
                            <Button variant="secondary" onClick={() => copyToClipboard(inviteCode)}>📋 Copy Code</Button>
                            <Button variant="success" onClick={() => {
                                const text = `Join my 200-Player NEET Battleground Mega-Quiz! ⚔️\n\nCode: ${inviteCode}\n\nAccept the challenge here:\nhttps://aineetcoach.com/battleground/invite/${inviteCode}`;
                                openWhatsAppShare(text);
                            }}>📱 WhatsApp</Button>
                        </div>
                    </Card>
                )}

                {/* Participant List */}
                <Card className="bg-participants-card">
                    <h3 className="mb-4">👥 {participants.length} Participants Joined</h3>
                    <div className="flex flex-col gap-2">
                        {participants.map((p, i) => (
                            <div key={i} className="bg-participant-row">
                                <div className={`bg-participant-avatar ${p.isMe ? 'bg-participant-avatar--me' : 'bg-participant-avatar--other'}`}>
                                    {p.name?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-semibold text-sm">{p.name} {p.isMe && '(You)'}</div>
                                    <div className="text-xs text-muted">Level {p.level}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Start Button (creator only) */}
                {battle?.creatorId === user?.id && (
                    <Button variant="primary" size="lg" onClick={handleStart} className="bg-start-btn">
                        🚀 Start Battle for Everyone ({participants.length} players)
                    </Button>
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
                <div className="bg-test-header">
                    <div className="font-bold">⚔️ Battleground</div>
                    <div className={`bg-test-timer ${timeLeft < 60 ? 'bg-test-timer--warning' : 'bg-test-timer--normal'}`}>
                        ⏱️ {formatTime(timeLeft)}
                    </div>
                    <div className="text-sm text-muted">Q {currentQ + 1} / {questions.length}</div>
                </div>

                <div className="page bg-test-wrapper">
                    {/* Progress */}
                    <div className="progress-bar bg-test-progress">
                        <div className="progress-fill" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}></div>
                    </div>

                    {/* Question */}
                    <Card className="mb-4">
                        <div className="flex items-center justify-between mb-3">
                            <span className="question-number">Question {currentQ + 1}</span>
                            {q.difficulty && <Badge variant="neutral" className={`difficulty-badge ${q.difficulty}`}>{q.difficulty}</Badge>}
                        </div>
                        <p className="bg-test-q-text">{q.text}</p>
                    </Card>

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
                    <div className="bg-test-nav">
                        {currentQ > 0 && <Button variant="secondary" onClick={() => setCurrentQ(currentQ - 1)}>← Previous</Button>}
                        {currentQ < questions.length - 1 ? (
                            <Button variant="primary" onClick={() => setCurrentQ(currentQ + 1)} className="bg-test-next-btn">Next →</Button>
                        ) : (
                            <Button variant="success" onClick={handleSubmit} disabled={submitting} className="bg-test-submit-btn">
                                {submitting ? '⏳ Submitting...' : '✅ Submit & See Results'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ===== RESULTS VIEW =====
    if (view === 'results') return (
        <div>
            
            <div className="page bg-results-wrapper">
                <div className="bg-results-icon">🏆</div>
                <h1 className="bg-results-title">Battle Results</h1>
                <p className="text-muted bg-results-meta">
                    {battle?.questionCount} Questions • {participants.length} Participants
                </p>

                {/* Leaderboard */}
                <Card className="bg-leaderboard-card">
                    <h3 className="mb-4">🏅 Final Leaderboard</h3>
                    <div className="flex flex-col gap-3">
                        {participants.map((p, i) => {
                            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
                            return (
                                <div key={i} className={`bg-leaderboard-row ${p.isMe ? 'bg-leaderboard-row--me' : 'bg-leaderboard-row--other'}`}>
                                    <div className={`bg-leaderboard-rank ${i < 3 ? 'bg-leaderboard-rank--top' : 'bg-leaderboard-rank--normal'}`}>{medal}</div>
                                    <div style={{ flex: 1 }}>
                                        <div className="font-bold">{p.name} {p.isMe && <span className="bg-leaderboard-me-badge">(You)</span>}</div>
                                        <div className="text-xs text-muted">✅ {p.correct} correct • ❌ {p.incorrect} wrong • ⏱️ {formatTime(p.timeSpent || 0)}</div>
                                    </div>
                                    <div className={`bg-leaderboard-score ${i === 0 ? 'bg-leaderboard-score--first' : 'bg-leaderboard-score--normal'}`}>
                                        {p.score}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                <div className="bg-results-actions">
                    <Button variant="primary" onClick={() => { setView('home'); setBattleId(null); setInviteCode(''); setAnswers({}); setCurrentQ(0); }}>🏟️ New Battleground</Button>
                    <Link href="/dashboard"><Button variant="secondary">🏠 Dashboard</Button></Link>
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
