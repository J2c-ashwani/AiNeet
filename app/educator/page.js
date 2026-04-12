import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/utils/supabase/server';
import Link from 'next/link';

export const metadata = { title: 'Educator Dashboard | NEET Coach' };

export default async function EducatorDashboard({ searchParams }) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const { data: userProfile } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (!userProfile || userProfile.role !== 'teacher') {
        redirect('/dashboard');
    }

    // 1. Fetch Classroom Context
    const { data: classroom } = await supabase.from('classrooms').select('*').eq('teacher_id', user.id).single();
    
    if (!classroom) {
        return (
            <div className="page text-center py-20 flex flex-col items-center">
                <span className="text-4xl mb-4">🏫</span>
                <h1 className="text-3xl font-bold mb-4">Welcome, Educator.</h1>
                <p className="text-muted mb-8 max-w-lg">Before tracking your students' performance heatmaps, you need to establish a secure classroom environment.</p>
                <form action="/api/classroom/create" method="POST" className="flex flex-col gap-4 w-full max-w-md">
                    <input type="text" name="name" placeholder="E.g. Physics 101 - Aakash Batch" className="input" required />
                    <button type="submit" className="btn btn-primary w-full">Create Classroom</button>
                </form>
            </div>
        );
    }

    // 2. The Time Toggle State
    const daysLimit = searchParams.days === '30' ? 30 : 7;

    // 3. Fast JSON Aggregation (Offloads computation onto Postgres Engine)
    const { data: analyticsPayload, error: rpcError } = await supabase.rpc('get_classroom_analytics', { 
        target_class_id: classroom.id, 
        days_limit: daysLimit 
    });

    if (rpcError) console.error("RPC Error:", rpcError);

    // Fallback parsing just in case
    const payload = typeof analyticsPayload === 'string' ? JSON.parse(analyticsPayload) : (analyticsPayload || {});
    const macro = payload.macro || { avg_accuracy: 0, total_tests: 0 };
    const weakTopics = payload.weakTopics || [];
    const leaderboard = payload.leaderboard || [];

    return (
        <div className="page" style={{ maxWidth: '1000px', margin: '0 auto', minHeight: '100vh', padding: '40px 20px' }}>
            {/* Header & Viral CTA Loop (MD Mandate) */}
            <div className="flex justify-between items-start mb-10 flex-wrap gap-4">
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>{classroom.name}</h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginTop: '8px' }}>
                        Educator Dashboard
                    </p>
                </div>

                <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', padding: '16px 24px', borderRadius: '12px', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#cbd5e1' }}>Share this code with your class students</p>
                    <div style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '0.2em', color: '#818cf8' }}>
                        {classroom.join_code}
                    </div>
                </div>
            </div>

            {/* Time Filter Toggle */}
            <div className="flex gap-2 mb-8 border-b border-gray-800 pb-4">
                <Link href="/educator?days=7" className={`block px-4 py-2 rounded-md ${daysLimit === 7 ? 'bg-primary text-white font-bold' : 'text-gray-400 hover:text-white'}`}>
                    Last 7 Days
                </Link>
                <Link href="/educator?days=30" className={`block px-4 py-2 rounded-md ${daysLimit === 30 ? 'bg-primary text-white font-bold' : 'text-gray-400 hover:text-white'}`}>
                    Last 30 Days
                </Link>
                <button onClick={() => alert('PDF Report Generator compiling...')} className="ml-auto px-4 py-2 rounded-md bg-white text-black font-bold text-sm flex items-center gap-2">
                    📄 Export Weekly PDF
                </button>
            </div>

            {/* Metric 1: Macro Accuracy */}
            <div className="grid grid-2 gap-6 mb-10">
                <div style={{ background: '#1e293b', padding: '32px', borderRadius: '16px' }}>
                    <div className="text-muted text-sm uppercase tracking-wider font-bold mb-2">Class Accuracy Average</div>
                    <div className="text-5xl font-black text-white">{macro.avg_accuracy}%</div>
                    <div className="text-sm text-gray-400 mt-2">Based on {macro.total_tests} mock tests taken.</div>
                </div>
            </div>

            {/* Metric 2: MD Action Hints on Weak Topics */}
            <div className="mb-10">
                <h3 className="text-xl font-bold mb-4 text-white">Top 3 Weak Topics</h3>
                <div className="grid grid-3 gap-6">
                    {weakTopics.length > 0 ? weakTopics.map((wt, i) => (
                        <div key={i} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '24px', borderRadius: '16px' }}>
                            <div className="text-2xl mb-2">🚨</div>
                            <h4 className="font-bold text-lg mb-1">{wt.topic_name}</h4>
                            <div className="text-danger font-black text-2xl mb-3">{wt.avg_accuracy}% Accuracy</div>

                            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '12px', borderRadius: '8px' }}>
                                <span className="font-bold text-gray-200 block text-sm mb-1">Action Hint:</span>
                                <span className="text-gray-400 text-sm">
                                    → Revise <strong>{wt.topic_name}</strong> immediately. High error rate across {wt.total_attempts} attempts.
                                </span>
                            </div>
                        </div>
                    )) : (
                        <p className="text-muted">Not enough data to calculate weak topics yet.</p>
                    )}
                </div>
            </div>

            {/* Metric 3: The Ranking Leaderboard */}
            <div>
                <h3 className="text-xl font-bold mb-4 text-white">Student Roster & Ranking</h3>
                <div style={{ background: '#1e293b', borderRadius: '16px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#0f172a' }}>
                            <tr>
                                <th style={{ padding: '16px 24px', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase' }}>Rank</th>
                                <th style={{ padding: '16px 24px', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase' }}>Student</th>
                                <th style={{ padding: '16px 24px', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase' }}>Trust Score</th>
                                <th style={{ padding: '16px 24px', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'right' }}>Total XP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.length > 0 ? leaderboard.map((student, i) => (
                                <tr key={student.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '16px 24px', fontWeight: 900, color: i < 3 ? '#fbbf24' : '#64748b' }}>#{i + 1}</td>
                                    <td style={{ padding: '16px 24px', fontWeight: 'bold' }}>{student.name}</td>
                                    <td style={{ padding: '16px 24px', color: '#4ade80' }}>{student.trust_score}</td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right', fontFamily: 'monospace', fontSize: '1.1rem' }}>{student.xp} XP</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="text-center text-muted" style={{ padding: '32px' }}>
                                        No students have joined your classroom yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
