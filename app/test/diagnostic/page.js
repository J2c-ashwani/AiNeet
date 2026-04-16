'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function DiagnosticComponent() {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [answers, setAnswers] = useState({});
    const [currentIndex, setCurrentIndex] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // Challenger Variables (Catch c_ghost)
    const challengerScore = searchParams.get('c_score');
    const challengerChap = searchParams.get('c_chap');
    const challengerGhost = searchParams.get('c_ghost');

    useEffect(() => {
        // Fast, cheap device fingerprint for Level-2 Rate Limiting
        const generateFingerprint = () => {
            let fp = localStorage.getItem('diag_fp');
            if (fp) return fp;
            fp = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            localStorage.setItem('diag_fp', fp);
            return fp;
        };

        const fetchTest = async () => {
            try {
                const res = await fetch('/api/tests/diagnostic/generate', {
                    method: 'POST',
                    headers: {
                        'x-device-print': generateFingerprint()
                    }
                });
                
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Failed to initialize system.');
                
                setQuestions(data.questions);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTest();
    }, []);

    const handleAnswerSelect = (opt) => {
        setAnswers(prev => ({ ...prev, [questions[currentIndex].id]: opt }));
        // Auto-advance for frictionless UX
        if (currentIndex < questions.length - 1) {
            setTimeout(() => setCurrentIndex(c => c + 1), 300);
        }
    };

    const handleDiagnosticSubmit = async () => {
        if (Object.keys(answers).length === 0) return;
        setSubmitting(true);
        try {
            // Send exactly what the user picked to the Silent Tracker + Challenger Context
            const payloadData = { 
                answers,
                c_score: challengerScore,
                c_chap: challengerChap,
                c_ghost: challengerGhost
            };

            const verifyRes = await fetch('/api/tests/diagnostic/grade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payloadData)
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
                // MD Directive: Push to LocalStorage to survive accidental browser closure!
                localStorage.setItem('pending_diagnostic_grade', JSON.stringify({
                    scoreData: verifyData.grade,
                    signature: verifyData.signature
                }));
                // Proceed to the Lock Screen
                router.push('/test/diagnostic/results');
            } else {
                throw new Error(verifyData.error || "Grading failed");
            }
        } catch (err) {
            alert('Failed to process answers: ' + err.message);
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#080c18', color: '#fff' }}>
            <div className="spinner" style={{ width: 50, height: 50, marginBottom: 20 }}></div>
            <h2 style={{ fontFamily: 'Inter', fontWeight: 600 }}>Analyzing Brain Pathways...</h2>
            <p style={{ color: '#94a3b8' }}>Generating your custom diagnostic panel</p>
        </div>
    );

    if (error) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080c18', color: '#fff' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: 40, borderRadius: 16, textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <h2>System Overloaded</h2>
                <p>{error}</p>
                <button onClick={() => window.location.reload()} style={{ marginTop: 20, padding: '10px 24px', background: '#3b82f6', color: 'white', borderRadius: 8, border: 'none', cursor: 'pointer' }}>Retry Generation</button>
            </div>
        </div>
    );

    if (questions.length === 0) return null;

    const currentQ = questions[currentIndex];
    const isLast = currentIndex === questions.length - 1;

    return (
        <div style={{ minHeight: '100vh', background: '#080c18', color: '#fff', padding: '40px 20px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ maxWidth: 800, width: '100%' }}>
                
                {/* Frictionless Header dynamically reacting to Challenger URI bounds */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 20 }}>
                    <div>
                        <span style={{ color: '#818cf8', fontWeight: 700, letterSpacing: 1, fontSize: '0.85rem' }}>
                            {challengerScore ? 'CHALLENGE ACCEPTED' : 'AI DIAGNOSTIC PROTOCOL'}
                        </span>
                        <h1 style={{ margin: 0, fontSize: '1.5rem', marginTop: 4 }}>
                            {challengerScore ? `Your friend scored ${challengerScore}% in ${challengerChap || 'Biology'}. Try to beat it.` : 'Find Your Weakest Chapter'}
                        </h1>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: 20, fontSize: '0.9rem', fontWeight: 600 }}>
                        {currentIndex + 1} <span style={{ color: '#64748b' }}>/ {questions.length}</span>
                    </div>
                </div>

                {/* Question Card */}
                <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 32 }}>
                    
                    {currentQ.is_ai_generated === 1 && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(168, 85, 247, 0.1)', color: '#c084fc', padding: '4px 12px', borderRadius: 12, fontSize: '0.8rem', fontWeight: 600, marginBottom: 16 }}>
                            ✨ AI Generated Target
                        </div>
                    )}
                    
                    <h2 style={{ fontSize: '1.3rem', lineHeight: 1.6, marginBottom: 32, fontWeight: 500 }}>{currentQ.text}</h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {['A', 'B', 'C', 'D'].map((optKey) => {
                            const optValue = currentQ[`option_${optKey.toLowerCase()}`];
                            const isSelected = answers[currentQ.id] === optKey;
                            
                            return (
                                <button
                                    key={optKey}
                                    onClick={() => handleAnswerSelect(optKey)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px',
                                        background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                                        border: `1px solid ${isSelected ? '#3b82f6' : 'rgba(255,255,255,0.05)'}`,
                                        borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s ease',
                                        color: '#f8fafc', fontSize: '1.05rem', textAlign: 'left', outline: 'none'
                                    }}
                                >
                                    <div style={{ 
                                        width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: isSelected ? '#3b82f6' : 'rgba(255,255,255,0.1)', 
                                        borderRadius: '50%', fontSize: '0.9rem', fontWeight: 600 
                                    }}>
                                        {optKey}
                                    </div>
                                    <div style={{ flex: 1 }}>{optValue}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32 }}>
                    <button 
                        onClick={() => setCurrentIndex(c => Math.max(0, c - 1))}
                        disabled={currentIndex === 0}
                        style={{ padding: '12px 24px', background: 'transparent', color: '#94a3b8', border: 'none', cursor: currentIndex === 0 ? 'not-allowed' : 'pointer', fontSize: '1rem' }}
                    >
                        ← Back
                    </button>

                    {isLast ? (
                        <button 
                            onClick={handleDiagnosticSubmit}
                            disabled={submitting || !answers[currentQ.id]}
                            style={{ padding: '14px 32px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, opacity: submitting ? 0.7 : 1 }}
                        >
                            {submitting ? 'Analyzing...' : 'Generate Diagnosis →'}
                        </button>
                    ) : (
                        <button 
                            onClick={() => setCurrentIndex(c => c + 1)}
                            disabled={!answers[currentQ.id]}
                            style={{ padding: '14px 32px', background: answers[currentQ.id] ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.02)', color: answers[currentQ.id] ? 'white' : '#475569', borderRadius: 12, border: 'none', cursor: answers[currentQ.id] ? 'pointer' : 'not-allowed', fontSize: '1.1rem', fontWeight: 600 }}
                        >
                            Next →
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}

export default function DiagnosticTestEngine() {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', background: '#080c18' }}></div>}>
            <DiagnosticComponent />
        </Suspense>
    );
}
