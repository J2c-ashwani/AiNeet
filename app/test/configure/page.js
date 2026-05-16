'use client';
import { Icon } from '@/components/ui/Icon';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppInstallPrompt from '@/components/AppInstallPrompt';
import { useAuth } from '@/context/AuthContext';
import { Card, Button, Input } from '@/components/ui';

function TestConfigContent() {
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
    const { user } = useAuth();
    const [showLockModal, setShowLockModal] = useState(false);
    const [lockMessage, setLockMessage] = useState('');
    const [showAppPromo, setShowAppPromo] = useState(false);

    useEffect(() => {
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
            window.location.href = '/login?redirect=/test/configure';
            return;
        }
        // App Install Gate for Mobile Web ONLY
        // Do NOT block users already inside the native app (ReactNativeWebView or custom UA header)
        if (typeof window !== 'undefined') {
            const isMobileBrowser = Boolean(navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i));
            const isInsideNativeApp = Boolean(
                window.ReactNativeWebView ||                          // React Native WebView bridge
                window.nativeApp ||                                    // Custom bridge if set
                navigator.userAgent.includes('NEETCoachApp') ||       // Custom UA we can set in the app
                document.cookie.includes('native_app=true')           // Cookie set by native app on boot
            );
            if (isMobileBrowser && !isInsideNativeApp) {
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
            window.location.href = `/test/${data.testId}`;
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
                    <h1 className="page-title"><Icon name="Target" /> Generate AI Test</h1>
                    <p className="page-subtitle">Configure your test and start practicing</p>
                </div>

                {error && (
                    <Card style={{ padding: '12px 16px', border: '1px solid rgba(239,68,68,0.3)', marginBottom: 20 }}>
                        {error}
                    </Card>
                )}

                {/* Test Type */}
                <Card style={{ marginBottom: 24 }}>
                    <h3 style={{ marginBottom: 16, fontWeight: 800 }}>Test Type</h3>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        {[
                            { value: 'custom', label: 'Custom Test', icon: <Icon name="Target" size={24} />, desc: 'Choose your own settings' },
                            { value: 'adaptive', label: 'Adaptive Practice', icon: <Icon name="Brain" size={24} />, desc: 'AI Adjusts Difficulty' },
                            { value: 'ai_generated', label: 'AI Generated', icon: <Icon name="Zap" size={24} />, desc: 'Unique AI questions' },
                            { value: 'pyq', label: 'Past Papers (Topic)', icon: <Icon name="FileText" size={24} />, desc: 'Filter by chapter' },
                            { value: 'yearly_pyq', label: 'Year-wise PYQ', icon: <Icon name="CalendarDays" size={24} />, desc: 'Full papers by year' },
                            { value: 'topic', label: 'Topic-wise', icon: '📌', desc: 'Focus on specific topics' },
                            { value: 'chapter', label: 'Chapter-wise', icon: '📖', desc: 'Complete chapter test' },
                            { value: 'mock', label: 'Full Mock', icon: <Icon name="Clock" size={24} />, desc: '180 Qs • 720 marks' },
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
                                <span >{t.icon}</span>
                                <div>
                                    <div style={{ fontWeight: 600 }}>{t.label}</div>
                                    <div >{t.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {testType === 'yearly_pyq' && (
                    <Card style={{ marginBottom: 24, border: '2px solid var(--primary)' }}>
                        <h3 style={{ marginBottom: 16, fontWeight: 800 }}>Select PYQ Year</h3>
                        {availableYears.length > 0 ? (
                            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                {availableYears.map(year => (
                                    <div key={year} className={`option-card ${selectedYear === year ? 'selected' : ''}`}
                                        onClick={() => setSelectedYear(year)} style={{ flex: '1 1 120px', textAlign: 'center' }}>
                                        <span style={{ fontWeight: 800, }}>{year}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <Card style={{ padding: 24, textAlign: 'center', border: '1px solid var(--border)' }}>
                                <Icon name="CalendarDays" /> No full yearly papers available yet. They are coming soon!
                            </Card>
                        )}
                        <p style={{ marginTop: 16, }}>
                            This will generate a full 180-question mock test containing all Botany, Zoology, Physics, and Chemistry questions exactly as they appeared in the {selectedYear} paper.
                        </p>
                    </Card>
                )}

                {testType !== 'mock' && testType !== 'yearly_pyq' && (
                    <>
                        {/* Subject Selection */}
                        <Card style={{ marginBottom: 24 }}>
                            <h3 style={{ marginBottom: 16, fontWeight: 800 }}>Select Subjects</h3>
                            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                {syllabus.map(s => (
                                    <div key={s.id}
                                        className={`option-card ${selectedSubjects.includes(s.id) ? 'selected' : ''}`}
                                        onClick={() => toggleSubject(s.id)}
                                        style={{ flex: '1 1 150px', borderColor: selectedSubjects.includes(s.id) ? s.color : undefined }}>
                                        <span >{s.icon}</span>
                                        <div style={{ fontWeight: 600 }}>{s.name}</div>
                                    </div>
                                ))}
                            </div>
                            {selectedSubjects.length === 0 && (
                                <p style={{ marginTop: 8 }}>
                                    {testType === 'adaptive' ? 'Please select a subject to start adaptive practice' : 'No selection = all subjects included'}
                                </p>
                            )}
                        </Card>

                        {/* Chapter Selection */}
                        {testType !== 'adaptive' && testType !== 'ai_generated' && (
                            <Card style={{ marginBottom: 24 }}>
                                <h3 style={{ marginBottom: 8, fontWeight: 800 }}>Select Specific Chapters <span style={{ fontWeight: 400 }}>(Mix and match items across subjects)</span></h3>
                                <p style={{ marginBottom: 24 }}>If you pick specific chapters, your test will only include questions from those chapters.</p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
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
                                                            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: '1px solid var(--border)', cursor: isDisabled ? 'not-allowed' : 'pointer', transition: 'all 0.2s', background: selectedChapters.includes(c.id) ? `${subject.color}15` : 'transparent', borderColor: selectedChapters.includes(c.id) ? subject.color : 'var(--border)', opacity: isDisabled ? 0.5 : 1 }}
                                                        >
                                                            <div style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: selectedChapters.includes(c.id) ? subject.color : 'var(--bg-glass)', fontWeight: 700 }}>
                                                                {selectedChapters.includes(c.id) && '✓'}
                                                                {isDisabled && '🚫'}
                                                            </div>
                                                            <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <div style={{ fontWeight: selectedChapters.includes(c.id) ? 600 : 400, color: selectedChapters.includes(c.id) ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                                                    {c.name}
                                                                </div>
                                                                {testType === 'pyq' && (
                                                                    <div style={{ color: isDisabled ? 'var(--danger)' : 'var(--text-muted)' }}>
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
                            </Card>
                        )}

                        {/* Topic Selection for Topic-wise test */}
                        {testType === 'topic' && selectedChapters.length > 0 && (
                            <Card style={{ marginBottom: 24, marginTop: 16 }}>
                                <h3 style={{ marginBottom: 8, fontWeight: 800 }}>Select Specific Topics</h3>
                                <p style={{ marginBottom: 24 }}>Choose the exact topics from your selected chapters.</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                    {activeSubjectsForChapters.map(subject => {
                                        const activeChapters = subject.chapters.filter(c => selectedChapters.includes(c.id));
                                        if (activeChapters.length === 0) return null;
                                        return (
                                            <div key={`topics-${subject.id}`}>
                                                {activeChapters.map(c => (
                                                    <div key={c.id} style={{ marginBottom: 16 }}>
                                                        <h5 style={{ color: subject.color, marginBottom: 8, }}>{c.name}</h5>
                                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                            {c.topics && c.topics.map(t => (
                                                                <div key={t.id}
                                                                    onClick={() => toggleTopic(t.id)}
                                                                    className={`pill ${selectedTopics.includes(t.id) ? 'active' : ''}`}
                                                                    style={{
                                                                        padding: '6px 12px', cursor: 'pointer',
                                                                        background: selectedTopics.includes(t.id) ? subject.color : 'var(--bg-glass)',
                                                                        color: selectedTopics.includes(t.id) ? 'var(--text-primary)' : 'var(--text-secondary)',
                                                                        border: `1px solid ${selectedTopics.includes(t.id) ? subject.color : 'var(--border)'}`
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
                            </Card>
                        )}

                        {/* Difficulty & Count */}
                        <div className="grid grid-2" style={{ gap: 16, marginBottom: 16 }}>
                            {(testType === 'custom' || testType === 'ai_generated') && (
                                <Card>
                                    <h3 style={{ marginBottom: 16, fontWeight: 800 }}>Difficulty Level</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {['all', 'easy', 'medium', 'hard', 'neet'].map(d => (
                                            <div key={d} className={`option-card ${difficulty === d ? 'selected' : ''}`}
                                                onClick={() => setDifficulty(d)} style={{ padding: '12px 16px' }}>
                                                <span className={`difficulty-badge ${d}`}>
                                                    {d === 'all' ? '🌟 All Levels' : d.charAt(0).toUpperCase() + d.slice(1)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            )}
                            <Card>
                                <h3 style={{ marginBottom: 16, fontWeight: 800 }}>Number of Questions</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {[10, 20, 50, 90, 180].map(n => (
                                        <div key={n} className={`option-card ${questionCount === n ? 'selected' : ''}`}
                                            onClick={() => setQuestionCount(n)} style={{ padding: '12px 16px' }}>
                                            <span style={{ fontWeight: 600 }}>{n} Questions</span>
                                            <span >({n * 4} marks • {Math.round(n * 1.5)} min)</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </>
                )}

                {/* Generate Button */}
                <Button
                    variant="primary"
                    size="lg"
                    onClick={handleGenerate}
                    disabled={generating || (testType === 'yearly_pyq' && !selectedYear)}
                    style={{ width: '100%', padding: '18px 32px' }}
                >
                    {generating ? (
                        <><div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></div> Generating Test...</>
                    ) : testType === 'yearly_pyq' && selectedYear ? (
                        <><Icon name="Zap" /> Generate {selectedYear} PYQ Paper</>
                    ) : (
                        <><Icon name="Zap" /> Generate & Start Test</>
                    )}
                </Button>
            </div>

            {/* Referral Lock Modal */}
            {showLockModal && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <Card className="modal-content" style={{ border: '1px solid var(--border)', padding: 40, maxWidth: 500, width: '100%', textAlign: 'center', position: 'relative' }}>
                        <Button variant="ghost" onClick={() => setShowLockModal(false)} style={{ position: 'absolute', top: 20, right: 20 }}>×</Button>

                        <div style={{ marginBottom: 20 }}><Icon name="Lock" /></div>
                        <h2 style={{ fontWeight: 800, marginBottom: 16, }}>Premium Feature Locked</h2>
                        <p style={{ marginBottom: 32, lineHeight: 1.6 }}>
                            {lockMessage}
                        </p>

                        <Card style={{ border: '1px dashed var(--primary)', padding: 20, marginBottom: 32 }}>
                            <div style={{ marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Your Unique Invite Link</div>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: 10, }}>
                                <Input
                                    type="text"
                                    readOnly
                                    value={`https://aineetcoach.com/register?ref=${user?.referral_code || ''}`}
                                    style={{ flex: 1, margin: 0 }}
                                />
                                <Button
                                    onClick={() => navigator.clipboard.writeText(`https://aineetcoach.com/register?ref=${user?.referral_code || ''}`)}
                                    variant="secondary"
                                    size="sm"
                                >
                                    Copy
                                </Button>
                            </div>
                        </Card>

                        <Button
                            onClick={() => {
                                const text = `Join AI NEET Coach with me and get free AI Mock Tests! ⚡\n\nSign up here: https://aineetcoach.com/register?ref=${user?.referral_code || ''}`;
                                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                            }}
                            variant="success"
                            size="lg"
                            style={{ width: '100%', padding: 16 }}
                        >
                            📱 Share via WhatsApp
                        </Button>
                    </Card>
                </div>
            )}
        </div >
    );
}

export default function TestConfigPage() {
    return (
        <Suspense fallback={<div style={{ textAlign: 'center', padding: 60, }}>Loading...</div>}>
            <TestConfigContent />
        </Suspense>
    );
}
