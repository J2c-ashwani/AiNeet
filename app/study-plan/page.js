'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StudyPlanPage() {
    const router = useRouter();
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/study-plan').then(r => r.json()).then(planData => {
            setPlan(planData.plan);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="loading-overlay" style={{ minHeight: '100vh' }}>
            <div className="spinner" style={{ width: 40, height: 40 }}></div>
        </div>
    );

    return (
        <div>
            

            <div className="page" style={{ maxWidth: 800 }}>
                <div className="page-header">
                    <h1 className="page-title">📅 AI Study Plan</h1>
                    <p className="page-subtitle">Your personalized study schedule for {plan?.date || 'today'}</p>
                </div>

                {/* Study Hours */}
                <div className="card mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3>Total Study Hours</h3>
                            <p className="text-muted text-sm">Recommended for optimal preparation</p>
                        </div>
                        <div className="stat-value">{plan?.totalStudyHours || 0}h</div>
                    </div>
                </div>

                {/* Timeline */}
                <div className="plan-timeline stagger">
                    {(plan?.plan || []).map((item, idx) => (
                        <div key={idx} className="plan-item">
                            <div className="plan-time">{item.time}</div>
                            <div style={{ flex: 1 }}>
                                <div className="plan-activity">{item.activity}</div>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={`plan-type ${item.type}`}>{item.type}</span>
                                    <span className="text-xs text-muted">{item.duration} min</span>
                                    <span className={`subject-badge ${item.subject?.toLowerCase()}`}>{item.subject}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recommendations */}
                {plan?.recommendations && (
                    <div className="card mt-6">
                        <h3 className="mb-4">💡 AI Recommendations</h3>
                        <div className="flex flex-col gap-2">
                            {plan.recommendations.map((rec, i) => (
                                <div key={i} style={{ padding: '10px 14px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>
                                    {rec}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex gap-3 mt-6">
                    <a href="/test/configure" className="btn btn-primary">📝 Start Practice Test</a>
                    <a href="/doubts" className="btn btn-secondary">🤖 Ask a Doubt</a>
                </div>
            </div>
        </div>
    );
}
