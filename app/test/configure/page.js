'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppInstallPrompt from '@/components/AppInstallPrompt';

export default function TestConfigPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [syllabus, setSyllabus] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [selectedChapters, setSelectedChapters] = useState([]);
    const [selectedTopics, setSelectedTopics] = useState([]);
    const [difficulty, setDifficulty] = useState('all');
    const [questionCount, setQuestionCount] = useState(20);
    const [testType, setTestType] = useState(searchParams.get('type') || 'custom');

    // Yearly PYQ States
    const [availableYears, setAvailableYears] = useState([]);
    const [selectedYear, setSelectedYear] = useState('');

    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);
    const [showLockModal, setShowLockModal] = useState(false);
    const [lockMessage, setLockMessage] = useState('');
    const [showAppPromo, setShowAppPromo] = useState(false);

    useEffect(() => {
        fetch('/api/auth/me').then(r => r.json()).then(data => {
            if (data.user) setUser(data.user);
        });
        fetch('/api/syllabus').then(r => r.json()).then(data => {
            setSyllabus(data.subjects || []);
            setLoading(false);
        });
        // Fetch available PYQ years
        fetch('/api/pyq/years').then(r => r.json()).then(data => {
            if (data.years && data.years.length > 0) {
                setAvailableYears(data.years);
                setSelectedYear(data.years[0]);
            }
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

    const toggleTopic = (id) => {
        setSelectedTopics(prev =>
            prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
        );
    };

    const handleGenerate = async () => {
        if (!user) {
            router.push('/login?redirect=/test/configure');
            return;
        }
        // App Install Gate for Mobile Web
        if (typeof window !== 'undefined') {
            const isMobileBrowser = Boolean(navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i));
            if (isMobileBrowser) {
                setShowAppPromo(true);
                return;
            }
        }

        setGenerating(true);
        setError('');
        try {
            let endpoint = '/api/tests/generate';
            if (testType === 'adaptive') endpoint = '/api/tests/adaptive';
            if (testType === 'pyq') endpoint = '/api/tests/pyq';

            // For custom tests, if they selected specific chapters, we only send those chapters
            // so we don't accidentally restrict them by the 'subjects' filter if they mixed and matched.
            const apiSubjects = (testType === 'custom' && selectedChapters.length > 0)
                ? undefined
                : (selectedSubjects.length > 0 ? selectedSubjects : syllabus.map(s => s.id));

            const payload = {
                subjects: apiSubjects,
                subjectId: testType === 'adaptive' ? selectedSubjects[0] : undefined,
                chapters: selectedChapters.length > 0 ? selectedChapters : undefined,
                topics: selectedTopics.length > 0 ? selectedTopics : undefined,
                difficulty: (testType !== 'pyq' && testType !== 'yearly_pyq' && difficulty !== 'all') ? difficulty : undefined,
                questionCount: (testType === 'mock' || testType === 'yearly_pyq') ? 180 : questionCount,
                count: questionCount,
                type: testType,
                year: testType === 'yearly_pyq' ? selectedYear : undefined
            };

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
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

    // We determine which subjects to show chapters for. If no subject selected, show all.
    const activeSubjectsForChapters = selectedSubjects.length > 0
        ? syllabus.filter(s => selectedSubjects.includes(s.id))
        : syllabus;

    return (
        <div>
            
            <AppInstallPrompt mode="hard" showModal={showAppPromo} onClose={() => setShowAppPromo(false)} />

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
                            { value: 'adaptive', label: 'Adaptive Practice', icon: '🧠', desc: 'AI Adjusts Difficulty' },
                            { value: 'ai_generated', label: 'AI Generated', icon: '⚡', desc: 'Unique AI questions' },
                            { value: 'pyq', label: 'Past Papers (Topic)', icon: '📜', desc: 'Filter by chapter' },
                            { value: 'yearly_pyq', label: 'Year-wise PYQ', icon: '📅', desc: 'Full papers by year' },
                            { value: 'topic', label: 'Topic-wise', icon: '📌', desc: 'Focus on specific topics' },
                            { value: 'chapter', label: 'Chapter-wise', icon: '📖', desc: 'Complete chapter test' },
                            { value: 'mock', label: 'Full Mock', icon: '⏱️', desc: '180 Qs • 720 marks' },
                        ].map(t => (
                            <div key={t.value} className={`option-card ${testType === t.value ? 'selected' : ''}`}
                                onClick={() => {
                                    if (testType !== t.value) {
                                        setTestType(t.value);
                                        setSelectedSubjects([]);
                                        setSelectedChapters([]);
                                        setSelectedTopics([]);
                                        setDifficulty('all');
                                    }
                                }} style={{ flex: '1 1 180px' }}>
                                <span style={{ fontSize: '1.5rem' }}>{t.icon}</span>
                                <div>
                                    <div className="font-semibold">{t.label}</div>
                                    <div className="text-xs text-muted">{t.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {testType === 'yearly_pyq' && (
                    <div className="card mb-4 border-2 border-[var(--accent-primary)]">
                        <h3 className="mb-4">Select PYQ Year</h3>
                        {availableYears.length > 0 ? (
                            <div className="flex gap-3 flex-wrap">
                                {availableYears.map(year => (
                                    <div key={year} className={`option-card ${selectedYear === year ? 'selected' : ''}`}
                                        onClick={() => setSelectedYear(year)} style={{ flex: '1 1 120px', textAlign: 'center' }}>
                                        <span className="font-bold text-xl">{year}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-6 text-center text-muted bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-color)]">
                                📅 No full yearly papers available yet. They are coming soon!
                            </div>
                        )}
                        <p className="mt-4 text-sm text-muted">
                            This will generate a full 180-question mock test containing all Botany, Zoology, Physics, and Chemistry questions exactly as they appeared in the {selectedYear} paper.
                        </p>
                    </div>
                )}

                {testType !== 'mock' && testType !== 'yearly_pyq' && (
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
                        {testType !== 'adaptive' && testType !== 'ai_generated' && (
                            <div className="card mb-4">
                                <h3 className="mb-2">Select Specific Chapters <span className="text-muted text-sm font-normal">(Mix and match items across subjects)</span></h3>
                                <p className="text-sm text-muted mb-6">If you pick specific chapters, your test will only include questions from those chapters.</p>

                                <div className="flex flex-col gap-6">
                                    {activeSubjectsForChapters.map(subject => (
                                        <div key={subject.id}>
                                            <h4 style={{ color: subject.color, marginBottom: 12, borderBottom: `1px solid ${subject.color}33`, paddingBottom: 8 }}>
                                                {subject.icon} {subject.name}
                                            </h4>
                                            <div className="chapter-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
                                                {subject.chapters.map(c => {
                                                    const isDisabled = testType === 'pyq' && c.pyq_count === 0;
                                                    return (
                                                        <div key={c.id}
                                                            className={`chapter-item ${selectedChapters.includes(c.id) ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                                                            onClick={() => { if (!isDisabled) toggleChapter(c.id); }}
                                                            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-color)', cursor: isDisabled ? 'not-allowed' : 'pointer', transition: 'all 0.2s', background: selectedChapters.includes(c.id) ? `${subject.color}15` : 'transparent', borderColor: selectedChapters.includes(c.id) ? subject.color : 'var(--border-color)', opacity: isDisabled ? 0.5 : 1 }}
                                                        >
                                                            <div style={{ width: 20, height: 20, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', background: selectedChapters.includes(c.id) ? subject.color : 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                                                {selectedChapters.includes(c.id) && '✓'}
                                                                {isDisabled && '🚫'}
                                                            </div>
                                                            <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <div style={{ fontSize: '0.85rem', fontWeight: selectedChapters.includes(c.id) ? 600 : 400, color: selectedChapters.includes(c.id) ? '#fff' : 'var(--text-secondary)' }}>
                                                                    {c.name}
                                                                </div>
                                                                {testType === 'pyq' && (
                                                                    <div style={{ fontSize: '0.75rem', color: isDisabled ? 'var(--danger)' : 'var(--text-muted)' }}>
                                                                        {c.pyq_count} PYQs
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Topic Selection for Topic-wise test */}
                        {testType === 'topic' && selectedChapters.length > 0 && (
                            <div className="card mb-4 mt-4">
                                <h3 className="mb-2">Select Specific Topics</h3>
                                <p className="text-sm text-muted mb-6">Choose the exact topics from your selected chapters.</p>
                                <div className="flex flex-col gap-6">
                                    {activeSubjectsForChapters.map(subject => {
                                        const activeChapters = subject.chapters.filter(c => selectedChapters.includes(c.id));
                                        if (activeChapters.length === 0) return null;
                                        return (
                                            <div key={`topics-${subject.id}`}>
                                                {activeChapters.map(c => (
                                                    <div key={c.id} className="mb-4">
                                                        <h5 style={{ color: subject.color, marginBottom: 8, fontSize: '0.95rem' }}>{c.name}</h5>
                                                        <div className="flex gap-2 flex-wrap">
                                                            {c.topics && c.topics.map(t => (
                                                                <div key={t.id}
                                                                    onClick={() => toggleTopic(t.id)}
                                                                    className={`pill ${selectedTopics.includes(t.id) ? 'active' : ''}`}
                                                                    style={{
                                                                        padding: '6px 12px', fontSize: '0.8rem', borderRadius: 20, cursor: 'pointer',
                                                                        background: selectedTopics.includes(t.id) ? subject.color : 'rgba(255,255,255,0.05)',
                                                                        color: selectedTopics.includes(t.id) ? '#fff' : 'var(--text-secondary)',
                                                                        border: `1px solid ${selectedTopics.includes(t.id) ? subject.color : 'var(--border-color)'}`
                                                                    }}
                                                                >
                                                                    {t.name}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Difficulty & Count */}
                        <div className="grid grid-2 gap-4 mb-4">
                            {(testType === 'custom' || testType === 'ai_generated') && (
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
                                    {[10, 20, 50, 90, 180].map(n => (
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
                    disabled={generating || (testType === 'yearly_pyq' && !selectedYear)}
                    style={{ fontSize: '1.1rem', padding: '18px 32px' }}
                >
                    {generating ? (
                        <><div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></div> Generating Test...</>
                    ) : testType === 'yearly_pyq' && selectedYear ? (
                        <>🚀 Generate {selectedYear} PYQ Paper</>
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
