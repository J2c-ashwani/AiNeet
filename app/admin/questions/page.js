
'use client';
import { useState, useEffect } from 'react';

export default function AdminQuestionsPage() {
    const [activeTab, setActiveTab] = useState('reports'); // 'reports' | 'all'
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    // New Question Form State
    const [newQ, setNewQ] = useState({
        text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A',
        subject_id: 1, chapter_id: 1, topic_id: 1, difficulty: 'medium',
        is_pyq: false, exam_name: '', year_asked: ''
    });

    useEffect(() => {
        fetchQuestions();
    }, [activeTab, search]);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const url = `/api/admin/questions?mode=${activeTab}&search=${search}`;
            const res = await fetch(url);
            const data = await res.json();
            if (res.ok) setQuestions(data.questions);
        } catch (error) {
            console.error('Failed to fetch', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this question?')) return;
        try {
            await fetch(`/api/admin/questions?id=${id}`, { method: 'DELETE' });
            fetchQuestions(); // Refresh
        } catch (e) { alert('Failed to delete'); }
    };

    const handleAddSubmit = async () => {
        try {
            const res = await fetch('/api/admin/questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newQ)
            });
            if (res.ok) {
                alert('Question Added!');
                setShowAddModal(false);
                if (activeTab === 'all') fetchQuestions();
            } else {
                const d = await res.json();
                alert(d.error);
            }
        } catch (e) { alert('Failed to add'); }
    };

    return (
        <div className="p-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Question Manager</h1>
                    <div className="flex gap-6 mt-4">
                        <button className={`pb-2 text-sm font-medium transition-all duration-300 border-b-2 ${activeTab === 'reports' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                            onClick={() => setActiveTab('reports')}>
                            Quality Control 🚩
                        </button>
                        <button className={`pb-2 text-sm font-medium transition-all duration-300 border-b-2 ${activeTab === 'all' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                            onClick={() => setActiveTab('all')}>
                            Question Bank 📚
                        </button>
                    </div>
                </div>
                <button className="btn btn-primary shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] transition-shadow" onClick={() => setShowAddModal(true)}>
                    + Add Question
                </button>
            </header>

            {/* Toolbar for 'All' tab */}
            {activeTab === 'all' && (
                <div className="mb-6 flex gap-3">
                    <div className="relative flex-1 max-w-md group">
                        <div className="absolute inset-0 bg-accent/20 blur-md rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                        <input
                            type="text"
                            placeholder="Search questions..."
                            className="relative w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-accent/50 text-white placeholder-gray-600 transition-colors"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-secondary" onClick={fetchQuestions}>Search</button>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="space-y-3">
                    {questions.map(q => (
                        <div key={q.id} className="group flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-accent/30 hover:bg-white/10 transition-all duration-300 relative overflow-hidden">
                            {/* Hover Glow */}
                            <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                            {/* ID & Icon */}
                            <div className="relative z-10 flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-black/40 border border-white/10 shrink-0">
                                <span className="text-[10px] text-gray-500 font-mono">#{q.id}</span>
                                <span className="text-xl">{q.is_pyq ? '🏛️' : '📝'}</span>
                            </div>

                            {/* Content */}
                            <div className="relative z-10 flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                    {q.is_pyq && (
                                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]">
                                            PYQ {q.year_asked}
                                        </span>
                                    )}
                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${q.difficulty === 'hard' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                        q.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                            'bg-green-500/10 text-green-400 border-green-500/20'
                                        }`}>
                                        {q.difficulty || 'Medium'}
                                    </span>
                                    {q.is_ai_generated === 1 && (
                                        <>
                                            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                                                ⚡ AI
                                            </span>
                                            {q.confidence_score > 0 && (
                                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${q.confidence_score >= 85 ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                        q.confidence_score >= 50 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                            'bg-red-500/10 text-red-400 border-red-500/20'
                                                    }`}>
                                                    {q.confidence_score}% Trust
                                                </span>
                                            )}
                                        </>
                                    )}
                                </div>
                                <p className="text-gray-200 line-clamp-1 font-medium group-hover:text-white transition-colors">{q.text}</p>
                                <p className="text-xs text-gray-600 mt-1 flex gap-3">
                                    <span>Topic: <span className="text-gray-400">{q.topic_id}</span></span>
                                    <span>Correct: <span className="text-green-400 font-bold">{q.correct_option}</span></span>
                                </p>
                            </div>

                            {/* Reports Info */}
                            {activeTab === 'reports' && (
                                <div className="hidden md:block w-48 text-right relative z-10">
                                    <p className="text-xs text-red-300 font-medium bg-red-900/20 px-2 py-1 rounded border border-red-500/20 inline-block">
                                        {q.reasons ? q.reasons.split(',')[0] : 'Reported'}
                                    </p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="relative z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                <button className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors border border-blue-500/20" title="Edit">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </button>
                                <button onClick={() => handleDelete(q.id)} className="p-2.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors border border-red-500/20" title="Delete">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#0f0f1a] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center">
                            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Add New Question</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-white">✕</button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500 uppercase">Subject ID</label>
                                    <input className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-accent" type="number"
                                        value={newQ.subject_id} onChange={e => setNewQ({ ...newQ, subject_id: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500 uppercase">Chapter ID</label>
                                    <input className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-accent" type="number"
                                        value={newQ.chapter_id} onChange={e => setNewQ({ ...newQ, chapter_id: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500 uppercase">Topic ID</label>
                                    <input className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-accent" type="number"
                                        value={newQ.topic_id} onChange={e => setNewQ({ ...newQ, topic_id: e.target.value })} />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs text-gray-500 uppercase">Difficulty</label>
                                <select className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-accent"
                                    value={newQ.difficulty} onChange={e => setNewQ({ ...newQ, difficulty: e.target.value })}>
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs text-gray-500 uppercase">Question Text</label>
                                <textarea className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-accent min-h-[100px]"
                                    value={newQ.text} onChange={e => setNewQ({ ...newQ, text: e.target.value })}></textarea>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {['A', 'B', 'C', 'D'].map(opt => (
                                    <div key={opt} className="space-y-1">
                                        <label className="text-xs text-gray-500 uppercase">Option {opt}</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-gray-600 font-bold">{opt}</span>
                                            <input className="w-full bg-black/50 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-white focus:border-accent"
                                                value={newQ[`option_${opt.toLowerCase()}`]}
                                                onChange={e => setNewQ({ ...newQ, [`option_${opt.toLowerCase()}`]: e.target.value })} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs text-gray-500 uppercase">Correct Option</label>
                                <select className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-accent"
                                    value={newQ.correct_option} onChange={e => setNewQ({ ...newQ, correct_option: e.target.value })}>
                                    <option value="A">Option A</option>
                                    <option value="B">Option B</option>
                                    <option value="C">Option C</option>
                                    <option value="D">Option D</option>
                                </select>
                            </div>

                            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="w-5 h-5 rounded border-gray-600 text-accent focus:ring-accent bg-gray-700"
                                        checked={newQ.is_pyq} onChange={e => setNewQ({ ...newQ, is_pyq: e.target.checked })} />
                                    <span className="font-medium text-white">Is Previous Year Question (PYQ)?</span>
                                </label>
                                {newQ.is_pyq && (
                                    <div className="grid grid-cols-2 gap-4 mt-3 animate-fade-in-down">
                                        <input className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-accent"
                                            placeholder="Exam Name (e.g. NEET)" value={newQ.exam_name} onChange={e => setNewQ({ ...newQ, exam_name: e.target.value })} />
                                        <input className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-accent"
                                            placeholder="Year (e.g. 2023)" value={newQ.year_asked} onChange={e => setNewQ({ ...newQ, year_asked: e.target.value })} />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                            <button className="btn btn-ghost hover:bg-white/5" onClick={() => setShowAddModal(false)}>Cancel</button>
                            <button className="btn btn-primary px-8" onClick={handleAddSubmit}>Save Question</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
