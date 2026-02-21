'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

const SUBJECT_ICONS = { physics: '⚡', chemistry: '🧪', biology: '🧬' };
const SUBJECT_COLORS = { physics: '#6366f1', chemistry: '#06b6d4', biology: '#22c55e' };

export default function NCERTLibrary() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeSubject, setActiveSubject] = useState('all');
    const [activeClass, setActiveClass] = useState('all');
    const [expandedBook, setExpandedBook] = useState(null);

    useEffect(() => {
        fetch('/api/ncert/library')
            .then(res => res.json())
            .then(data => { setBooks(data.books || []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    let filtered = books;
    if (activeSubject !== 'all') filtered = filtered.filter(b => b.subject === activeSubject);
    if (activeClass !== 'all') filtered = filtered.filter(b => b.class === parseInt(activeClass));

    return (
        <div>
            <Navbar />
            <div className="page">
                <div className="page-header">
                    <h1 className="page-title">📚 NCERT Smart Library</h1>
                    <p className="page-subtitle">Read chapter-wise PDFs from official NCERT. All books for NEET — Physics, Chemistry & Biology.</p>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                    {['all', 'physics', 'chemistry', 'biology'].map(s => (
                        <button key={s} onClick={() => setActiveSubject(s)} style={{
                            padding: '10px 20px', borderRadius: 10,
                            border: activeSubject === s ? `2px solid ${SUBJECT_COLORS[s] || '#6366f1'}` : '2px solid rgba(255,255,255,0.1)',
                            background: activeSubject === s ? `${SUBJECT_COLORS[s] || '#6366f1'}22` : 'rgba(255,255,255,0.03)',
                            color: activeSubject === s ? (SUBJECT_COLORS[s] || '#6366f1') : '#94a3b8',
                            fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize',
                        }}>
                            {s === 'all' ? '📖 All' : `${SUBJECT_ICONS[s]} ${s}`}
                        </button>
                    ))}
                    <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', padding: '0 12px' }} />
                    {['all', '11', '12'].map(c => (
                        <button key={c} onClick={() => setActiveClass(c)} style={{
                            padding: '10px 20px', borderRadius: 10,
                            border: activeClass === c ? '2px solid #f59e0b' : '2px solid rgba(255,255,255,0.1)',
                            background: activeClass === c ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.03)',
                            color: activeClass === c ? '#f59e0b' : '#94a3b8',
                            fontWeight: 700, cursor: 'pointer',
                        }}>
                            {c === 'all' ? 'All Classes' : `Class ${c}`}
                        </button>
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
                            const color = SUBJECT_COLORS[book.subject] || '#6366f1';
                            return (
                                <div key={i} className="card" style={{ borderLeft: `4px solid ${color}`, transition: 'all 0.3s' }}>
                                    <div onClick={() => setExpandedBook(isExpanded ? null : i)}
                                        style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                            <span style={{ fontSize: '2rem', background: `${color}22`, padding: '10px 14px', borderRadius: 12 }}>
                                                {SUBJECT_ICONS[book.subject] || '📖'}
                                            </span>
                                            <div>
                                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1 }}>
                                                    Class {book.class} • {book.subject}
                                                </div>
                                                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f1f5f9' }}>
                                                    {book.book}
                                                </div>
                                                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 4 }}>
                                                    {book.chapters.length} chapters
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <a href={book.bookUrl} target="_blank" rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                style={{ padding: '8px 16px', borderRadius: 8, background: `${color}22`, color, fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', border: `1px solid ${color}44` }}>
                                                📥 Full Book
                                            </a>
                                            <span style={{ color: '#64748b', fontSize: '1.5rem', transition: 'transform 0.3s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div style={{ marginTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
                                                {book.chapters.map(ch => (
                                                    <Link key={ch.ch} href={`/ncert/${book.code}?ch=${ch.ch}`}
                                                        style={{
                                                            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                                                            borderRadius: 10, background: 'rgba(255,255,255,0.03)',
                                                            border: '1px solid rgba(255,255,255,0.06)',
                                                            textDecoration: 'none', color: '#e2e8f0',
                                                            transition: 'all 0.2s',
                                                        }}
                                                        onMouseEnter={e => { e.currentTarget.style.background = `${color}11`; e.currentTarget.style.borderColor = `${color}44`; }}
                                                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                                                    >
                                                        <span style={{ background: `${color}22`, color, padding: '4px 10px', borderRadius: 6, fontWeight: 800, fontSize: '0.8rem', minWidth: 36, textAlign: 'center' }}>
                                                            Ch {ch.ch}
                                                        </span>
                                                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{ch.title}</span>
                                                        <span style={{ marginLeft: 'auto', color: '#64748b', fontSize: '0.8rem' }}>PDF →</span>
                                                    </Link>
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
