'use client';
import { Select } from '@/components/ui/Select';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

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
                <h1 style={{ fontWeight: 800, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    NCERT Library Manager
                </h1>
                <p style={{ marginTop: 8 }}>Upload and manage NCERT textbook PDFs for AI-powered learning.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 24 }}>
                {/* Upload Card */}
                <div style={{
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: 24, alignSelf: 'start'
                }}>
                    <h3 style={{ fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span><Icon name="Upload" /></span> Upload New Textbook
                    </h3>
                    <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <label style={{ display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Subject</label>
                                <Select value={meta.subjectId} onChange={e => setMeta({ ...meta, subjectId: e.target.value })} style={{
                                    width: '100%', padding: '10px 14px', border: '1px solid rgba(255,255,255,0.1)', outline: 'none'
                                }}>
                                    <option value="">Select</option>
                                    <option value="1">Physics</option>
                                    <option value="2">Chemistry</option>
                                    <option value="3">Biology</option>
                                </Select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Chapter ID</label>
                                <Input className="input" type="number" value={meta.chapterId} onChange={e => setMeta({ ...meta, chapterId: e.target.value })} placeholder="e.g. 101" style={{
                                    width: '100%', padding: '10px 14px', border: '1px solid rgba(255,255,255,0.1)', outline: 'none'
                                }} />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Book / Chapter Title</label>
                            <Input type="text" value={meta.title} onChange={e => setMeta({ ...meta, title: e.target.value })} placeholder="e.g. Electric Charges and Fields" style={{
                                width: '100%', padding: '10px 14px', border: '1px solid rgba(255,255,255,0.1)', outline: 'none'
                            }} />
                        </div>

                        {/* Drop Zone */}
                        <div
                            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={e => { e.preventDefault(); setDragOver(false); setFile(e.dataTransfer.files[0]); }}
                            style={{
                                padding: 32, border: `2px dashed ${dragOver ? 'var(--text-primary)' : 'var(--bg-glass)'}`,
                                textAlign: 'center', cursor: 'pointer',
                                background: dragOver ? 'var(--bg-glass)' : 'transparent',
                                transition: 'all 0.2s'
                            }}>
                            <Input type="file" accept="application/pdf" onChange={e => setFile(e.target.files[0])} style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }} id="ncert-upload" />
                            <label htmlFor="ncert-upload" style={{ cursor: 'pointer', display: 'block' }}>
                                <div style={{ marginBottom: 8 }}><Icon name="Star" size={16} /></div>
                                {file ? (
                                    <span style={{ fontWeight: 600 }}>{file.name}</span>
                                ) : (
                                    <>
                                        <p style={{ fontWeight: 500 }}>Drop PDF here or click to browse</p>
                                        <p style={{ marginTop: 4 }}>PDF files only, max 50MB</p>
                                    </>
                                )}
                            </label>
                        </div>

                        <Button type="submit" disabled={uploading} className="btn btn-primary" style={{ width: '100%', padding: 14, }}>
                            {uploading ? <><Icon name="Clock" size={16} /> Uploading...</> : <><Icon name="Upload" size={16} /> Upload PDF</>}
                        </Button>
                    </form>
                </div>

                {/* Library */}
                <div style={{
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: 24, }}>
                    <h3 style={{ fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span><Icon name="BookOpen" /></span> Uploaded Library
                        <span style={{ fontWeight: 600, marginLeft: 'auto' }}>{books.length} books</span>
                    </h3>

                    {loadingBooks ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
                            <div style={{ width: 28, height: 28, border: '2px solid #6366f1', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
                        </div>
                    ) : books.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 40 }}>
                            <div style={{ marginBottom: 12 }}><Icon name="Star" size={16} /></div>
                            <p style={{ fontWeight: 500 }}>No books uploaded yet</p>
                            <p style={{ marginTop: 4 }}>Upload your first NCERT PDF to get started</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {books.map((book, i) => {
                                const sc = getSubjectColor(book.subject_id);
                                return (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                                        border: '1px solid rgba(255,255,255,0.04)',
                                        transition: 'all 0.15s'
                                    }}>
                                        <div style={{
                                            width: 40, height: 40, display: 'flex',
                                            alignItems: 'center', justifyContent: 'center', background: sc.bg, border: `1px solid ${sc.border}`, flexShrink: 0
                                        }}><Icon name="Star" size={16} /></div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 600, }}>{book.title}</div>
                                            <div style={{ marginTop: 2 }}>
                                                Chapter {book.chapter_id} • {subjectMap[String(book.subject_id)] || `Subject ${book.subject_id}`}
                                            </div>
                                        </div>
                                        <span style={{
                                            padding: '4px 10px', fontWeight: 700, background: sc.bg, color: sc.color,
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
