'use client';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import React, { useState, useEffect } from 'react';

const SUBJECT_CONFIG = {
    physics: { icon: 'Zap', color: '#6366f1', label: 'Physics', total: 45 },
    chemistry: { icon: 'Atom', color: '#06b6d4', label: 'Chemistry', total: 45 },
    biology: { icon: 'Dna', color: '#22c55e', label: 'Biology', total: 90 },
};

function HeatCell({ value, maxValue }) {
    const intensity = value / maxValue;
    const bg = intensity > 0.7 ? 'rgba(239,68,68,0.7)'
        : intensity > 0.4 ? 'rgba(245,158,11,0.5)'
            : intensity > 0 ? 'rgba(34,197,94,0.3)'
                : 'rgba(255,255,255,0.03)';
    return (
        <td style={{ background: bg, textAlign: 'center', padding: '8px 12px', fontWeight: value > 3 ? 800 : 500, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            {value || '—'}
        </td>
    );
}

export default function BlueprintPageContent() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeSubject, setActiveSubject] = useState('biology'); // Default to biology since it has both
    const [viewType, setViewType] = useState('topic'); // 'topic' or 'chapter'
    const [expandedChapters, setExpandedChapters] = useState({});

    useEffect(() => {
        setLoading(true);
        fetch(`/api/blueprint?viewType=${viewType}`)
            .then(res => res.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, [viewType]);

    if (loading) {
        return (
            <div>
                <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <div className="spinner" style={{ width: 40, height: 40 }}></div>
                </div>
            </div>
        );
    }

    const years = data?.years || [2021, 2022, 2023, 2024];
    const subjectData = data?.data?.[activeSubject] || {};
    const cfg = SUBJECT_CONFIG[activeSubject];

    // Sort chapters by total questions (most important first)
    const processedChapters = Object.entries(subjectData)
        .map(([chapter, yearDataOrTopics]) => {
            // Check if this chapter has nested topics (like Zoology) or flat data (like Botany)
            const isNested = typeof Object.values(yearDataOrTopics)[0] === 'object';

            let total = 0;
            let aggYearData = {};
            let subTopics = [];

            if (isNested) {
                // Initialize aggYearData with 0s
                years.forEach(y => aggYearData[y] = 0);

                Object.entries(yearDataOrTopics).forEach(([topicTitle, topicYears]) => {
                    let topicTotal = 0;
                    Object.entries(topicYears).forEach(([y, val]) => {
                        aggYearData[y] += val;
                        topicTotal += val;
                    });
                    total += topicTotal;
                    subTopics.push({
                        topic: topicTitle,
                        yearData: topicYears,
                        total: topicTotal,
                        avg: (topicTotal / years.length).toFixed(1)
                    });
                });

                // Sort subtopics by highest weightage internally
                subTopics.sort((a, b) => b.total - a.total);
            } else {
                aggYearData = yearDataOrTopics;
                total = Object.values(yearDataOrTopics).reduce((a, b) => a + b, 0);
            }

            return {
                chapter,
                yearData: aggYearData,
                total,
                avg: (total / years.length).toFixed(1),
                isNested,
                subTopics,
            };
        })
        .sort((a, b) => b.total - a.total);

    const maxQ = Math.max(...processedChapters.map(c => Math.max(...Object.values(c.yearData))));

    const toggleChapter = (chapter) => {
        setExpandedChapters(prev => ({ ...prev, [chapter]: !prev[chapter] }));
    };

    return (
        <div>
            
            <div className="page">
                <div className="page-header">
                    <h1 className="page-title"><Icon name="BarChart2" /> NEET Exam Blueprint</h1>
                    <p className="page-subtitle">Historical question distribution across topics and chapters</p>
                </div>

                {/* View Type Toggle */}
                <div style={{ display: 'flex', gap: 4, padding: 6, width: 'fit-content', margin: '0 0 24px 0' }}>
                    <Button
                        onClick={() => setViewType('topic')}
                        style={{
                            padding: '8px 24px', fontWeight: 600,
                            background: viewType === 'topic' ? 'var(--text-primary)' : 'transparent',
                            color: viewType === 'topic' ? 'var(--text-primary)' : 'var(--text-primary)',
                            border: 'none', cursor: 'pointer', transition: 'all 0.2s'
                        }}
                    >
                        Topic-wise (2021-2024)
                    </Button>
                    <Button
                        onClick={() => setViewType('chapter')}
                        style={{
                            padding: '8px 24px', fontWeight: 600,
                            background: viewType === 'chapter' ? 'var(--text-primary)' : 'transparent',
                            color: viewType === 'chapter' ? 'var(--text-primary)' : 'var(--text-primary)',
                            border: 'none', cursor: 'pointer', transition: 'all 0.2s'
                        }}
                    >
                        Chapter-wise (2009-2025)
                    </Button>
                </div>

                {/* Subject Tabs */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                    {Object.entries(SUBJECT_CONFIG).map(([key, cfg]) => (
                        <Button
                            key={key}
                            onClick={() => setActiveSubject(key)}
                            style={{
                                padding: '12px 24px',
                                border: activeSubject === key ? `2px solid ${cfg.color}` : '2px solid rgba(255,255,255,0.1)',
                                background: activeSubject === key ? `${cfg.color}22` : 'var(--bg-glass)',
                                color: activeSubject === key ? cfg.color : 'var(--text-primary)',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                        >
                            <Icon name={cfg.icon} size={18} /> {cfg.label} ({cfg.total}Q)
                        </Button>
                    ))}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-3 gap-4" style={{ marginBottom: 24 }}>
                    <div className="card" style={{ borderLeft: `4px solid ${cfg.color}` }}>
                        <div className="text-muted text-sm">Total Chapters</div>
                        <div style={{ fontWeight: 900, color: cfg.color }}>{processedChapters.length}</div>
                    </div>
                    <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
                        <div className="text-muted text-sm">Questions/Year</div>
                        <div style={{ fontWeight: 900, }}>{cfg.total}</div>
                    </div>
                    <div className="card" style={{ borderLeft: '4px solid #ef4444' }}>
                        <div className="text-muted text-sm">Highest Weightage</div>
                        <div style={{ fontWeight: 700, }}>
                            {processedChapters[0]?.chapter || '—'}
                            <span style={{ display: 'block', }}>
                                ~{processedChapters[0]?.avg} Q/year avg
                            </span>
                        </div>
                    </div>
                </div>

                {/* Heatmap Legend */}
                <div style={{ display: 'flex', gap: 16, marginBottom: 16, alignItems: 'center', }}>
                    <span>Weightage:</span>
                    <span style={{ padding: '2px 10px', }}>Low (1-2)</span>
                    <span style={{ padding: '2px 10px', }}>Medium (3)</span>
                    <span style={{ padding: '2px 10px', }}>High (4+)</span>
                </div>

                {/* Blueprint Table */}
                <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', }}>
                        <thead>
                            <tr >
                                <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 700, position: 'sticky', left: 0, }}>
                                    Chapter / Topic
                                </th>
                                {years.map(y => (
                                    <th key={y} style={{ textAlign: 'center', padding: '14px 12px', color: cfg.color, fontWeight: 700 }}>
                                        {y}
                                    </th>
                                ))}
                                <th style={{ textAlign: 'center', padding: '14px 12px', fontWeight: 800 }}>Total</th>
                                <th style={{ textAlign: 'center', padding: '14px 12px', fontWeight: 700 }}>Avg</th>
                            </tr>
                        </thead>
                        <tbody>
                            {processedChapters.map((c, i) => (
                                <React.Fragment key={c.chapter}>
                                    <tr
                                        onClick={() => c.isNested && toggleChapter(c.chapter)}
                                        style={{
                                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                                            cursor: c.isNested ? 'pointer' : 'default',
                                            transition: 'background 0.2s',
                                        }}
                                        onMouseEnter={(e) => c.isNested && (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                                        onMouseLeave={(e) => c.isNested && (e.currentTarget.style.background = 'transparent')}
                                    >
                                        <td style={{ padding: '10px 16px', fontWeight: 600, position: 'sticky', left: 0, background: i % 2 === 0 ? 'var(--text-primary)' : 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                                            <span style={{ marginRight: 8, fontWeight: 400 }}>#{i + 1}</span>
                                            {c.isNested && (
                                                <span style={{ display: 'inline-block', width: 20, verticalAlign: 'middle', userSelect: 'none' }}>
                                                    {expandedChapters[c.chapter] ? '▾' : '▸'}
                                                </span>
                                            )}
                                            {c.chapter}
                                        </td>
                                        {years.map(y => (
                                            <HeatCell key={y} value={c.yearData[y] || 0} maxValue={maxQ} />
                                        ))}
                                        <td style={{ textAlign: 'center', padding: '10px 12px', fontWeight: 800, }}>{c.total}</td>
                                        <td style={{ textAlign: 'center', padding: '10px 12px', fontWeight: 600, }}>{c.avg}</td>
                                    </tr>

                                    {/* Render Subtopics if expanded */}
                                    {c.isNested && expandedChapters[c.chapter] && c.subTopics.map((topic, tIdx) => (
                                        <tr key={topic.topic} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                            <td style={{ padding: '8px 16px 8px 48px', fontWeight: 400, position: 'sticky', left: 0, whiteSpace: 'nowrap' }}>
                                                <span style={{ marginRight: 6 }}>↳</span> {topic.topic}
                                            </td>
                                            {years.map(y => (
                                                <HeatCell key={`sub-${y}`} value={topic.yearData[y] || 0} maxValue={maxQ} />
                                            ))}
                                            <td style={{ textAlign: 'center', padding: '8px 12px', fontWeight: 600, }}>{topic.total}</td>
                                            <td style={{ textAlign: 'center', padding: '8px 12px', fontWeight: 500, }}>{topic.avg}</td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                            {processedChapters.length === 0 && (
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                    <td colSpan={years.length + 3} style={{ padding: 60, textAlign: 'center', }}>
                                        <div style={{ marginBottom: 16 }}><Icon name="Star" size={16} /></div>
                                        <h3 style={{ margin: '0 0 8px', }}>Data coming soon!</h3>
                                        <p style={{ margin: 0 }}>Chapter-wise data for {cfg.label} is currently being compiled by our experts.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pro Tip */}
                <div className="card" style={{ marginTop: 24, borderLeft: '4px solid #6366f1', }}>
                    <p style={{ fontWeight: 700, margin: '0 0 8px' }}><Icon name="Star" size={16} /> Strategy Tip</p>
                    <p style={{ margin: 0, lineHeight: 1.6 }}>
                        Focus on the <strong>red-highlighted chapters</strong> first — they consistently have 4+ questions per year.
                        Mastering the top 10 chapters in each subject can secure 60–70% of marks.
                        Use this data with your Study Plan to prioritize revision.
                    </p>
                </div>
            </div>
        </div>
    );
}
