'use client';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

import { useState, useEffect } from 'react';

export default function AdminQuestionsPage() {
    const [activeTab, setActiveTab] = useState('reports'); // 'reports' | 'all'
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingQuestionId, setEditingQuestionId] = useState(null);
    const [formError, setFormError] = useState('');

    // New Question Form State
    const [newQ, setNewQ] = useState({
        text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A',
        subject_id: 1, chapter_id: 1, topic_id: 1, difficulty: 'medium',
        is_pyq: false, exam_name: '', year_asked: ''
    });
    const emptyQuestion = {
        text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A',
        subject_id: 1, chapter_id: 1, topic_id: 1, difficulty: 'medium',
        is_pyq: false, exam_name: '', year_asked: ''
    };

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
            const res = await fetch(`/api/admin/questions?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete question');
            fetchQuestions(); // Refresh
        } catch (e) { setFormError('Failed to delete this question. Please try again.'); }
    };

    const openAddModal = () => {
        setEditingQuestionId(null);
        setNewQ(emptyQuestion);
        setFormError('');
        setShowAddModal(true);
    };

    const openEditModal = (question) => {
        setEditingQuestionId(question.id);
        setNewQ({
            text: question.text || '',
            option_a: question.option_a || '',
            option_b: question.option_b || '',
            option_c: question.option_c || '',
            option_d: question.option_d || '',
            correct_option: (question.correct_option || 'A').toUpperCase(),
            subject_id: question.subject_id || 1,
            chapter_id: question.chapter_id || 1,
            topic_id: question.topic_id || 1,
            difficulty: question.difficulty || 'medium',
            is_pyq: Boolean(question.is_pyq),
            exam_name: question.exam_name || '',
            year_asked: question.year_asked || ''
        });
        setFormError('');
        setShowAddModal(true);
    };

    const handleAddSubmit = async () => {
        setFormError('');
        try {
            const res = await fetch('/api/admin/questions', {
                method: editingQuestionId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingQuestionId ? {
                    ...newQ,
                    id: editingQuestionId,
                    change_reason: 'Admin edit from question manager',
                } : newQ)
            });
            if (res.ok) {
                setShowAddModal(false);
                setEditingQuestionId(null);
                setNewQ(emptyQuestion);
                fetchQuestions();
            } else {
                const d = await res.json();
                setFormError(d.error || 'Unable to save question.');
            }
        } catch (e) { setFormError('Unable to save question. Please try again.'); }
    };

    return (
        <div className="space_pa_8">
            <header className="flex justify-between items-center space_mb_8">
                <div>
                    <h1 className="text-3xl font-bold space_mb_2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Question Manager</h1>
                    <div className="flex gap-6 space_mt_4">
                        <Button className={`pb-2 text-sm font-medium transition-all duration-300 border-b-2 ${activeTab === 'reports' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                            onClick={() => setActiveTab('reports')}>
                            Quality Control 🚩
                        </Button>
                        <Button className={`pb-2 text-sm font-medium transition-all duration-300 border-b-2 ${activeTab === 'all' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                            onClick={() => setActiveTab('all')}>
                            Question Bank <Icon name="BookOpen" />
                        </Button>
                    </div>
                </div>
                <Button className="btn btn-primary shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] transition-shadow" onClick={openAddModal}>
                    + Add Question
                </Button>
            </header>

            {formError && (
                <div className="space_mb_4 space_pa_3 radius_lg border line_red_500_20 surface_red_900_20 tone_red_300">
                    {formError}
                </div>
            )}

            {/* Toolbar for 'All' tab */}
            {activeTab === 'all' && (
                <div className="space_mb_6 flex gap-3">
                    <div className="relative flex-1 max-w-md group">
                        <div className="absolute inset-0 bg-accent/20 blur-md radius_lg opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                        <Input
                            type="text"
                            placeholder="Search questions..."
                            className="relative w-full surface_black_50 border line_white_10 radius_lg space_px_4 space_py_3 focus:outline-none focus:border-accent/50 tone_white placeholder-gray-600 transition-colors"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button className="btn btn-secondary" onClick={fetchQuestions}>Search</Button>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center space_pa_12">
                    <div className="w-8 h-8 border-2 border-accent border-t-transparent radius_full animate-spin"></div>
                </div>
            ) : (
                <div className="space-y-3">
                    {questions.map(q => (
                        <div key={q.id} className="group flex items-center gap-4 space_pa_4 radius_xl surface_white_5 border line_white_5 hover:border-accent/30 hover_surface_white_10 transition-all duration-300 relative overflow-hidden">
                            {/* Hover Glow */}
                            <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                            {/* ID & Icon */}
                            <div className="relative z-10 flex flex-col items-center justify-center w-14 h-14 radius_lg surface_black_40 border line_white_10 shrink-0">
                                <span className="text-[10px] tone_gray_500 font-mono">#{q.id}</span>
                                <span className="text-xl">{q.is_pyq ? '🏛️' : <Icon name="FileText" size={24} />}</span>
                            </div>

                            {/* Content */}
                            <div className="relative z-10 flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 space_mb_1_5">
                                    {q.is_pyq && (
                                        <span className="space_px_2 space_py_0_5 rounded text-[10px] uppercase font-bold tracking-wider surface_purple_500_10 tone_purple_400 border line_purple_500_20 shadow-[0_0_10px_rgba(168,85,247,0.1)]">
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
                                            <span className="space_px_2 space_py_0_5 rounded text-[10px] uppercase font-bold tracking-wider surface_blue_500_10 tone_blue_400 border line_blue_500_20 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                                                <Icon name="Zap" /> AI
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
                                <p className="tone_gray_200 line-clamp-1 font-medium group-hover_tone_white transition-colors">{q.text}</p>
                                <p className="text-xs tone_gray_600 space_mt_1 flex gap-3">
                                    <span>Topic: <span className="tone_gray_400">{q.topic_id}</span></span>
                                    <span>Correct: <span className="tone_green_400 font-bold">{q.correct_option}</span></span>
                                </p>
                            </div>

                            {/* Reports Info */}
                            {activeTab === 'reports' && (
                                <div className="hidden md:block w-48 text-right relative z-10">
                                    <p className="text-xs tone_red_300 font-medium surface_red_900_20 space_px_2 space_py_1 rounded border line_red_500_20 inline-block">
                                        {q.reasons ? q.reasons.split(',')[0] : 'Reported'}
                                    </p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="relative z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                <Button onClick={() => openEditModal(q)} className="space_pa_2_5 radius_lg surface_blue_500_10 tone_blue_400 hover_surface_blue_500 hover_tone_white transition-colors border line_blue_500_20" title="Edit">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </Button>
                                <Button onClick={() => handleDelete(q.id)} className="space_pa_2_5 radius_lg surface_red_500_10 tone_red_400 hover_surface_red_500 hover_tone_white transition-colors border line_red_500_20" title="Delete">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center space_pa_4 surface_black_80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#0f0f1a] border line_white_10 radius_2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
                        <div className="space_pa_6 border-b line_white_5 flex justify-between items-center">
                            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">{editingQuestionId ? 'Edit Question' : 'Add New Question'}</h2>
                            <Button onClick={() => setShowAddModal(false)} className="tone_gray_500 hover_tone_white"><Icon name="X" size={16} /></Button>
                        </div>

                        <div className="space_pa_6 space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs tone_gray_500 uppercase">Subject ID</label>
                                    <Input className="w-full surface_black_50 border line_white_10 radius_lg space_px_3 space_py_2 tone_white focus:border-accent" type="number"
                                        value={newQ.subject_id} onChange={e => setNewQ({ ...newQ, subject_id: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs tone_gray_500 uppercase">Chapter ID</label>
                                    <Input className="w-full surface_black_50 border line_white_10 radius_lg space_px_3 space_py_2 tone_white focus:border-accent" type="number"
                                        value={newQ.chapter_id} onChange={e => setNewQ({ ...newQ, chapter_id: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs tone_gray_500 uppercase">Topic ID</label>
                                    <Input className="w-full surface_black_50 border line_white_10 radius_lg space_px_3 space_py_2 tone_white focus:border-accent" type="number"
                                        value={newQ.topic_id} onChange={e => setNewQ({ ...newQ, topic_id: e.target.value })} />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs tone_gray_500 uppercase">Difficulty</label>
                                <Select className="w-full surface_black_50 border line_white_10 radius_lg space_px_3 space_py_2 tone_white focus:border-accent"
                                    value={newQ.difficulty} onChange={e => setNewQ({ ...newQ, difficulty: e.target.value })}>
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs tone_gray_500 uppercase">Question Text</label>
                                <Textarea className="w-full surface_black_50 border line_white_10 radius_lg space_px_3 space_py_2 tone_white focus:border-accent min-h-[100px]"
                                    value={newQ.text} onChange={e => setNewQ({ ...newQ, text: e.target.value })}></Textarea>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {['A', 'B', 'C', 'D'].map(opt => (
                                    <div key={opt} className="space-y-1">
                                        <label className="text-xs tone_gray_500 uppercase">Option {opt}</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 tone_gray_600 font-bold">{opt}</span>
                                            <Input className="w-full surface_black_50 border line_white_10 radius_lg space_pl_8 space_pr_3 space_py_2 tone_white focus:border-accent"
                                                value={newQ[`option_${opt.toLowerCase()}`]}
                                                onChange={e => setNewQ({ ...newQ, [`option_${opt.toLowerCase()}`]: e.target.value })} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs tone_gray_500 uppercase">Correct Option</label>
                                <Select className="w-full surface_black_50 border line_white_10 radius_lg space_px_3 space_py_2 tone_white focus:border-accent"
                                    value={newQ.correct_option} onChange={e => setNewQ({ ...newQ, correct_option: e.target.value })}>
                                    <option value="A">Option A</option>
                                    <option value="B">Option B</option>
                                    <option value="C">Option C</option>
                                    <option value="D">Option D</option>
                                </Select>
                            </div>

                            <div className="space_pa_4 radius_lg surface_white_5 border line_white_10">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <Input type="checkbox" className="w-5 h-5 rounded line_gray_600 text-accent focus:ring-accent surface_gray_700"
                                        checked={newQ.is_pyq} onChange={e => setNewQ({ ...newQ, is_pyq: e.target.checked })} />
                                    <span className="font-medium tone_white">Is Previous Year Question (PYQ)?</span>
                                </label>
                                {newQ.is_pyq && (
                                    <div className="grid grid-cols-2 gap-4 space_mt_3 animate-fade-in-down">
                                        <Input className="w-full surface_black_50 border line_white_10 radius_lg space_px_3 space_py_2 tone_white focus:border-accent"
                                            placeholder="Exam Name (e.g. NEET)" value={newQ.exam_name} onChange={e => setNewQ({ ...newQ, exam_name: e.target.value })} />
                                        <Input className="w-full surface_black_50 border line_white_10 radius_lg space_px_3 space_py_2 tone_white focus:border-accent"
                                            placeholder="Year (e.g. 2023)" value={newQ.year_asked} onChange={e => setNewQ({ ...newQ, year_asked: e.target.value })} />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space_pa_6 border-t line_white_5 flex justify-end gap-3">
                            <Button className="btn btn-ghost hover_surface_white_5" onClick={() => setShowAddModal(false)}>Cancel</Button>
                            <Button className="btn btn-primary space_px_8" onClick={handleAddSubmit}>Save Question</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
