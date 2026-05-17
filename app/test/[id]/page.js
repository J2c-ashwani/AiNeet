'use client';
import { Icon } from '@/components/ui/Icon';
import { useState, useEffect, useCallback, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import MathRenderer from '@/components/MathRenderer';
import { OfflineStorage, TestSessionStore } from '@/lib/idb';
import { useMutation } from '@tanstack/react-query';
import { Card, Button, Badge, Select, Textarea } from '@/components/ui';
import { AutosaveIndicator, TrustBadge } from '@/components/trust/TrustBadge';
import { RecoveryBanner } from '@/components/trust/RecoveryBanner';

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
        setShowRecoveryBanner(true);
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
            TestSessionStore.saveActiveSignal(testId);
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

    // ─── MD MANDATE: React Query for Transactional Flows ───
    const reportMutation = useMutation({
        mutationFn: async (reportData) => {
            const res = await fetch('/api/questions/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reportData)
            });
            if (!res.ok) throw new Error('Failed to submit report');
            return res.json().catch(() => ({}));
        },
        onSuccess: () => {
            alert('Report submitted. Thank you for your feedback!');
            setReportState({ show: false, reason: 'error', comment: '' });
        },
        onError: (e) => {
            console.error(e);
            alert('Error submitting report.');
        }
    });

    const submitReport = () => {
        if (!testData) return;
        reportMutation.mutate({
            questionId: testData.questions[currentQ].id,
            reason: initialReportState.reason,
            comment: initialReportState.comment
        });
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

    // ─── MD MANDATE: React Query for Test Submission & Retries ───
    const testSubmitMutation = useMutation({
        mutationFn: async (payload) => {
            const res = await fetch('/api/tests/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            
            if (res.status === 400 && data.error === 'Test already submitted') {
                return { alreadySubmitted: true };
            }
            if (!res.ok) throw new Error(data.error || 'Network Drop');
            return data;
        },
        retry: 2, // Auto-retry sensitive submissions before offline fallback
        onSuccess: async (data, variables) => {
            if (data.alreadySubmitted) {
                await TestSessionStore.clearSession(testId);
                await OfflineStorage.removeItem(`draft_${testId}`);
                sessionStorage.removeItem('currentTest');
                window.location.href = `/test/${testId}/results`;
                return;
            }

            sessionStorage.setItem('testResults', JSON.stringify(data));
            sessionStorage.removeItem('currentTest');
            await TestSessionStore.clearSession(testId);
            await OfflineStorage.removeItem(`draft_${testId}`);
            window.location.href = `/test/${testId}/results`;
        },
        onError: async (err, variables) => {
            console.error('Submission Failed:', err);
            setOfflineSyncPending(true);
            await OfflineStorage.setItem(`draft_${testId}`, { 
                answers: variables.rawAnswers, 
                pendingSubmit: true, 
                payload: variables 
            });
        }
    });

    // Direct submit with explicit session data (for auto-submit on resume with expired timer)
    const handleSubmitDirect = (session) => {
        if (testSubmitMutation.isPending) return;

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
            idempotencyKey: crypto.randomUUID(),
            rawAnswers: ans // pass raw for offline IDB draft
        };

        testSubmitMutation.mutate(payload);
    };

    const handleSubmit = () => {
        if (testSubmitMutation.isPending) return;
        trackTime();
        handleSubmitDirect(null);
    };

    // ─── P0-1: Recovery Prompt UI ───
    if (recoveryState === 'prompt') {
        return (
            <div className="page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                <Card className="animate-fade-in" style={{ maxWidth: 480, width: '100%', textAlign: 'center', padding: '40px 32px' }}>
                    <div style={{ marginBottom: 16 }}><Icon name="FileText" /></div>
                    <h2 style={{ fontWeight: 800, marginBottom: 12, }}>
                        Resume your test?
                    </h2>
                    <p style={{ marginBottom: 32, lineHeight: 1.6 }}>
                        You have an unfinished test. Your answers and progress have been saved.
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
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
        <div style={{ minHeight: '100vh' }}>
            <RecoveryBanner show={showRecoveryBanner} />
            
            {/* Network Fallback Recovery Banner */}
            {offlineSyncPending && (
                <div style={{ padding: '12px 24px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', boxShadow: 'var(--shadow-xl)' }}>
                    <p style={{ fontWeight: 600, margin: 0 }}><Icon name="AlertCircle" /> Connection dropped. Your test is paused and safely saved offline.</p>
                    <Button onClick={handleSubmit} disabled={testSubmitMutation.isPending} variant="secondary" size="sm">
                        {testSubmitMutation.isPending ? 'Syncing...' : 'Retry Submission Sync'}
                    </Button>
                </div>
            )}

            {/* Test Header */}
            <div className="test-header" style={{ margin: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span className="question-number">Q {currentQ + 1}/{testData.totalQuestions}</span>
                    <span >{answeredCount} answered</span>
                    <div className="hidden md:block">
                        <AutosaveIndicator lastSavedAt={testData ? Date.now() : null} />
                    </div>
                </div>
                <div className={`timer ${timeLeft > 300 ? 'safe' : ''}`}>
                    <Icon name="Clock" /> {formatTime(timeLeft)}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Button variant="ghost" size="sm" onClick={() => setShowNav(!showNav)}>
                        <Icon name="FileText" /> Navigator
                    </Button>
                    <Button variant="danger" size="sm" onClick={handleSubmit} disabled={testSubmitMutation.isPending} className="critical-flow">
                        {testSubmitMutation.isPending ? 'Submitting...' : 'Submit Test'}
                    </Button>
                </div>
            </div>

            <div style={{ display: 'flex', maxWidth: 1200, margin: '0 auto', padding: 24 }}>
                {/* Main Question Area */}
                <div style={{ flex: 1, paddingRight: showNav ? 24 : 0 }}>
                    <Card className="animate-fade-in" key={currentQ}>
                        {/* Question */}
                        <div className="question-text">
                            {question.is_ai_generated === 1 && (
                                <Badge variant="primary" style={{ marginRight: 8, verticalAlign: 'middle' }}>
                                    <Icon name="Zap" /> AI Generated
                                </Badge>
                            )}
                            {(question.year_asked || question.exam_name) && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginRight: 8, verticalAlign: 'middle' }}>
                                    <TrustBadge type="verified-pyq" />
                                    <Badge variant="accent">
                                        {question.exam_name ? `${question.exam_name} ${question.year_asked}` : `NEET ${question.year_asked}`}
                                    </Badge>
                                </span>
                            )}
                            <MathRenderer>{question.text}</MathRenderer>
                        </div>

                        {/* Options */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
                        <div style={{ display: 'flex', gap: 8 }}>
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
                        <div style={{ display: 'flex', gap: 8 }}>
                            {answers[currentQ] && (
                                <Button variant="ghost" size="sm" onClick={() => handleAnswer(answers[currentQ])}>Clear</Button>
                            )}
                            {currentQ < testData.totalQuestions - 1 ? (
                                <Button variant="primary" onClick={() => goToQuestion(currentQ + 1)}>
                                    Next →
                                </Button>
                            ) : (
                                <Button variant="success" onClick={handleSubmit} disabled={testSubmitMutation.isPending} className="critical-flow">
                                    Submit Test ✓
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Question Navigator Panel */}
                {showNav && (
                    <Card className="animate-slide-in" style={{ width: 280, flexShrink: 0, alignSelf: 'flex-start', position: 'sticky', top: 140 }}>
                        <h4 style={{ marginBottom: 16, fontWeight: 800 }}>Question Navigator</h4>
                        <div className="question-nav">
                            {testData.questions.map((_, idx) => (
                                <div key={idx} role="button"
                                    className={`question-nav-btn ${idx === currentQ ? 'current' : ''} ${answers[idx] ? 'answered' : ''} ${marked.has(idx) ? 'marked' : ''}`}
                                    onClick={() => goToQuestion(idx)}>
                                    {idx + 1}
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8, }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className="question-nav-btn current" style={{ width: 16, height: 16, minWidth: 16 }}></span> Current
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className="question-nav-btn answered" style={{ width: 16, height: 16, minWidth: 16 }}></span> Answered
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className="question-nav-btn marked" style={{ width: 16, height: 16, minWidth: 16 }}></span> Marked
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className="question-nav-btn" style={{ width: 16, height: 16, minWidth: 16 }}></span> Not visited
                            </div>
                        </div>
                    </Card>
                )}
            </div>

            {/* Report Modal */}
            {initialReportState.show && (
                <div className="modal-overlay">
                    <Card className="modal-content animate-scale-in">
                        <h3 style={{ fontWeight: 800, marginBottom: 8 }}>Report Issue with Q{currentQ + 1}</h3>
                        <p style={{ marginBottom: 16, }}>Help us improve question quality.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                            <Select value={initialReportState.reason} onChange={(e) => setReportState({ ...initialReportState, reason: e.target.value })}>
                                <option value="error">Factual Error</option>
                                <option value="ambiguous">Ambiguous / Confusing</option>
                                <option value="syllabus">Out of Syllabus</option>
                                <option value="other">Other</option>
                            </Select>
                            <Textarea
                                placeholder="Describe the issue..."
                                rows={3}
                                value={initialReportState.comment}
                                onChange={(e) => setReportState({ ...initialReportState, comment: e.target.value })}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <Button variant="ghost" onClick={() => setReportState({ show: false, reason: 'error', comment: '' })}>Cancel</Button>
                            <Button variant="danger" onClick={submitReport} loading={reportMutation.isPending}>Submit Report</Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
