'use client';
import { useState, useEffect, useCallback, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import MathRenderer from '@/components/MathRenderer';
import { OfflineStorage, TestSessionStore } from '@/lib/idb';
import { STORAGE_KEYS } from '@/lib/storage-resilient';
import { Card, Button, Badge } from '@/components/ui';
import { AutosaveIndicator } from '@/components/ui/TrustBadge';

/**
 * P0-1 Trust Hardening: Test Page with Durable State Persistence
 * 
 * Architecture:
 *   IndexedDB = canonical source of truth (full test session)
 *   localStorage = fast recovery signal only (activeTestId flag)
 *   sessionStorage = initial test data handoff from configure page
 *   Server = timer truth (started_at timestamp)
 * 
 * Persistence triggers:
 *   - Every answer change
 *   - Every navigation
 *   - Every mark toggle
 *   - Every 10 seconds (heartbeat)
 *   - On visibilitychange (tab switch/minimize)
 *   - On beforeunload (tab close/refresh)
 * 
 * Recovery flow:
 *   On mount → check IDB for session → show Resume/Discard prompt → restore
 */

export default function TestPage({ params }) {
    const { id: testId } = use(params);
    const router = useRouter();

    // ─── Core State ───
    const [testData, setTestData] = useState(null);
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState({});
    const [marked, setMarked] = useState(new Set());
    const [timeLeft, setTimeLeft] = useState(0);
    const [questionTimes, setQuestionTimes] = useState({});
    const [lastQTime, setLastQTime] = useState(Date.now());
    const [submitting, setSubmitting] = useState(false);
    const [offlineSyncPending, setOfflineSyncPending] = useState(false);
    const [showNav, setShowNav] = useState(false);
    const [initialReportState, setReportState] = useState({ show: false, reason: 'error', comment: '' });

    // ─── P0-1: Recovery State ───
    const [recoveryState, setRecoveryState] = useState('checking'); // checking | prompt | none
    const [startedAt, setStartedAt] = useState(null);
    const saveInFlightRef = useRef(false);

    // ─── P0-1: Persist full session to IDB ───
    const persistSession = useCallback(async () => {
        if (!testData || saveInFlightRef.current) return;
        saveInFlightRef.current = true;
        try {
            await TestSessionStore.saveSession(testId, {
                testData,
                answers,
                currentQ,
                marked: Array.from(marked),
                questionTimes,
                startedAt,
                timeLeft,
                offlineSyncPending
            });
        } catch (e) {
            console.error('[P0-1] Session persist failed:', e);
        } finally {
            saveInFlightRef.current = false;
        }
    }, [testId, testData, answers, currentQ, marked, questionTimes, startedAt, timeLeft, offlineSyncPending]);

    // ─── P0-1: Mount — Check IDB for recoverable session ───
    useEffect(() => {
        let cancelled = false;

        async function checkRecovery() {
            // 1. Check IDB for existing session for this testId
            const existingSession = await TestSessionStore.loadSession(testId);

            if (existingSession && existingSession.testData && !cancelled) {
                // Recoverable session found — show prompt
                setRecoveryState('prompt');
                // Store recovery data for use when user clicks Resume
                window.__pendingRecovery = existingSession;
                return;
            }

            // 2. No IDB session — try sessionStorage (fresh test from configure page)
            const stored = sessionStorage.getItem('currentTest');
            if (stored && !cancelled) {
                try {
                    const data = JSON.parse(stored);
                    if (data.testId === testId) {
                        const now = Date.now();
                        setTestData(data);
                        setTimeLeft(data.timeLimit);
                        setStartedAt(now);
                        setRecoveryState('none');

                        // Check for partial answer draft in old IDB format
                        const draft = await OfflineStorage.getItem(`draft_${testId}`);
                        if (draft) {
                            setAnswers(draft.answers || {});
                            setOfflineSyncPending(draft.pendingSubmit || false);
                        }

                        // Persist initial session to IDB immediately
                        await TestSessionStore.saveSession(testId, {
                            testData: data,
                            answers: draft?.answers || {},
                            currentQ: 0,
                            marked: [],
                            questionTimes: {},
                            startedAt: now,
                            timeLeft: data.timeLimit,
                            offlineSyncPending: draft?.pendingSubmit || false
                        });
                        return;
                    }
                } catch (e) {
                    console.error('[P0-1] sessionStorage parse failed:', e);
                }
            }

            // 3. Nothing found — redirect to configure
            if (!cancelled) {
                window.location.href = '/test/configure';
            }
        }

        checkRecovery();
        return () => { cancelled = true; };
    }, [testId, router]);

    // ─── P0-1: Resume handler ───
    const handleResume = useCallback(() => {
        const session = window.__pendingRecovery;
        if (!session) return;

        setTestData(session.testData);
        setAnswers(session.answers || {});
        setCurrentQ(session.currentQ || 0);
        setMarked(new Set(session.marked || []));
        setQuestionTimes(session.questionTimes || {});
        setOfflineSyncPending(session.offlineSyncPending || false);
        setStartedAt(session.startedAt);

        // P0-1: Server-truth timer — compute remaining from startedAt
        const elapsed = Math.floor((Date.now() - session.startedAt) / 1000);
        const totalDuration = session.testData.timeLimit;
        const remaining = Math.max(0, totalDuration - elapsed);

        if (remaining <= 0) {
            // Time expired while away — auto-submit
            setTimeLeft(0);
            setRecoveryState('none');
            // Trigger submit after render
            setTimeout(() => handleSubmitDirect(session), 100);
            return;
        }

        setTimeLeft(remaining);
        setRecoveryState('none');
        delete window.__pendingRecovery;
    }, []);

    // ─── P0-1: Discard handler ───
    const handleDiscard = useCallback(async () => {
        await TestSessionStore.clearSession(testId);
        await OfflineStorage.removeItem(`draft_${testId}`);
        sessionStorage.removeItem('currentTest');
        delete window.__pendingRecovery;
        window.location.href = '/test/configure';
    }, [testId, router]);

    // ─── P0-1: Persist on every state mutation ───
    useEffect(() => {
        if (!testData || recoveryState !== 'none') return;
        persistSession();
    }, [answers, currentQ, marked, questionTimes, testData, recoveryState, persistSession]);

    // ─── P0-1: Heartbeat (every 10 seconds) ───
    useEffect(() => {
        if (!testData || recoveryState !== 'none') return;
        const interval = setInterval(() => persistSession(), 10000);
        return () => clearInterval(interval);
    }, [testData, recoveryState, persistSession]);

    // ─── P0-1: visibilitychange + beforeunload ───
    useEffect(() => {
        if (!testData || recoveryState !== 'none') return;

        const handleVisibility = () => {
            if (document.visibilityState === 'hidden') persistSession();
        };
        const handleUnload = () => {
            // Synchronous signal for localStorage (IDB may not complete)
            try {
                localStorage.setItem(STORAGE_KEYS.ACTIVE_TEST, JSON.stringify({
                    activeTestId: testId,
                    lastUpdatedAt: Date.now(),
                    resumeAvailable: true
                }));
            } catch (e) { /* non-fatal */ }
        };

        document.addEventListener('visibilitychange', handleVisibility);
        window.addEventListener('beforeunload', handleUnload);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibility);
            window.removeEventListener('beforeunload', handleUnload);
        };
    }, [testData, recoveryState, testId, persistSession]);

    // ─── Legacy IDB backup for offline submit ───
    useEffect(() => {
        if (!testData || Object.keys(answers).length === 0) return;
        OfflineStorage.setItem(`draft_${testId}`, { answers, pendingSubmit: offlineSyncPending });
    }, [answers, testData, testId, offlineSyncPending]);

    // ─── Timer ───
    useEffect(() => {
        if (!testData || timeLeft <= 0 || offlineSyncPending || recoveryState !== 'none') return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) { handleSubmit(); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [testData, offlineSyncPending, recoveryState]);

    const submitReport = async () => {
        if (!testData) return;
        try {
            const res = await fetch('/api/questions/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    questionId: testData.questions[currentQ].id,
                    reason: initialReportState.reason,
                    comment: initialReportState.comment
                })
            });
            if (res.ok) {
                alert('Report submitted. Thank you for your feedback!');
                setReportState({ show: false, reason: 'error', comment: '' });
            } else {
                alert('Failed to submit report.');
            }
        } catch (e) {
            console.error(e);
            alert('Error submitting report.');
        }
    };

    const trackTime = useCallback(() => {
        const now = Date.now();
        const elapsed = Math.round((now - lastQTime) / 1000);
        setQuestionTimes(prev => ({
            ...prev,
            [currentQ]: (prev[currentQ] || 0) + elapsed
        }));
        setLastQTime(now);
    }, [currentQ, lastQTime]);

    const handleAnswer = (option) => {
        setAnswers(prev => ({
            ...prev,
            [currentQ]: prev[currentQ] === option ? null : option
        }));
    };

    const handleMark = () => {
        setMarked(prev => {
            const next = new Set(prev);
            if (next.has(currentQ)) next.delete(currentQ);
            else next.add(currentQ);
            return next;
        });
    };

    const goToQuestion = (idx) => {
        trackTime();
        setCurrentQ(idx);
        setShowNav(false);
    };

    // Direct submit with explicit session data (for auto-submit on resume with expired timer)
    const handleSubmitDirect = async (session) => {
        if (submitting) return;
        setSubmitting(true);

        const td = session?.testData || testData;
        const ans = session?.answers || answers;
        const qt = session?.questionTimes || questionTimes;

        const answerPayload = td.questions.map((q, idx) => ({
            questionId: q.id,
            selectedOption: ans[idx] || null,
            timeSpent: qt[idx] || 0
        }));

        const sa = session?.startedAt || startedAt || Date.now();
        const payload = {
            testId,
            answers: answerPayload,
            timeTaken: Math.round((Date.now() - sa) / 1000),
            idempotencyKey: crypto.randomUUID()
        };

        try {
            const res = await fetch('/api/tests/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (res.status === 400 && data.error === 'Test already submitted') {
                await TestSessionStore.clearSession(testId);
                await OfflineStorage.removeItem(`draft_${testId}`);
                sessionStorage.removeItem('currentTest');
                window.location.href = `/test/${testId}/results`;
                return;
            }

            if (!res.ok) throw new Error(data.error || 'Network Drop');

            sessionStorage.setItem('testResults', JSON.stringify(data));
            sessionStorage.removeItem('currentTest');
            await TestSessionStore.clearSession(testId);
            await OfflineStorage.removeItem(`draft_${testId}`);
            window.location.href = `/test/${testId}/results`;
        } catch (err) {
            console.error('Submission Failed:', err);
            setOfflineSyncPending(true);
            await OfflineStorage.setItem(`draft_${testId}`, { answers: ans, pendingSubmit: true, payload });
            setSubmitting(false);
        }
    };

    const handleSubmit = async () => {
        if (submitting) return;
        trackTime();
        await handleSubmitDirect(null);
    };

    // ─── P0-1: Recovery Prompt UI ───
    if (recoveryState === 'prompt') {
        return (
            <div className="page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                <Card className="animate-fade-in" style={{ maxWidth: 480, width: '100%', textAlign: 'center', padding: '40px 32px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 16 }}>📝</div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 12, color: 'var(--text-primary)' }}>
                        Resume your test?
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.6 }}>
                        You have an unfinished test. Your answers and progress have been saved.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <Button variant="primary" size="lg" onClick={handleResume} style={{ minWidth: 160 }}>
                            Resume Test →
                        </Button>
                        <Button variant="ghost" size="lg" onClick={handleDiscard} style={{ minWidth: 120 }}>
                            Discard
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    // ─── Checking / Loading ───
    if (recoveryState === 'checking' || !testData) {
        return (
            <div className="loading-overlay" style={{ minHeight: '100vh' }}>
                <div className="spinner" style={{ width: 40, height: 40 }}></div>
            </div>
        );
    }

    const question = testData.questions[currentQ];
    const formatTime = (s) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${m}:${String(sec).padStart(2, '0')}`;
    };

    const answeredCount = Object.values(answers).filter(a => a).length;

    return (
        <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
            {/* Network Fallback Recovery Banner */}
            {offlineSyncPending && (
                <div style={{ background: 'var(--danger)', color: 'white', padding: '12px 24px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 50, position: 'relative', boxShadow: 'var(--shadow-xl)' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>⚠️ Connection dropped. Your test is paused and safely saved offline.</p>
                    <Button onClick={handleSubmit} disabled={submitting} variant="secondary" size="sm">
                        {submitting ? 'Syncing...' : 'Retry Submission Sync'}
                    </Button>
                </div>
            )}

            {/* Test Header */}
            <div className="test-header" style={{ margin: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span className="question-number">Q {currentQ + 1}/{testData.totalQuestions}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{answeredCount} answered</span>
                    <div className="hidden md:block">
                        <AutosaveIndicator lastSavedAt={testData ? Date.now() : null} />
                    </div>
                </div>
                <div className={`timer ${timeLeft > 300 ? 'safe' : ''}`}>
                    ⏱️ {formatTime(timeLeft)}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button variant="ghost" size="sm" onClick={() => setShowNav(!showNav)}>
                        📋 Navigator
                    </Button>
                    <Button variant="danger" size="sm" onClick={handleSubmit} disabled={submitting} className="critical-flow">
                        {submitting ? 'Submitting...' : 'Submit Test'}
                    </Button>
                </div>
            </div>

            <div style={{ display: 'flex', maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
                {/* Main Question Area */}
                <div style={{ flex: 1, paddingRight: showNav ? 24 : 0 }}>
                    <Card className="animate-fade-in" key={currentQ}>
                        {/* Question */}
                        <div className="question-text">
                            {question.is_ai_generated === 1 && (
                                <Badge variant="primary" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                                    ⚡ AI Generated
                                </Badge>
                            )}
                            {(question.year_asked || question.exam_name) && (
                                <Badge variant="accent" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                                    {question.exam_name ? `${question.exam_name} ${question.year_asked}` : `NEET ${question.year_asked}`}
                                </Badge>
                            )}
                            <MathRenderer>{question.text}</MathRenderer>
                        </div>

                        {/* Options */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { key: 'A', text: question.option_a },
                                { key: 'B', text: question.option_b },
                                { key: 'C', text: question.option_c },
                                { key: 'D', text: question.option_d },
                            ].map(opt => (
                                <div key={opt.key}
                                    className={`option-card ${answers[currentQ] === opt.key ? 'selected' : ''}`}
                                    onClick={() => handleAnswer(opt.key)}>
                                    <span className="option-label">{opt.key}</span>
                                    <span style={{ flex: 1 }}><MathRenderer>{opt.text}</MathRenderer></span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Navigation Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Button variant="secondary" onClick={() => goToQuestion(Math.max(0, currentQ - 1))} disabled={currentQ === 0}>
                                ← Previous
                            </Button>
                            <Button variant={marked.has(currentQ) ? 'primary' : 'ghost'} onClick={handleMark}>
                                {marked.has(currentQ) ? '🔖 Marked' : '🔖 Mark'}
                            </Button>
                            <Button variant="ghost" title="Report Issue" onClick={() => setReportState({ ...initialReportState, show: true })}>
                                🚩
                            </Button>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {answers[currentQ] && (
                                <Button variant="ghost" size="sm" onClick={() => handleAnswer(answers[currentQ])}>Clear</Button>
                            )}
                            {currentQ < testData.totalQuestions - 1 ? (
                                <Button variant="primary" onClick={() => goToQuestion(currentQ + 1)}>
                                    Next →
                                </Button>
                            ) : (
                                <Button variant="success" onClick={handleSubmit} disabled={submitting} className="critical-flow">
                                    Submit Test ✓
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Question Navigator Panel */}
                {showNav && (
                    <Card className="animate-slide-in" style={{ width: 280, flexShrink: 0, alignSelf: 'flex-start', position: 'sticky', top: 140 }}>
                        <h4 style={{ marginBottom: '16px', color: 'var(--text-primary)', fontWeight: 800 }}>Question Navigator</h4>
                        <div className="question-nav">
                            {testData.questions.map((_, idx) => (
                                <button key={idx}
                                    className={`question-nav-btn ${idx === currentQ ? 'current' : ''} ${answers[idx] ? 'answered' : ''} ${marked.has(idx) ? 'marked' : ''}`}
                                    onClick={() => goToQuestion(idx)}>
                                    {idx + 1}
                                </button>
                            ))}
                        </div>
                        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="question-nav-btn current" style={{ width: 16, height: 16, fontSize: '0.5rem', minWidth: 16 }}></span> Current
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="question-nav-btn answered" style={{ width: 16, height: 16, fontSize: '0.5rem', minWidth: 16 }}></span> Answered
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="question-nav-btn marked" style={{ width: 16, height: 16, fontSize: '0.5rem', minWidth: 16 }}></span> Marked
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="question-nav-btn" style={{ width: 16, height: 16, fontSize: '0.5rem', minWidth: 16 }}></span> Not visited
                            </div>
                        </div>
                    </Card>
                )}
            </div>

            {/* Report Modal */}
            {initialReportState.show && (
                <div className="modal-overlay">
                    <Card className="modal-content animate-scale-in">
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Report Issue with Q{currentQ + 1}</h3>
                        <p style={{ marginBottom: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Help us improve question quality.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                            <select className="input-field" value={initialReportState.reason} onChange={(e) => setReportState({ ...initialReportState, reason: e.target.value })}>
                                <option value="error">Factual Error</option>
                                <option value="ambiguous">Ambiguous / Confusing</option>
                                <option value="syllabus">Out of Syllabus</option>
                                <option value="other">Other</option>
                            </select>
                            <textarea
                                className="input-field"
                                placeholder="Describe the issue..."
                                rows={3}
                                value={initialReportState.comment}
                                onChange={(e) => setReportState({ ...initialReportState, comment: e.target.value })}
                            ></textarea>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <Button variant="ghost" onClick={() => setReportState({ show: false, reason: 'error', comment: '' })}>Cancel</Button>
                            <Button variant="danger" onClick={submitReport}>Submit Report</Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
