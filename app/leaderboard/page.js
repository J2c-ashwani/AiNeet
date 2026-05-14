'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LeaderboardSkeleton } from '@/components/skeletons';
import { EmptyState } from '@/components/ui/EmptyState';

import useSWR from 'swr';
import { fetcher } from '@/lib/swr';

export default function LeaderboardPage() {
    const router = useRouter();

    const { data, error, isLoading } = useSWR('/api/leaderboard', fetcher, {
        revalidateOnFocus: false, // Leaderboard doesn't need to refresh every focus
        refreshInterval: 60000,   // Poll every minute for updates
    });

    const leaderboard = data?.leaderboard || [];
    const loading = isLoading;

    if (loading) return (
        <div style={{ minHeight: '100vh', padding: '0px' }}>
            <LeaderboardSkeleton rows={10} />
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
                    <EmptyState 
                        type="leaderboard"
                        onAction={() => router.push('/test/configure')}
                        showGhostCards={true}
                    />
                )}
            </div>
        </div>
    );
}
