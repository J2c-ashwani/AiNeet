'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

const SUBJECT_CONFIG = {
    physics: { icon: '⚡', color: '#6366f1', label: 'Physics', total: 45 },
    chemistry: { icon: '🧪', color: '#06b6d4', label: 'Chemistry', total: 45 },
    biology: { icon: '🧬', color: '#22c55e', label: 'Biology', total: 90 },
};

function HeatCell({ value, maxValue }) {
    const intensity = value / maxValue;
    const bg = intensity > 0.7 ? 'rgba(239,68,68,0.7)'
        : intensity > 0.4 ? 'rgba(245,158,11,0.5)'
            : intensity > 0 ? 'rgba(34,197,94,0.3)'
                : 'rgba(255,255,255,0.03)';
    return (
        <td style={{ background: bg, textAlign: 'center', padding: '8px 12px', fontWeight: value > 3 ? 800 : 500, color: '#f1f5f9', fontSize: '0.9rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            {value || '—'}
        </td>
    );
}

export default function BlueprintPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeSubject, setActiveSubject] = useState('biology'); // Default to biology since it has both
    const [viewType, setViewType] = useState('topic'); // 'topic' or 'chapter'

    useEffect(() => {
        setLoading(true);
        fetch(`/api/blueprint?viewType=${viewType}`)
            .then(res => res.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, [viewType]);

    if (loading) {
        return (
            <div><Navbar />
                <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <div className="spinner" style={{ width: 40, height: 40 }}></div>
                </div>
            </div>
        );
    }

    const years = data?.years || [2021, 2022, 2023, 2024];
    const subjectData = data?.data?.[activeSubject] || {};
    const cfg = SUBJECT_CONFIG[activeSubject];

    // Sort topics by total questions (most important first)
    const topics = Object.entries(subjectData)
        .map(([topic, yearData]) => ({
            topic,
            yearData,
            total: Object.values(yearData).reduce((a, b) => a + b, 0),
            avg: (Object.values(yearData).reduce((a, b) => a + b, 0) / years.length).toFixed(1),
        }))
        .sort((a, b) => b.total - a.total);

    const maxQ = Math.max(...topics.map(t => Math.max(...Object.values(t.yearData))));

    return (
        <div>
            <Navbar />
            <div className="page">
                <div className="page-header">
                    <h1 className="page-title">📊 NEET Exam Blueprint</h1>
                    <p className="page-subtitle">Historical question distribution across topics and chapters</p>
                </div>

                {/* View Type Toggle */}
                <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.05)', padding: 6, borderRadius: 12, width: 'fit-content', margin: '0 0 24px 0' }}>
                    <button
                        onClick={() => setViewType('topic')}
                        style={{
                            padding: '8px 24px', borderRadius: 8, fontSize: '0.9rem', fontWeight: 600,
                            background: viewType === 'topic' ? '#3b82f6' : 'transparent',
                            color: viewType === 'topic' ? '#fff' : '#94a3b8',
                            border: 'none', cursor: 'pointer', transition: 'all 0.2s'
                        }}
                    >
                        Topic-wise (2021-2024)
                    </button>
                    <button
                        onClick={() => setViewType('chapter')}
                        style={{
                            padding: '8px 24px', borderRadius: 8, fontSize: '0.9rem', fontWeight: 600,
                            background: viewType === 'chapter' ? '#8b5cf6' : 'transparent',
                            color: viewType === 'chapter' ? '#fff' : '#94a3b8',
                            border: 'none', cursor: 'pointer', transition: 'all 0.2s'
                        }}
                    >
                        Chapter-wise (2009-2025)
                    </button>
                </div>

                {/* Subject Tabs */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                    {Object.entries(SUBJECT_CONFIG).map(([key, cfg]) => (
                        <button
                            key={key}
                            onClick={() => setActiveSubject(key)}
                            style={{
                                padding: '12px 24px',
                                borderRadius: 12,
                                border: activeSubject === key ? `2px solid ${cfg.color}` : '2px solid rgba(255,255,255,0.1)',
                                background: activeSubject === key ? `${cfg.color}22` : 'rgba(255,255,255,0.03)',
                                color: activeSubject === key ? cfg.color : '#94a3b8',
                                fontWeight: 700,
                                fontSize: '1rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                        >
                            {cfg.icon} {cfg.label} ({cfg.total}Q)
                        </button>
                    ))}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-3 gap-4" style={{ marginBottom: 24 }}>
                    <div className="card" style={{ borderLeft: `4px solid ${cfg.color}` }}>
                        <div className="text-muted text-sm">Total Topics</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: cfg.color }}>{topics.length}</div>
                    </div>
                    <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
                        <div className="text-muted text-sm">Questions/Year</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f59e0b' }}>{cfg.total}</div>
                    </div>
                    <div className="card" style={{ borderLeft: '4px solid #ef4444' }}>
                        <div className="text-muted text-sm">Highest Weightage</div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ef4444' }}>
                            {topics[0]?.topic || '—'}
                            <span style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8' }}>
                                ~{topics[0]?.avg} Q/year avg
                            </span>
                        </div>
                    </div>
                </div>

                {/* Heatmap Legend */}
                <div style={{ display: 'flex', gap: 16, marginBottom: 16, alignItems: 'center', fontSize: '0.85rem', color: '#94a3b8' }}>
                    <span>Weightage:</span>
                    <span style={{ padding: '2px 10px', borderRadius: 4, background: 'rgba(34,197,94,0.3)' }}>Low (1-2)</span>
                    <span style={{ padding: '2px 10px', borderRadius: 4, background: 'rgba(245,158,11,0.5)' }}>Medium (3)</span>
                    <span style={{ padding: '2px 10px', borderRadius: 4, background: 'rgba(239,68,68,0.7)' }}>High (4+)</span>
                </div>

                {/* Blueprint Table */}
                <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                                <th style={{ textAlign: 'left', padding: '14px 16px', color: '#f1f5f9', fontWeight: 700, position: 'sticky', left: 0, background: '#0d1322', zIndex: 1 }}>
                                    Chapter / Topic
                                </th>
                                {years.map(y => (
                                    <th key={y} style={{ textAlign: 'center', padding: '14px 12px', color: cfg.color, fontWeight: 700 }}>
                                        {y}
                                    </th>
                                ))}
                                <th style={{ textAlign: 'center', padding: '14px 12px', color: '#f59e0b', fontWeight: 800 }}>Total</th>
                                <th style={{ textAlign: 'center', padding: '14px 12px', color: '#22c55e', fontWeight: 700 }}>Avg</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topics.map((t, i) => (
                                <tr key={t.topic} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                    <td style={{ padding: '10px 16px', fontWeight: 600, color: '#e2e8f0', position: 'sticky', left: 0, background: i % 2 === 0 ? '#0d1322' : '#111827', zIndex: 1, whiteSpace: 'nowrap' }}>
                                        <span style={{ color: '#64748b', marginRight: 8, fontSize: '0.8rem', fontWeight: 400 }}>#{i + 1}</span>
                                        {t.topic}
                                    </td>
                                    {years.map(y => (
                                        <HeatCell key={y} value={t.yearData[y] || 0} maxValue={maxQ} />
                                    ))}
                                    <td style={{ textAlign: 'center', padding: '10px 12px', fontWeight: 800, color: '#f59e0b', background: 'rgba(245,158,11,0.08)' }}>{t.total}</td>
                                    <td style={{ textAlign: 'center', padding: '10px 12px', fontWeight: 600, color: '#22c55e' }}>{t.avg}</td>
                                </tr>
                            ))}
                            {topics.length === 0 && (
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                    <td colSpan={years.length + 3} style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                                        <div style={{ fontSize: '2rem', marginBottom: 16 }}>🚧</div>
                                        <h3 style={{ margin: '0 0 8px', color: '#f1f5f9' }}>Data coming soon!</h3>
                                        <p style={{ margin: 0 }}>Chapter-wise data for {cfg.label} is currently being compiled by our experts.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pro Tip */}
                <div className="card" style={{ marginTop: 24, borderLeft: '4px solid #6366f1', background: 'rgba(99,102,241,0.05)' }}>
                    <p style={{ fontWeight: 700, color: '#6366f1', margin: '0 0 8px' }}>💡 Strategy Tip</p>
                    <p style={{ color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
                        Focus on the <strong style={{ color: '#ef4444' }}>red-highlighted chapters</strong> first — they consistently have 4+ questions per year.
                        Mastering the top 10 chapters in each subject can secure 60–70% of marks.
                        Use this data with your Study Plan to prioritize revision.
                    </p>
                </div>
            </div>
        </div>
    );
}
