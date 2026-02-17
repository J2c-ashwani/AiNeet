'use client';
import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';

export default function TestPage({ params }) {
    const { id: testId } = use(params);
    const router = useRouter();
    const [testData, setTestData] = useState(null);
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState({});
    const [marked, setMarked] = useState(new Set());
    const [timeLeft, setTimeLeft] = useState(0);
    const [startTime] = useState(Date.now());
    const [questionTimes, setQuestionTimes] = useState({});
    const [lastQTime, setLastQTime] = useState(Date.now());
    const [submitting, setSubmitting] = useState(false);
    const [showNav, setShowNav] = useState(false);
    const [initialReportState, setReportState] = useState({ show: false, reason: 'error', comment: '' });

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

    useEffect(() => {
        const stored = sessionStorage.getItem('currentTest');
        if (stored) {
            const data = JSON.parse(stored);
            if (data.testId === testId) {
                setTestData(data);
                setTimeLeft(data.timeLimit);
                return;
            }
        }
        router.push('/test/configure');
    }, [testId, router]);

    // Timer
    useEffect(() => {
        if (!testData || timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) { handleSubmit(); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [testData]);

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

    const handleSubmit = async () => {
        if (submitting) return;

        setSubmitting(true);
        trackTime();

        const answerPayload = testData.questions.map((q, idx) => ({
            questionId: q.id,
            selectedOption: answers[idx] || null,
            timeSpent: questionTimes[idx] || 0
        }));

        try {
            const res = await fetch('/api/tests/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    testId,
                    answers: answerPayload,
                    timeTaken: Math.round((Date.now() - startTime) / 1000)
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            sessionStorage.setItem('testResults', JSON.stringify(data));
            sessionStorage.removeItem('currentTest');
            router.push(`/test/${testId}/results`);
        } catch (err) {
            alert('Failed to submit: ' + err.message);
            setSubmitting(false);
        }
    };


    if (!testData) return (
        <div className="loading-overlay" style={{ minHeight: '100vh' }}>
            <div className="spinner" style={{ width: 40, height: 40 }}></div>
        </div>
    );

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
            {/* Test Header */}
            <div className="test-header" style={{ margin: 0 }}>
                <div className="flex items-center gap-4">
                    <span className="question-number">Q {currentQ + 1}/{testData.totalQuestions}</span>
                    <span className="text-sm text-muted">{answeredCount} answered</span>
                </div>
                <div className={`timer ${timeLeft > 300 ? 'safe' : ''}`}>
                    ⏱️ {formatTime(timeLeft)}
                </div>
                <div className="flex gap-2">
                    <button className="btn btn-ghost btn-sm" onClick={() => setShowNav(!showNav)}>
                        📋 Navigator
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={handleSubmit} disabled={submitting}>
                        {submitting ? 'Submitting...' : 'Submit Test'}
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
                {/* Main Question Area */}
                <div style={{ flex: 1, paddingRight: showNav ? 24 : 0 }}>
                    <div className="card animate-fade-in" key={currentQ}>
                        {/* Question */}
                        <div className="question-text">
                            {(question.year_asked || question.exam_name) && (
                                <span style={{
                                    display: 'inline-block', padding: '2px 8px', borderRadius: '12px',
                                    background: 'var(--accent)', color: 'white', fontSize: '0.75rem',
                                    fontWeight: 'bold', marginRight: '8px', verticalAlign: 'middle'
                                }}>
                                    {question.exam_name ? `${question.exam_name} ${question.year_asked}` : `NEET ${question.year_asked}`}
                                </span>
                            )}
                            {question.text}
                        </div>

                        {/* Options */}
                        <div className="flex flex-col gap-3">
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
                                    <span style={{ flex: 1 }}>{opt.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between mt-4">
                        <div className="flex gap-2">
                            <button className="btn btn-secondary" onClick={() => goToQuestion(Math.max(0, currentQ - 1))} disabled={currentQ === 0}>
                                ← Previous
                            </button>
                            <button className={`btn ${marked.has(currentQ) ? 'btn-primary' : 'btn-ghost'}`} onClick={handleMark}>
                                {marked.has(currentQ) ? '🔖 Marked' : '🔖 Mark'}
                            </button>
                            <button className="btn btn-ghost" title="Report Issue" onClick={() => setReportState({ ...initialReportState, show: true })}>
                                🚩
                            </button>
                        </div>
                        <div className="flex gap-2">
                            {answers[currentQ] && (
                                <button className="btn btn-ghost btn-sm" onClick={() => handleAnswer(answers[currentQ])}>Clear</button>
                            )}
                            {currentQ < testData.totalQuestions - 1 ? (
                                <button className="btn btn-primary" onClick={() => goToQuestion(currentQ + 1)}>
                                    Next →
                                </button>
                            ) : (
                                <button className="btn btn-success" onClick={handleSubmit} disabled={submitting}>
                                    Submit Test ✓
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Question Navigator Panel */}
                {showNav && (
                    <div className="card animate-slide-in" style={{ width: 280, flexShrink: 0, alignSelf: 'flex-start', position: 'sticky', top: 140 }}>
                        <h4 className="mb-4">Question Navigator</h4>
                        <div className="question-nav">
                            {testData.questions.map((_, idx) => (
                                <button key={idx}
                                    className={`question-nav-btn ${idx === currentQ ? 'current' : ''} ${answers[idx] ? 'answered' : ''} ${marked.has(idx) ? 'marked' : ''}`}
                                    onClick={() => goToQuestion(idx)}>
                                    {idx + 1}
                                </button>
                            ))}
                        </div>
                        <div className="mt-4 flex flex-col gap-2 text-xs">
                            <div className="flex items-center gap-2">
                                <span className="question-nav-btn current" style={{ width: 16, height: 16, fontSize: '0.5rem', minWidth: 16 }}></span> Current
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="question-nav-btn answered" style={{ width: 16, height: 16, fontSize: '0.5rem', minWidth: 16 }}></span> Answered
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="question-nav-btn marked" style={{ width: 16, height: 16, fontSize: '0.5rem', minWidth: 16 }}></span> Marked
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="question-nav-btn" style={{ width: 16, height: 16, fontSize: '0.5rem', minWidth: 16 }}></span> Not visited
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Report Modal */}
            {initialReportState.show && (
                <div className="modal-overlay">
                    <div className="modal-content animate-scale-in">
                        <h3>Report Issue with Q{currentQ + 1}</h3>
                        <p className="mb-4 text-sm text-muted">Help us improve question quality.</p>

                        <div className="flex flex-col gap-3 mb-4">
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

                        <div className="flex justify-end gap-2">
                            <button className="btn btn-ghost" onClick={() => setReportState({ show: false, reason: 'error', comment: '' })}>Cancel</button>
                            <button className="btn btn-danger" onClick={submitReport}>Submit Report</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
