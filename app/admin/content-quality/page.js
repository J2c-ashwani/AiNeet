'use client';
import { useState, useEffect, useCallback } from 'react';

// -- Stat Card Component --
function StatCard({ label, value, sub, color = '#6366f1', icon }) {
    return (
        <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid rgba(255,255,255,0.08)`,
            borderRadius: 16, padding: '20px 24px',
            position: 'relative', overflow: 'hidden',
            transition: 'all 0.3s',
        }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: color, borderRadius: '50%', filter: 'blur(50px)', opacity: 0.15 }} />
            <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{icon}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 6 }}>{label}</div>
            {sub && <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: 2 }}>{sub}</div>}
        </div>
    );
}

// -- Question Review Card --
function ReviewCard({ question, onApprove, onReject, loading }) {
    const [expanded, setExpanded] = useState(false);

    const confidenceColor = question.confidence_score >= 0.92 ? '#22c55e'
        : question.confidence_score >= 0.80 ? '#f59e0b' : '#ef4444';

    const qualityColor = question.quality_score >= 80 ? '#22c55e'
        : question.quality_score >= 60 ? '#f59e0b' : '#ef4444';

    return (
        <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, overflow: 'hidden',
            transition: 'all 0.3s',
        }}>
            {/* Header */}
            <div style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', gap: 16, alignItems: 'flex-start' }}
                onClick={() => setExpanded(!expanded)}>
                {/* Type badge */}
                <div style={{
                    minWidth: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: question.is_pyq ? 'rgba(34,197,94,0.1)' : 'rgba(99,102,241,0.1)',
                    border: `1px solid ${question.is_pyq ? 'rgba(34,197,94,0.2)' : 'rgba(99,102,241,0.2)'}`,
                    fontSize: '1.2rem'
                }}>
                    {question.is_pyq ? '📜' : '🤖'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                        <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: 6, background: 'rgba(99,102,241,0.1)', color: '#a5b4fc' }}>
                            {question.subject}
                        </span>
                        {question.topic && <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}>
                            {question.topic}
                        </span>}
                        <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.05)', color: '#475569' }}>
                            ID #{question.id}
                        </span>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: '#e2e8f0', lineHeight: 1.5, margin: 0 }}>
                        {question.text.substring(0, 150)}{question.text.length > 150 ? '...' : ''}
                    </p>
                </div>
                {/* Scores */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: qualityColor }}>{question.quality_score}</div>
                        <div style={{ fontSize: '0.6rem', color: '#475569' }}>Quality</div>
                    </div>
                    <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.08)' }} />
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: confidenceColor }}>
                            {Math.round((question.confidence_score || 0) * 100)}%
                        </div>
                        <div style={{ fontSize: '0.6rem', color: '#475569' }}>Conf.</div>
                    </div>
                    <div style={{ fontSize: '1rem', color: '#475569', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</div>
                </div>
            </div>

            {/* Expanded content */}
            {expanded && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    {/* Options */}
                    <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {['A', 'B', 'C', 'D'].map(opt => (
                            <div key={opt} style={{
                                padding: '10px 14px', borderRadius: 10,
                                background: question.correct_option === opt ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${question.correct_option === opt ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.06)'}`,
                                display: 'flex', gap: 10, alignItems: 'flex-start'
                            }}>
                                <span style={{
                                    fontSize: '0.7rem', fontWeight: 700, color: question.correct_option === opt ? '#4ade80' : '#64748b',
                                    minWidth: 16
                                }}>{opt}</span>
                                <span style={{ fontSize: '0.8rem', color: question.correct_option === opt ? '#86efac' : '#94a3b8' }}>
                                    {question[`option_${opt.toLowerCase()}`]}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Explanation */}
                    <div style={{ padding: '0 20px 16px' }}>
                        <div style={{ fontSize: '0.7rem', color: '#6366f1', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Explanation (v{question.explanation_version || 'legacy'})
                        </div>
                        <div style={{
                            fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.7,
                            background: 'rgba(255,255,255,0.02)', padding: 14, borderRadius: 10,
                            border: '1px solid rgba(255,255,255,0.05)',
                            maxHeight: 200, overflowY: 'auto'
                        }}>
                            {question.explanation}
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ padding: '12px 20px 16px', display: 'flex', gap: 10, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <button
                            id={`approve-${question.id}`}
                            disabled={loading === question.id}
                            onClick={() => onApprove(question.id)}
                            style={{
                                padding: '10px 24px', borderRadius: 10, border: '1px solid rgba(34,197,94,0.3)',
                                background: 'rgba(34,197,94,0.1)', color: '#4ade80', fontWeight: 700,
                                cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s',
                                opacity: loading === question.id ? 0.6 : 1
                            }}>
                            {loading === question.id ? '...' : '✓ Approve & Lock'}
                        </button>
                        <button
                            id={`reject-${question.id}`}
                            disabled={loading === question.id}
                            onClick={() => onReject(question.id)}
                            style={{
                                padding: '10px 24px', borderRadius: 10, border: '1px solid rgba(239,68,68,0.3)',
                                background: 'rgba(239,68,68,0.1)', color: '#f87171', fontWeight: 700,
                                cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s',
                                opacity: loading === question.id ? 0.6 : 1
                            }}>
                            ✗ Reject
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ContentQualityDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [toast, setToast] = useState(null);
    const [tab, setTab] = useState('queue'); // queue | rejections | reports

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/content-quality');
            const json = await res.json();
            setData(json);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleAction = async (questionId, action) => {
        setActionLoading(questionId);
        try {
            const res = await fetch('/api/admin/content-quality', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, questionId, reviewedBy: 'teacher' })
            });
            const json = await res.json();
            if (json.success) {
                showToast(json.message);
                fetchData();
            } else {
                showToast(json.error, 'error');
            }
        } catch (e) {
            showToast('Action failed', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: 48, height: 48, border: '2px solid #6366f1', borderTopColor: 'transparent',
                        borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
                    }} />
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading quality dashboard...</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    }

    const m = data?.metrics || {};
    const queue = data?.reviewQueue || [];
    const rejections = data?.recentRejections || [];
    const reports = data?.studentReports || {};

    const adoptionPct = m.totalQuestions > 0
        ? Math.round(((m.totalQuestions - m.unscoredCount) / m.totalQuestions) * 100)
        : 0;

    return (
        <div style={{ padding: '32px 32px', fontFamily: "'Inter', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                * { box-sizing: border-box; }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 3px; }
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>

            {/* Toast Notification */}
            {toast && (
                <div style={{
                    position: 'fixed', top: 24, right: 24, zIndex: 1000,
                    padding: '12px 20px', borderRadius: 12, fontWeight: 600, fontSize: '0.875rem',
                    background: toast.type === 'error' ? 'rgba(239,68,68,0.9)' : 'rgba(34,197,94,0.9)',
                    color: 'white', boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    animation: 'slideIn 0.3s ease', backdropFilter: 'blur(12px)'
                }}>
                    {toast.msg}
                </div>
            )}

            {/* Page Header */}
            <div style={{ marginBottom: 32, animation: 'fadeUp 0.5s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h1 style={{
                            fontSize: '1.75rem', fontWeight: 800, margin: 0,
                            background: 'linear-gradient(135deg, #e2e8f0, #a78bfa)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                        }}>
                            Academic Governance Dashboard
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: 6 }}>
                            MD Mandate: Every question must be teacher-verified before student exposure.
                        </p>
                    </div>
                    <div style={{
                        padding: '8px 16px', borderRadius: 10,
                        background: m.pendingReviewCount > 0 ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)',
                        border: `1px solid ${m.pendingReviewCount > 0 ? 'rgba(245,158,11,0.3)' : 'rgba(34,197,94,0.3)'}`,
                        color: m.pendingReviewCount > 0 ? '#fbbf24' : '#4ade80',
                        fontSize: '0.8rem', fontWeight: 700
                    }}>
                        {m.pendingReviewCount > 0 ? `⚠️ ${m.pendingReviewCount} awaiting review` : '✅ Review queue clear'}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32, animation: 'fadeUp 0.5s ease 0.1s both' }}>
                <StatCard icon="📊" label="Avg Quality Score" value={m.avgQuality || '—'} sub={`Target: ≥ 80`} color="#6366f1" />
                <StatCard icon="🎯" label="Avg Confidence" value={m.avgConfidence ? `${Math.round(m.avgConfidence * 100)}%` : '—'} sub="Target: ≥ 85%" color="#8b5cf6" />
                <StatCard icon="✅" label="High Quality (≥70)" value={m.highQualityCount || 0} color="#22c55e" />
                <StatCard icon="🔒" label="Teacher Approved" value={m.lockedCount || 0} sub="Locked & immutable" color="#06b6d4" />
                <StatCard icon="⏳" label="Awaiting Review" value={m.pendingReviewCount || 0} color="#f59e0b" />
                <StatCard icon="⚠️" label="Student Reports" value={reports.pending || 0} sub="Pending resolution" color="#ef4444" />
                <StatCard icon="📈" label="Quality Coverage" value={`${adoptionPct}%`} sub="Questions scored" color="#a78bfa" />
                <StatCard icon="📚" label="Total Questions" value={m.totalQuestions || 0} color="#64748b" />
            </div>

            {/* MD Mandate Banner */}
            <div style={{
                padding: '14px 20px', borderRadius: 12, marginBottom: 28,
                background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)',
                display: 'flex', gap: 16, alignItems: 'center',
                animation: 'fadeUp 0.5s ease 0.2s both'
            }}>
                <div style={{ fontSize: '1.5rem' }}>📋</div>
                <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#a5b4fc', marginBottom: 2 }}>REVIEW TIERS (MD Mandate)</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', gap: 24 }}>
                        <span><span style={{ color: '#4ade80' }}>●</span> Confidence ≥ 92% AND quality ≥ 85 → Auto-approve</span>
                        <span><span style={{ color: '#fbbf24' }}>●</span> Confidence 80–92% → Human review required</span>
                        <span><span style={{ color: '#f87171' }}>●</span> Confidence {'<'} 80% → Hard reject (no queue)</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'rgba(255,255,255,0.03)', padding: 4, borderRadius: 12, width: 'fit-content', animation: 'fadeUp 0.5s ease 0.3s both' }}>
                {[
                    { id: 'queue', label: `Review Queue (${queue.length})`, icon: '👁️' },
                    { id: 'rejections', label: `Recent Rejections (${rejections.length})`, icon: '❌' },
                    { id: 'reports', label: `Student Reports`, icon: '🚨' },
                ].map(t => (
                    <button key={t.id} id={`tab-${t.id}`} onClick={() => setTab(t.id)} style={{
                        padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                        background: tab === t.id ? 'rgba(99,102,241,0.2)' : 'transparent',
                        color: tab === t.id ? '#a5b4fc' : '#64748b', fontWeight: 600, fontSize: '0.8rem',
                        transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6
                    }}>
                        <span>{t.icon}</span><span>{t.label}</span>
                    </button>
                ))}
            </div>

            {/* Review Queue Tab */}
            {tab === 'queue' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, animation: 'fadeUp 0.4s ease' }}>
                    {queue.length === 0 ? (
                        <div style={{
                            textAlign: 'center', padding: '60px 20px',
                            background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.1)', borderRadius: 16
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: 12 }}>✅</div>
                            <h3 style={{ color: '#4ade80', fontWeight: 700 }}>Review Queue is Clear!</h3>
                            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                                All AI-generated and enriched content has been reviewed. Run the generation or enrichment pipelines to add more questions.
                            </p>
                        </div>
                    ) : queue.map(q => (
                        <ReviewCard
                            key={q.id}
                            question={q}
                            onApprove={(id) => handleAction(id, 'approve')}
                            onReject={(id) => handleAction(id, 'reject')}
                            loading={actionLoading}
                        />
                    ))}
                </div>
            )}

            {/* Rejections Tab */}
            {tab === 'rejections' && (
                <div style={{ animation: 'fadeUp 0.4s ease' }}>
                    {rejections.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                            No rejections logged yet.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {rejections.map((r, i) => (
                                <div key={i} style={{
                                    padding: '14px 18px', borderRadius: 12,
                                    background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)',
                                    display: 'grid', gridTemplateColumns: '100px 1fr auto', gap: 16, alignItems: 'center'
                                }}>
                                    <div style={{
                                        padding: '4px 10px', borderRadius: 6, textAlign: 'center',
                                        background: 'rgba(239,68,68,0.1)', color: '#f87171', fontSize: '0.65rem', fontWeight: 700
                                    }}>{r.rejection_gate}</div>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: '#e2e8f0', marginBottom: 2 }}>{r.rejection_reason}</div>
                                        {r.topic && <div style={{ fontSize: '0.7rem', color: '#475569' }}>Topic: {r.topic}</div>}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: '#475569', whiteSpace: 'nowrap' }}>
                                        {new Date(r.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Student Reports Tab */}
            {tab === 'reports' && (
                <div style={{ animation: 'fadeUp 0.4s ease' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                        <StatCard icon="🚨" label="Total Reports" value={reports.total} color="#ef4444" />
                        <StatCard icon="⏳" label="Pending" value={reports.pending} color="#f59e0b" />
                        <StatCard icon="❌" label="Wrong Answer" value={reports.wrongAnswer} color="#f87171" />
                        <StatCard icon="💬" label="Unclear Explanation" value={reports.unclearExplanation} color="#fb923c" />
                    </div>
                    <div style={{
                        textAlign: 'center', padding: '40px 20px',
                        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16,
                        color: '#475569', fontSize: '0.875rem'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: 12 }}>📬</div>
                        Student issue reporting is active. Detailed report management coming in the next sprint.
                    </div>
                </div>
            )}
        </div>
    );
}
