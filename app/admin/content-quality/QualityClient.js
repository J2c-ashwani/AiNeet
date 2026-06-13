'use client';
import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';

// -- Stat Card Component --
function StatCard({ label, value, sub, icon }) {
    return (
        <Card flat className="dash-stat-card ops-circuit-card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div className="dash-kpi-icon"><Icon name={icon || 'Activity'} size={24} color="var(--accent-primary)" /></div>
            <div className="dash-stat-value">{value}</div>
            <div className="dash-stat-label">{label}</div>
            {sub && <div className="dash-kpi-label">{sub}</div>}
        </Card>
    );
}

// -- Question Review Card --
function ReviewCard({ question, onApprove, onReject, loading }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <Card flat className="dash-history-list" style={{ marginBottom: 12 }}>
            {/* Header */}
            <div className="dash-history-item" onClick={() => setExpanded(!expanded)} style={{ cursor: 'pointer', border: 'none', }}>
                {/* Type badge */}
                <Badge variant={question.is_pyq ? 'neet' : 'info'} icon={question.is_pyq ? <Icon name="BookOpen" size={12} /> : <Icon name="Cpu" size={12} />} />
                
                <div style={{ flex: 1, minWidth: 0, paddingLeft: 12 }}>
                    <div className="analytics-subject-row-left" style={{ flexWrap: 'wrap', marginBottom: 6 }}>
                        <Badge variant={question.subject.toLowerCase()}>{question.subject}</Badge>
                        {question.topic && <Badge variant="neutral">{question.topic}</Badge>}
                        <Badge variant="neutral">ID #{question.id}</Badge>
                    </div>
                    <p className="omr-insight">
                        {question.text.substring(0, 150)}{question.text.length > 150 ? '...' : ''}
                    </p>
                </div>
                {/* Scores */}
                <div className="analytics-subject-row-left" style={{ flexShrink: 0 }}>
                    <div style={{ textAlign: 'center', padding: '0 8px' }}>
                        <div className="dash-kpi-value">{question.quality_score}</div>
                        <div className="dash-kpi-label">Quality</div>
                    </div>
                    <div className="ops-trust-bar-bg" style={{ width: 1, height: 32 }} />
                    <div style={{ textAlign: 'center', padding: '0 8px' }}>
                        <div className="dash-kpi-value">
                            {Math.round((question.confidence_score || 0) * 100)}%
                        </div>
                        <div className="dash-kpi-label">Conf.</div>
                    </div>
                    <div className="dash-kpi-label" style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</div>
                </div>
            </div>

            {/* Expanded content */}
            {expanded && (
                <div className="ops-trust-row" style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
                    {/* Options */}
                    <div className="ops-grid-1-1" style={{ gap: 8, marginBottom: 16 }}>
                        {['A', 'B', 'C', 'D'].map(opt => (
                            <Card key={opt} flat className={question.correct_option === opt ? 'omr-stat-box--correct' : ''} style={{ padding: 14, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                <span className={question.correct_option === opt ? 'results-option-label--correct' : 'results-option-label--neutral'} style={{ minWidth: 16 }}>{opt}</span>
                                <span className={question.correct_option === opt ? 'results-option-label--correct' : 'results-option-label--neutral'}>
                                    {question[`option_${opt.toLowerCase()}`]}
                                </span>
                            </Card>
                        ))}
                    </div>

                    {/* Explanation */}
                    <div style={{ marginBottom: 16 }}>
                        <div className="dash-kpi-label" style={{ marginBottom: 8 }}>
                            Explanation (v{question.explanation_version || 'legacy'})
                        </div>
                        <div className="omr-insight ops-circuit-card" style={{ maxHeight: 200, overflowY: 'auto' }}>
                            {question.explanation}
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="analytics-subject-row-left" style={{ paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
                        <Button
                            id={`approve-${question.id}`}
                            variant="success"
                            disabled={loading === question.id}
                            onClick={() => onApprove(question.id)}>
                            {loading === question.id ? '...' : <><Icon name="CheckCircle" size={16} /> Approve & Lock</>}
                        </Button>
                        <Button
                            id={`reject-${question.id}`}
                            variant="danger"
                            disabled={loading === question.id}
                            onClick={() => onReject(question.id)}>
                            <Icon name="XCircle" size={16} /> Reject
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
}

export default function ContentQualityDashboardContent() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [toast, setToast] = useState(null);
    const [tab, setTab] = useState('queue');

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
            <div className="dash-error-container">
                <div className="spinner" style={{ width: 48, height: 48, borderTopColor: 'var(--accent-primary)', marginBottom: 16 }} />
                <p className="dash-error-body">Loading quality dashboard...</p>
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
        <div className="ops-page">
            {/* Toast Notification */}
            {toast && (
                <div className={toast.type === 'error' ? 'omr-error-banner' : 'omr-dim-warning'} style={{
                    position: 'fixed', top: 24, right: 24,
                    padding: '12px 20px', boxShadow: 'var(--shadow-lg)'
                }}>
                    {toast.msg}
                </div>
            )}

            {/* Page Header */}
            <div className="ops-header">
                <div>
                    <h1 className="ops-title">
                        Academic Governance Dashboard
                    </h1>
                    <p className="ops-subtitle">
                        MD Mandate: Every question must be teacher-verified before student exposure.
                    </p>
                </div>
                <div className={m.pendingReviewCount > 0 ? "omr-dim-warning" : "omr-dim-warning"} style={{ borderColor: m.pendingReviewCount > 0 ? 'var(--warning)' : 'var(--success)', color: m.pendingReviewCount > 0 ? 'var(--warning)' : 'var(--success)', }}>
                    {m.pendingReviewCount > 0 ? <><Icon name="AlertCircle" size={16} /> {m.pendingReviewCount} awaiting review</> : <><Icon name="CheckCircle" size={16} /> Review queue clear</>}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="dash-stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: 32 }}>
                <StatCard icon="BarChart2" label="Avg Quality Score" value={m.avgQuality || '—'} sub={`Target: ≥ 80`} />
                <StatCard icon="Target" label="Avg Confidence" value={m.avgConfidence ? `${Math.round(m.avgConfidence * 100)}%` : '—'} sub="Target: ≥ 85%" />
                <StatCard icon="CheckCircle" label="High Quality (≥70)" value={m.highQualityCount || 0} />
                <StatCard icon="Lock" label="Teacher Approved" value={m.lockedCount || 0} sub="Locked & immutable" />
                <StatCard icon="Clock" label="Awaiting Review" value={m.pendingReviewCount || 0} />
                <StatCard icon="AlertCircle" label="Student Reports" value={reports.pending || 0} sub="Pending resolution" />
                <StatCard icon="TrendingUp" label="Quality Coverage" value={`${adoptionPct}%`} sub="Questions scored" />
                <StatCard icon="Layers" label="Total Questions" value={m.totalQuestions || 0} />
            </div>

            {/* MD Mandate Banner */}
            <Card flat className="ops-section" style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '14px 20px', marginBottom: 28 }}>
                <Icon name="Shield" size={32} color="var(--accent-primary)" />
                <div>
                    <div className="dash-kpi-label" style={{ marginBottom: 2 }}>REVIEW TIERS (MD Mandate)</div>
                    <div className="dash-history-item-meta" style={{ display: 'flex', gap: 24 }}>
                        <span><span >●</span> Confidence ≥ 92% AND quality ≥ 85 → Auto-approve</span>
                        <span><span >●</span> Confidence 80–92% → Human review required</span>
                        <span><span >●</span> Confidence {'<'} 80% → Hard reject (no queue)</span>
                    </div>
                </div>
            </Card>

            {/* Tabs */}
            <div className="analytics-subject-row-left" style={{ marginBottom: 20, padding: 4 }}>
                {[
                    { id: 'queue', label: `Review Queue (${queue.length})`, icon: 'Eye' },
                    { id: 'rejections', label: `Recent Rejections (${rejections.length})`, icon: 'XCircle' },
                    { id: 'reports', label: `Student Reports`, icon: 'AlertCircle' },
                ].map(t => (
                    <Button key={t.id} id={`tab-${t.id}`} onClick={() => setTab(t.id)} variant={tab === t.id ? 'secondary' : 'ghost'} className="navbar-link">
                        <Icon name={t.icon} size={16} /> <span>{t.label}</span>
                    </Button>
                ))}
            </div>

            {/* Review Queue Tab */}
            {tab === 'queue' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {queue.length === 0 ? (
                        <Card flat className="dash-error-container" style={{ minHeight: 'auto', padding: '60px 20px' }}>
                            <Icon name="CheckCircle" size={48} color="var(--success)" className="dash-error-icon" />
                            <h3 className="dash-error-title" >Review Queue is Clear!</h3>
                            <p className="dash-error-body">
                                All AI-generated and enriched content has been reviewed. Run the generation or enrichment pipelines to add more questions.
                            </p>
                        </Card>
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
                <div>
                    {rejections.length === 0 ? (
                        <div className="dash-error-body" style={{ textAlign: 'center', padding: '60px 20px' }}>
                            No rejections logged yet.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {rejections.map((r, i) => (
                                <Card key={i} flat className="omr-error-banner" style={{ display: 'grid', gridTemplateColumns: '100px 1fr auto', gap: 16, alignItems: 'center', padding: '14px 18px', marginBottom: 0 }}>
                                    <div className="dash-kpi-label" style={{ textAlign: 'center' }}>{r.rejection_gate}</div>
                                    <div>
                                        <div className="dash-history-item-name" >{r.rejection_reason}</div>
                                        {r.topic && <div className="dash-history-item-meta">Topic: {r.topic}</div>}
                                    </div>
                                    <div className="dash-history-item-meta" style={{ whiteSpace: 'nowrap' }}>
                                        {new Date(r.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Student Reports Tab */}
            {tab === 'reports' && (
                <div>
                    <div className="dash-stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: 24 }}>
                        <StatCard icon="AlertCircle" label="Total Reports" value={reports.total} />
                        <StatCard icon="Clock" label="Pending" value={reports.pending} />
                        <StatCard icon="XCircle" label="Wrong Answer" value={reports.wrongAnswer} />
                        <StatCard icon="MessageCircle" label="Unclear Explanation" value={reports.unclearExplanation} />
                    </div>
                    <Card flat className="dash-error-container" style={{ minHeight: 'auto', padding: '40px 20px' }}>
                        <Icon name="BookMarked" size={48} className="dash-error-icon" color="var(--text-muted)" />
                        <p className="dash-error-body">Student issue reporting is active. Detailed report management coming in the next sprint.</p>
                    </Card>
                </div>
            )}
        </div>
    );
}
