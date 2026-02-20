
'use client';
import { useState, useEffect } from 'react';

export default function AdminNCERTPage() {
    const [file, setFile] = useState(null);
    const [meta, setMeta] = useState({ subjectId: '', chapterId: '', title: '' });
    const [uploading, setUploading] = useState(false);
    const [books, setBooks] = useState([]);
    const [loadingBooks, setLoadingBooks] = useState(true);
    const [dragOver, setDragOver] = useState(false);

    useEffect(() => { fetchBooks(); }, []);

    const fetchBooks = async () => {
        setLoadingBooks(true);
        try {
            const res = await fetch('/api/admin/ncert/list');
            if (res.ok) {
                const data = await res.json();
                setBooks(data.books || []);
            }
        } catch (e) { /* API may not exist yet */ }
        setLoadingBooks(false);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file || !meta.subjectId || !meta.chapterId || !meta.title) {
            alert('Please fill all fields');
            return;
        }
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('subjectId', meta.subjectId);
        formData.append('chapterId', meta.chapterId);
        formData.append('title', meta.title);
        try {
            const res = await fetch('/api/admin/ncert/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (res.ok) {
                setFile(null);
                setMeta({ subjectId: '', chapterId: '', title: '' });
                fetchBooks();
            } else {
                alert('Upload Failed: ' + data.error);
            }
        } catch (err) {
            console.error(err);
            alert('Upload Error');
        } finally { setUploading(false); }
    };

    const subjectMap = { '1': 'Physics', '2': 'Chemistry', '3': 'Biology' };
    const getSubjectColor = (id) => {
        switch (String(id)) {
            case '1': return { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: 'rgba(59,130,246,0.3)' };
            case '2': return { bg: 'rgba(16,185,129,0.12)', color: '#34d399', border: 'rgba(16,185,129,0.3)' };
            case '3': return { bg: 'rgba(249,115,22,0.12)', color: '#fb923c', border: 'rgba(249,115,22,0.3)' };
            default: return { bg: 'rgba(100,116,139,0.12)', color: '#94a3b8', border: 'rgba(100,116,139,0.3)' };
        }
    };

    return (
        <div style={{ padding: 32 }}>
            <header style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(135deg, #6366f1, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    NCERT Library Manager
                </h1>
                <p style={{ color: '#64748b', marginTop: 8 }}>Upload and manage NCERT textbook PDFs for AI-powered learning.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 24 }}>
                {/* Upload Card */}
                <div style={{
                    background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 16, padding: 24, backdropFilter: 'blur(20px)', alignSelf: 'start'
                }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>📤</span> Upload New Textbook
                    </h3>
                    <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Subject</label>
                                <select value={meta.subjectId} onChange={e => setMeta({ ...meta, subjectId: e.target.value })} style={{
                                    width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,0.4)',
                                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
                                    color: '#f1f5f9', fontSize: '0.9rem', outline: 'none'
                                }}>
                                    <option value="">Select</option>
                                    <option value="1">Physics</option>
                                    <option value="2">Chemistry</option>
                                    <option value="3">Biology</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Chapter ID</label>
                                <input className="input" type="number" value={meta.chapterId} onChange={e => setMeta({ ...meta, chapterId: e.target.value })} placeholder="e.g. 101" style={{
                                    width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,0.4)',
                                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
                                    color: '#f1f5f9', fontSize: '0.9rem', outline: 'none'
                                }} />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Book / Chapter Title</label>
                            <input type="text" value={meta.title} onChange={e => setMeta({ ...meta, title: e.target.value })} placeholder="e.g. Electric Charges and Fields" style={{
                                width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,0.4)',
                                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
                                color: '#f1f5f9', fontSize: '0.9rem', outline: 'none'
                            }} />
                        </div>

                        {/* Drop Zone */}
                        <div
                            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={e => { e.preventDefault(); setDragOver(false); setFile(e.dataTransfer.files[0]); }}
                            style={{
                                padding: 32, border: `2px dashed ${dragOver ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
                                borderRadius: 14, textAlign: 'center', cursor: 'pointer',
                                background: dragOver ? 'rgba(99,102,241,0.05)' : 'transparent',
                                transition: 'all 0.2s'
                            }}>
                            <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files[0])} style={{ display: 'none' }} id="ncert-upload" />
                            <label htmlFor="ncert-upload" style={{ cursor: 'pointer', display: 'block' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>📄</div>
                                {file ? (
                                    <span style={{ color: '#60a5fa', fontWeight: 600 }}>{file.name}</span>
                                ) : (
                                    <>
                                        <p style={{ color: '#94a3b8', fontWeight: 500 }}>Drop PDF here or click to browse</p>
                                        <p style={{ color: '#475569', fontSize: '0.75rem', marginTop: 4 }}>PDF files only, max 50MB</p>
                                    </>
                                )}
                            </label>
                        </div>

                        <button type="submit" disabled={uploading} className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '0.9rem' }}>
                            {uploading ? '⏳ Uploading...' : '📤 Upload PDF'}
                        </button>
                    </form>
                </div>

                {/* Library */}
                <div style={{
                    background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 16, padding: 24, backdropFilter: 'blur(20px)'
                }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>📚</span> Uploaded Library
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginLeft: 'auto' }}>{books.length} books</span>
                    </h3>

                    {loadingBooks ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
                            <div style={{ width: 28, height: 28, border: '2px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                        </div>
                    ) : books.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 40 }}>
                            <div style={{ fontSize: '3rem', marginBottom: 12 }}>📖</div>
                            <p style={{ color: '#475569', fontWeight: 500 }}>No books uploaded yet</p>
                            <p style={{ color: '#334155', fontSize: '0.8rem', marginTop: 4 }}>Upload your first NCERT PDF to get started</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {books.map((book, i) => {
                                const sc = getSubjectColor(book.subject_id);
                                return (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                                        background: 'rgba(255,255,255,0.03)', borderRadius: 12,
                                        border: '1px solid rgba(255,255,255,0.04)',
                                        transition: 'all 0.15s'
                                    }}>
                                        <div style={{
                                            width: 40, height: 40, borderRadius: 10, display: 'flex',
                                            alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
                                            background: sc.bg, border: `1px solid ${sc.border}`, flexShrink: 0
                                        }}>📘</div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#e2e8f0' }}>{book.title}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: 2 }}>
                                                Chapter {book.chapter_id} • {subjectMap[String(book.subject_id)] || `Subject ${book.subject_id}`}
                                            </div>
                                        </div>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: 20, fontSize: '0.65rem',
                                            fontWeight: 700, background: sc.bg, color: sc.color,
                                            border: `1px solid ${sc.border}`, textTransform: 'uppercase'
                                        }}>
                                            {subjectMap[String(book.subject_id)] || 'Other'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
