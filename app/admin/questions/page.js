
'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

export default function AdminQuestionsPage() {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            const res = await fetch('/api/admin/questions');
            const data = await res.json();
            if (res.ok) setQuestions(data.questions);
        } catch (error) {
            console.error('Failed to fetch', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh', paddingBottom: 40 }}>
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <header className="mb-8">
                    <h1>Quality Control Dashboard</h1>
                    <p className="text-muted">Review reported questions and errata.</p>
                </header>

                {loading ? (
                    <div className="spinner"></div>
                ) : (
                    <div className="card overflow-hidden">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                                    <th className="p-4">ID</th>
                                    <th className="p-4">Question</th>
                                    <th className="p-4">Flags</th>
                                    <th className="p-4">Reasons</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {questions.map(q => (
                                    <tr key={q.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td className="p-4 text-sm text-muted">#{q.id}</td>
                                        <td className="p-4">
                                            <div className="line-clamp-2">{q.text}</div>
                                        </td>
                                        <td className="p-4 font-bold text-danger">{q.flag_count} 🚩</td>
                                        <td className="p-4 text-sm">
                                            {q.reasons.split(',').slice(0, 3).map((r, i) => (
                                                <span key={i} className="badge badge-sm mr-1">{r}</span>
                                            ))}
                                        </td>
                                        <td className="p-4">
                                            <button className="btn btn-sm btn-secondary" onClick={() => alert('Edit feature coming soon')}>Edit</button>
                                        </td>
                                    </tr>
                                ))}
                                {questions.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-muted">
                                            No flagged questions found. Good job! 🎉
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
