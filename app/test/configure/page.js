'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function TestConfigPage() {
    const router = useRouter();
    const [syllabus, setSyllabus] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [selectedChapters, setSelectedChapters] = useState([]);
    const [difficulty, setDifficulty] = useState('all');
    const [questionCount, setQuestionCount] = useState(20);
    const [testType, setTestType] = useState('custom');
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);
    const [showLockModal, setShowLockModal] = useState(false);
    const [lockMessage, setLockMessage] = useState('');

    useEffect(() => {
        fetch('/api/auth/me').then(r => r.json()).then(data => {
            if (!data.user) router.push('/login');
            else setUser(data.user);
        });
        fetch('/api/syllabus').then(r => r.json()).then(data => {
            setSyllabus(data.subjects || []);
            setLoading(false);
        });
    }, [router]);

    const toggleSubject = (id) => {
        setSelectedSubjects(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const toggleChapter = (id) => {
        setSelectedChapters(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const handleGenerate = async () => {
        setGenerating(true);
        setError('');
        try {
            const endpoint = testType === 'adaptive' ? '/api/tests/adaptive' : (testType === 'pyq' ? '/api/tests/pyq' : '/api/tests/generate');
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subjects: selectedSubjects.length > 0 ? selectedSubjects : syllabus.map(s => s.id),
                    subjectId: testType === 'adaptive' ? selectedSubjects[0] : undefined,
                    chapters: selectedChapters.length > 0 ? selectedChapters : undefined,
                    difficulty: (testType !== 'pyq' && difficulty !== 'all') ? difficulty : undefined,
                    questionCount: testType === 'mock' ? 180 : questionCount,
                    type: testType
                })
            });
            const data = await res.json();

            if (!res.ok) {
                if (data.locked) {
                    setLockMessage(data.error);
                    setShowLockModal(true);
                    return;
                }
                throw new Error(data.error);
            }

            sessionStorage.setItem('currentTest', JSON.stringify(data));
            router.push(`/test/${data.testId}`);
        } catch (err) {
            setError(err.message);
        } finally { setGenerating(false); }
    };

    if (loading) return (
        <div className="loading-overlay" style={{ minHeight: '100vh' }}>
            <div className="spinner" style={{ width: 40, height: 40 }}></div>
        </div>
    );

    const filteredChapters = selectedSubjects.length > 0
        ? syllabus.filter(s => selectedSubjects.includes(s.id)).flatMap(s => s.chapters.map(c => ({ ...c, subjectName: s.name, color: s.color })))
        : syllabus.flatMap(s => s.chapters.map(c => ({ ...c, subjectName: s.name, color: s.color })));

    return (
        <div>
            <Navbar />

            <div className="page" style={{ maxWidth: 900 }}>
                <div className="page-header">
                    <h1 className="page-title">🎯 Generate AI Test</h1>
                    <p className="page-subtitle">Configure your test and start practicing</p>
                </div>

                {error && (
                    <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: 20 }}>
                        {error}
                    </div>
                )}

                {/* Test Type */}
                <div className="card mb-4">
                    <h3 className="mb-4">Test Type</h3>
                    <div className="flex gap-3 flex-wrap">
                        {[
                            { value: 'custom', label: 'Custom Test', icon: '🎯', desc: 'Choose your own settings' },
                            { value: 'adaptive', label: 'Adaptive Practice', icon: '🧠', desc: ' AI Adjusts Difficulty' },
                            { value: 'pyq', label: 'Past Papers', icon: '📜', desc: 'Real NEET Questions' },
                            { value: 'topic', label: 'Topic-wise', icon: '📌', desc: 'Focus on specific topics' },
                            { value: 'chapter', label: 'Chapter-wise', icon: '📖', desc: 'Complete chapter test' },
                            { value: 'mock', label: 'Full Mock', icon: '⏱️', desc: '180 Qs • 720 marks • 3 hrs' },
                        ].map(t => (
                            <div key={t.value} className={`option-card ${testType === t.value ? 'selected' : ''}`}
                                onClick={() => setTestType(t.value)} style={{ flex: '1 1 180px' }}>
                                <span style={{ fontSize: '1.5rem' }}>{t.icon}</span>
                                <div>
                                    <div className="font-semibold">{t.label}</div>
                                    <div className="text-xs text-muted">{t.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {testType !== 'mock' && (
                    <>
                        {/* Subject Selection */}
                        <div className="card mb-4">
                            <h3 className="mb-4">Select Subjects</h3>
                            <div className="flex gap-3 flex-wrap">
                                {syllabus.map(s => (
                                    <div key={s.id}
                                        className={`option-card ${selectedSubjects.includes(s.id) ? 'selected' : ''}`}
                                        onClick={() => toggleSubject(s.id)}
                                        style={{ flex: '1 1 150px', borderColor: selectedSubjects.includes(s.id) ? s.color : undefined }}>
                                        <span style={{ fontSize: '1.3rem' }}>{s.icon}</span>
                                        <div className="font-semibold">{s.name}</div>
                                    </div>
                                ))}
                            </div>
                            {selectedSubjects.length === 0 && (
                                <p className="text-muted text-sm mt-2">
                                    {testType === 'adaptive' ? 'Please select a subject to start adaptive practice' : 'No selection = all subjects included'}
                                </p>
                            )}
                        </div>

                        {/* Chapter Selection */}
                        <div className="card mb-4">
                            <h3 className="mb-4">Select Chapters <span className="text-muted text-sm font-normal">(optional)</span></h3>
                            <div className="chapter-grid">
                                {filteredChapters.map(c => (
                                    <div key={c.id}
                                        className={`chapter-item ${selectedChapters.includes(c.id) ? 'selected' : ''}`}
                                        onClick={() => toggleChapter(c.id)}>
                                        <div className="chapter-checkbox">
                                            {selectedChapters.includes(c.id) && '✓'}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.85rem' }}>{c.name}</div>
                                            <div className="text-xs text-muted">{c.subjectName} • Class {c.class_level}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Difficulty & Count */}
                        <div className="grid grid-2 gap-4 mb-4">
                            {testType !== 'adaptive' && testType !== 'pyq' && (
                                <div className="card">
                                    <h3 className="mb-4">Difficulty Level</h3>
                                    <div className="flex flex-col gap-2">
                                        {['all', 'easy', 'medium', 'hard', 'neet'].map(d => (
                                            <div key={d} className={`option-card ${difficulty === d ? 'selected' : ''}`}
                                                onClick={() => setDifficulty(d)} style={{ padding: '12px 16px' }}>
                                                <span className={`difficulty-badge ${d}`}>
                                                    {d === 'all' ? '🌟 All Levels' : d.charAt(0).toUpperCase() + d.slice(1)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="card">
                                <h3 className="mb-4">Number of Questions</h3>
                                <div className="flex flex-col gap-2">
                                    {[10, 20, 30, 50].map(n => (
                                        <div key={n} className={`option-card ${questionCount === n ? 'selected' : ''}`}
                                            onClick={() => setQuestionCount(n)} style={{ padding: '12px 16px' }}>
                                            <span className="font-semibold">{n} Questions</span>
                                            <span className="text-muted text-sm">({n * 4} marks • {Math.round(n * 1.5)} min)</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Generate Button */}
                <button
                    className="btn btn-primary btn-lg w-full"
                    onClick={handleGenerate}
                    disabled={generating}
                    style={{ fontSize: '1.1rem', padding: '18px 32px' }}
                >
                    {generating ? (
                        <><div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></div> Generating Test...</>
                    ) : (
                        <>🚀 Generate & Start Test</>
                    )}
                </button>
            </div>

            {/* Referral Lock Modal */}
            {showLockModal && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="modal-content" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '40px', maxWidth: '500px', width: '100%', textAlign: 'center', position: 'relative' }}>
                        <button onClick={() => setShowLockModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>

                        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔒</div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '16px' }}>Premium Feature Locked</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '32px', lineHeight: 1.6 }}>
                            {lockMessage}
                        </p>

                        <div style={{ background: 'var(--bg-glass)', border: '1px dashed var(--accent-primary)', padding: '20px', borderRadius: '16px', marginBottom: '32px' }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Your Unique Invite Link</div>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px' }}>
                                <input
                                    type="text"
                                    readOnly
                                    value={`https://aineetcoach.com/register?ref=${user?.referral_code || ''}`}
                                    style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none' }}
                                />
                                <button
                                    onClick={() => navigator.clipboard.writeText(`https://aineetcoach.com/register?ref=${user?.referral_code || ''}`)}
                                    className="btn btn-secondary btn-sm"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                const text = `Join AI NEET Coach with me and get free AI Mock Tests! 🚀\n\nSign up here: https://aineetcoach.com/register?ref=${user?.referral_code || ''}`;
                                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                            }}
                            className="btn btn-success btn-lg w-full"
                            style={{ fontSize: '1.2rem', padding: '16px', fontWeight: 700 }}
                        >
                            📱 Share via WhatsApp
                        </button>
                    </div>
                </div>
            )}
        </div >
    );
}
