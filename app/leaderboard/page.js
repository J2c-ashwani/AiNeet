'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LeaderboardPage() {
    const router = useRouter();
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/leaderboard').then(r => r.json()).then(data => {
            setLeaderboard(data.leaderboard || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="loading-overlay" style={{ minHeight: '100vh' }}>
            <div className="spinner" style={{ width: 40, height: 40 }}></div>
        </div>
    );

    return (
        <div>
            

            <div className="page" style={{ maxWidth: 700 }}>
                <div className="page-header">
                    <h1 className="page-title">🏆 Leaderboard</h1>
                    <p className="page-subtitle">Top performers on the platform</p>
                </div>

                {leaderboard.length > 0 ? (
                    <div className="flex flex-col gap-3 stagger">
                        {leaderboard.map((user, idx) => (
                            <div key={idx} className="leaderboard-item">
                                <div className="leaderboard-rank">
                                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${user.rank}`}
                                </div>
                                <div className="leaderboard-avatar">{user.initial}</div>
                                <div className="leaderboard-name">
                                    <div>{user.name}</div>
                                    <div className="text-xs text-muted">Level {user.level?.level} • {user.level?.name} • 🔥{user.streak}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div className="leaderboard-score">{user.xp} XP</div>
                                    <div className="text-xs text-muted">{user.testCount} tests • Avg {user.avgScore}/720</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-icon">🏆</div>
                        <div className="empty-state-title">Be the first on the leaderboard!</div>
                        <p className="text-muted text-sm">Complete tests and earn XP to appear on the leaderboard.</p>
                        <a href="/test/configure" className="btn btn-primary mt-4">Take a Test →</a>
                    </div>
                )}
            </div>
        </div>
    );
}
