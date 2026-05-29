import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/utils/supabase/server';
import EducatorExportButton from '@/components/EducatorExportButton';

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
            <div className="page text-center space_py_20 flex flex-col items-center">
                <span className="text-4xl space_mb_4"><Icon name="Star" size={16} /></span>
                <h1 className="text-3xl font-bold space_mb_4">Welcome, Educator.</h1>
                <p className="text-muted space_mb_8 max-w-lg">Before tracking your students' performance heatmaps, you need to establish a secure classroom environment.</p>
                <form action="/api/classroom/create" method="POST" className="flex flex-col gap-4 w-full max-w-md">
                    <Input type="text" name="name" placeholder="E.g. Physics 101 - Aakash Batch" className="input" required />
                    <Button type="submit" className="btn btn-primary w-full">Create Classroom</Button>
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
        <div className="page" style={{ maxWidth: 1000, margin: '0 auto', minHeight: '100vh', padding: '40px 20px' }}>
            {/* Header & Viral CTA Loop (MD Mandate) */}
            <div className="flex justify-between items-start space_mb_10 flex-wrap gap-4">
                <div>
                    <h1 style={{ fontWeight: 800, margin: 0 }}>{classroom.name}</h1>
                    <p style={{ marginTop: 8 }}>
                        Educator Dashboard
                    </p>
                </div>

                <div style={{ border: '1px solid rgba(99,102,241,0.3)', padding: '16px 24px', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 8px 0', }}>Share this code with your class students</p>
                    <div style={{ fontWeight: 900, letterSpacing: '0.2em', }}>
                        {classroom.join_code}
                    </div>
                </div>
            </div>

            {/* Time Filter Toggle */}
            <div className="flex gap-2 space_mb_8 border-b line_gray_800 space_pb_4">
                <a href="/educator?days=7" className={`block px-4 py-2 rounded-md ${daysLimit === 7 ? 'bg-primary text-white font-bold' : 'text-gray-400 hover:text-white'}`}>
                    Last 7 Days
                </a>
                <a href="/educator?days=30" className={`block px-4 py-2 rounded-md ${daysLimit === 30 ? 'bg-primary text-white font-bold' : 'text-gray-400 hover:text-white'}`}>
                    Last 30 Days
                </a>
                <EducatorExportButton />
            </div>

            {/* Metric 1: Macro Accuracy */}
            <div className="grid grid-2 gap-6 space_mb_10">
                <div style={{ padding: 32, }}>
                    <div className="text-muted text-sm uppercase tracking-wider font-bold space_mb_2">Class Accuracy Average</div>
                    <div className="text-5xl font-black tone_white">{macro.avg_accuracy}%</div>
                    <div className="text-sm tone_gray_400 space_mt_2">Based on {macro.total_tests} mock tests taken.</div>
                </div>
            </div>

            {/* Metric 2: MD Action Hints on Weak Topics */}
            <div className="space_mb_10">
                <h3 className="text-xl font-bold space_mb_4 tone_white">Top 3 Weak Topics</h3>
                <div className="grid grid-3 gap-6">
                    {weakTopics.length > 0 ? weakTopics.map((wt, i) => (
                        <div key={i} style={{ border: '1px solid rgba(239, 68, 68, 0.2)', padding: 24, }}>
                            <div className="text-2xl space_mb_2"><Icon name="AlertCircle" /></div>
                            <h4 className="font-bold text-lg space_mb_1">{wt.topic_name}</h4>
                            <div className="text-danger font-black text-2xl space_mb_3">{wt.avg_accuracy}% Accuracy</div>

                            <div style={{ padding: 12, }}>
                                <span className="font-bold tone_gray_200 block text-sm space_mb_1">Action Hint:</span>
                                <span className="tone_gray_400 text-sm">
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
                <h3 className="text-xl font-bold space_mb_4 tone_white">Student Roster & Ranking</h3>
                <div style={{ overflow: 'hidden' }}>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead >
                            <tr>
                                <th style={{ padding: '16px 24px', textTransform: 'uppercase' }}>Rank</th>
                                <th style={{ padding: '16px 24px', textTransform: 'uppercase' }}>Student</th>
                                <th style={{ padding: '16px 24px', textTransform: 'uppercase' }}>Trust Score</th>
                                <th style={{ padding: '16px 24px', textTransform: 'uppercase', textAlign: 'right' }}>Total XP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.length > 0 ? leaderboard.map((student, i) => (
                                <tr key={student.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '16px 24px', fontWeight: 900, color: i < 3 ? 'var(--text-primary)' : 'var(--text-primary)' }}>#{i + 1}</td>
                                    <td style={{ padding: '16px 24px', fontWeight: 'bold' }}>{student.name}</td>
                                    <td style={{ padding: '16px 24px', }}>{student.trust_score}</td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right', fontFamily: 'monospace', }}>{student.xp} XP</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="text-center text-muted" style={{ padding: 32 }}>
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
