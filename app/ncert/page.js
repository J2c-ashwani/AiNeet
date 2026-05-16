'use client';
import { Icon } from '@/components/ui/Icon';
import { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';

const SUBJECT_ICONS = { physics: '<Icon name="Zap" />', chemistry: '🧪', biology: '<Icon name="Dna" />' };
const SUBJECT_COLORS = { physics: '#6366f1', chemistry: '#06b6d4', biology: '#22c55e' };

export default function NCERTLibrary() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeSubject, setActiveSubject] = useState('all');
    const [activeClass, setActiveClass] = useState('all');
    const [expandedBook, setExpandedBook] = useState(null);

    const [generating, setGenerating] = useState(null);
    const [noPyqChapter, setNoPyqChapter] = useState(null);

    useEffect(() => {
        fetch('/api/ncert/library')
            .then(res => res.json())
            .then(data => { setBooks(data.books || []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const handleStartPyq = async (chapterName, pyqCount) => {
        setGenerating(chapterName);
        setNoPyqChapter(null);
        try {
            const res = await fetch('/api/tests/pyq', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    chapter_name: chapterName, 
                    questionCount: Math.min(20, pyqCount || 20) 
                })
            });
            const data = await res.json();
            if (res.ok) {
                sessionStorage.setItem('currentTest', JSON.stringify(data));
                window.location.href = `/test/${data.testId}`;
            } else if (res.status === 404) {
                setNoPyqChapter(chapterName);
                setTimeout(() => setNoPyqChapter(null), 4000);
            } else {
                alert(data.error || 'Failed to generate PYQ test. Try another chapter.');
            }
        } catch (error) {
            alert('Error generating test. Please try again.');
        }
        setGenerating(null);
    };

    let filtered = books;
    if (activeSubject !== 'all') filtered = filtered.filter(b => b.subject === activeSubject);
    if (activeClass !== 'all') filtered = filtered.filter(b => b.class === parseInt(activeClass));

    return (
        <div>
            
            <div className="page">
                <div className="page-header">
                    <h1 className="page-title"><Icon name="BookOpen" /> NCERT Smart Library</h1>
                    <p className="page-subtitle">Read chapter-wise PDFs from official NCERT. All books for NEET — Physics, Chemistry & Biology.</p>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                    {['all', 'physics', 'chemistry', 'biology'].map(s => (
                        <Button key={s} variant="ghost" onClick={() => setActiveSubject(s)} style={{
                            padding: '10px 20px', border: activeSubject === s ? `2px solid var(--primary)` : '2px solid var(--border)',
                            background: activeSubject === s ? `var(--primary-light, rgba(99, 102, 241, 0.1))` : 'var(--bg-glass)',
                            color: activeSubject === s ? 'var(--primary)' : 'var(--text-secondary)',
                            fontWeight: 700, textTransform: 'capitalize',
                        }}>
                            {s === 'all' ? '📖 All' : `${SUBJECT_ICONS[s]} ${s}`}
                        </Button>
                    ))}
                    <div style={{ borderLeft: '1px solid var(--border)', padding: '0 12px' }} />
                    {['all', '11', '12'].map(c => (
                        <Button key={c} variant="ghost" onClick={() => setActiveClass(c)} style={{
                            padding: '10px 20px', border: activeClass === c ? '2px solid var(--accent)' : '2px solid var(--border)',
                            background: activeClass === c ? 'var(--accent-light, rgba(245, 158, 11, 0.1))' : 'var(--bg-glass)',
                            color: activeClass === c ? 'var(--accent)' : 'var(--text-secondary)',
                            fontWeight: 700,
                        }}>
                            {c === 'all' ? 'All Classes' : `Class ${c}`}
                        </Button>
                    ))}
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                        <div className="spinner" style={{ width: 40, height: 40 }}></div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {filtered.map((book, i) => {
                            const isExpanded = expandedBook === i;
                            const color = SUBJECT_COLORS[book.subject] || 'var(--primary)';
                            return (
                                <div key={i} className="card" style={{ borderLeft: `4px solid ${color}`, transition: 'all 0.3s' }}>
                                    <div onClick={() => setExpandedBook(isExpanded ? null : i)}
                                        style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                            <span style={{ background: `${color}22`, padding: '10px 14px', }}>
                                                {SUBJECT_ICONS[book.subject] || '📖'}
                                            </span>
                                            <div>
                                                <div style={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1 }}>
                                                    Class {book.class} • {book.subject}
                                                </div>
                                                <div style={{ fontWeight: 800, }}>
                                                    {book.book}
                                                </div>
                                                <div style={{ marginTop: 4 }}>
                                                    {book.chapters.length} chapters
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <Button onClick={(e) => { e.stopPropagation(); setExpandedBook(isExpanded ? null : i); }}
                                                variant="secondary"
                                                size="sm"
                                                style={{ padding: '8px 16px', background: `${color}22`, color, fontWeight: 700, border: `1px solid ${color}44` }}>
                                                {isExpanded ? 'Collapse' : '📂 Chapter-wise'}
                                            </Button>
                                            <span style={{ transition: 'transform 0.3s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div style={{ marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
                                                {book.chapters.map(ch => (
                                                    <div key={ch.ch}
                                                        style={{
                                                            display: 'flex', flexDirection: 'column', gap: 12, padding: 16,
                                                            border: '1px solid var(--border)',
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                            <span style={{ background: `${color}22`, color, padding: '4px 10px', fontWeight: 800, minWidth: 40, textAlign: 'center' }}>
                                                                Ch {ch.ch}
                                                            </span>
                                                            <span style={{ fontWeight: 600, lineHeight: 1.3 }}>{ch.title}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                                                            <a href={`/ncert/${book.code}?ch=${ch.ch}`}
                                                                style={{ flex: 1, textAlign: 'center', padding: 10, background: `${color}22`, color, fontWeight: 700, textDecoration: 'none', border: `1px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                                                📖 Study PDF
                                                            </a>
                                                            {ch.pyqCount === 0 ? (
                                                                <div style={{ flex: 1, padding: 10, background: `var(--danger-light, rgba(239, 68, 68, 0.1))`, fontWeight: 600, border: `1px solid var(--danger)`, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.8 }}>
                                                                    No PYQs asked yet
                                                                </div>
                                                            ) : (
                                                                <Button
                                                                    onClick={() => handleStartPyq(ch.title, ch.pyqCount)}
                                                                    disabled={generating === ch.title || noPyqChapter === ch.title}
                                                                    variant="ghost"
                                                                    style={{ flex: 1, padding: 10, background: noPyqChapter === ch.title ? 'var(--danger-light, rgba(239, 68, 68, 0.1))' : 'var(--accent-light, rgba(245, 158, 11, 0.1))', color: noPyqChapter === ch.title ? 'var(--danger)' : 'var(--accent)', fontWeight: 700, border: noPyqChapter === ch.title ? '1px solid var(--danger)' : '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.3s' }}>
                                                                    {generating === ch.title ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2, borderTopColor: 'transparent' }}></span> : noPyqChapter === ch.title ? '<Icon name="XCircle" /> No PYQs Available' : `<Icon name="Target" /> Solve PYQs (${ch.pyqCount})`}
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
