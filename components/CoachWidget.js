
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

/**
 * P0-3 Trust Hardening: Deterministic UI State Machine
 * 
 * States:
 *   loading → initial fetch in progress (max 3 seconds)
 *   ready   → coach data loaded successfully
 *   empty   → API returned no data (new user, no tests yet)
 *   error   → API failed, timed out, or returned malformed data
 * 
 * No infinite skeleton is possible. Every path terminates.
 */

const TIPS = [
    "Consistency is key! Even 15 minutes a day makes a difference.",
    "Don't forget to review your mistakes. That's where the real learning happens.",
    "Take breaks! Your brain needs time to consolidate memory.",
    "Focus on concepts, not just rote memorization.",
    "Sleep is crucial for memory retention. Get your 7-8 hours!"
];

const TIMEOUT_MS = 3000;

export default function CoachWidget() {
    const [state, setState] = useState('loading'); // loading | ready | empty | error
    const [guidance, setGuidance] = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        let settled = false;

        const settle = (nextState, data = null) => {
            if (settled) return; // Prevent late arrivals from overwriting
            settled = true;
            if (data) setGuidance(data);
            setState(nextState);
        };

        // Hard timeout: force error state if API hasn't responded in 3s
        const timeout = setTimeout(() => {
            controller.abort();
            settle('error');
        }, TIMEOUT_MS);

        fetch('/api/coach/daily', { signal: controller.signal })
            .then(res => {
                if (!res.ok) {
                    // 404 = user has no data yet (new user), 401 = not auth'd
                    if (res.status === 404 || res.status === 401) {
                        settle('empty');
                    } else {
                        settle('error');
                    }
                    return null;
                }
                return res.json();
            })
            .then(data => {
                if (data === null) return; // Already settled above
                if (!data || !data.greeting) {
                    settle('empty');
                    return;
                }
                settle('ready', data);
            })
            .catch(err => {
                if (err.name === 'AbortError') return; // Timeout already settled this
                settle('error');
            })
            .finally(() => clearTimeout(timeout));

        return () => {
            settled = true;
            clearTimeout(timeout);
            controller.abort();
        };
    }, []);

    const randomTip = TIPS[Math.floor(Math.random() * TIPS.length)];

    // ─── State: Loading (max 3 seconds) ───
    if (state === 'loading') {
        return (
            <div className="card animate-pulse h-32 mb-6" aria-label="Loading daily guidance">
                <div style={{ padding: 24 }}>
                    <div style={{ height: 16, width: '40%', background: 'rgba(255,255,255,0.05)', borderRadius: 8, marginBottom: 12 }}></div>
                    <div style={{ height: 12, width: '80%', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}></div>
                </div>
            </div>
        );
    }

    // ─── State: Ready (coach data loaded) ───
    if (state === 'ready' && guidance) {
        const { greeting, message, actionItem, tip, sentiment } = guidance;
        return (
            <div className="card bg-gray-900 border border-gray-800 shadow-md p-6 mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-6xl">🤖</div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">👋</span>
                        <h2 className="text-lg font-bold text-white">{greeting}</h2>
                    </div>
                    <p className="text-gray-300 mb-4 max-w-2xl leading-relaxed">{message}</p>
                    {actionItem && (
                        <div className="flex items-center gap-4 mb-4">
                            <Link href={actionItem.link} className={`btn btn-${actionItem.type || 'primary'} btn-sm shadow-sm`}>
                                {actionItem.text} →
                            </Link>
                        </div>
                    )}
                    <div className="bg-blue-900/20 border border-blue-500/20 p-3 rounded-md text-sm text-blue-200 flex items-start gap-2 max-w-xl">
                        <span>💡</span>
                        <span className="italic">{tip}</span>
                    </div>
                </div>
            </div>
        );
    }

    // ─── State: Empty (new user, no coach data yet) ───
    if (state === 'empty') {
        return (
            <div className="card bg-gray-900 border border-gray-800 shadow-md p-6 mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-6xl">🧠</div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">👋</span>
                        <h2 className="text-lg font-bold text-white">Welcome to AI NEET Coach!</h2>
                    </div>
                    <p className="text-gray-300 mb-4 max-w-2xl leading-relaxed">
                        Take your first diagnostic test to unlock your personalized AI study plan, rank prediction, and daily coaching.
                    </p>
                    <div className="flex items-center gap-4 mb-4">
                        <Link href="/test/configure" className="btn btn-primary btn-sm shadow-sm">
                            Take Diagnostic Test →
                        </Link>
                    </div>
                    <div className="bg-blue-900/20 border border-blue-500/20 p-3 rounded-md text-sm text-blue-200 flex items-start gap-2 max-w-xl">
                        <span>💡</span>
                        <span className="italic">{randomTip}</span>
                    </div>
                </div>
            </div>
        );
    }

    // ─── State: Error (API failed / timed out) ───
    return (
        <div className="card bg-gray-900 border border-gray-800 shadow-md p-6 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 text-6xl">🧠</div>
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">👋</span>
                    <h2 className="text-lg font-bold text-white">Ready to study?</h2>
                </div>
                <p className="text-gray-300 mb-4 max-w-2xl leading-relaxed">
                    Your personalized guidance is taking a moment to load. Meanwhile, jump right into practice!
                </p>
                <div className="flex items-center gap-4 mb-4">
                    <Link href="/test/configure" className="btn btn-primary btn-sm shadow-sm">
                        Start Practice Test →
                    </Link>
                    <Link href="/doubts" className="btn btn-ghost btn-sm">
                        Ask AI Doubt →
                    </Link>
                </div>
                <div className="bg-blue-900/20 border border-blue-500/20 p-3 rounded-md text-sm text-blue-200 flex items-start gap-2 max-w-xl">
                    <span>💡</span>
                    <span className="italic">{randomTip}</span>
                </div>
            </div>
        </div>
    );
}
