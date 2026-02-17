
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CoachWidget() {
    const [guidance, setGuidance] = useState(null);

    useEffect(() => {
        fetch('/api/coach/daily')
            .then(res => res.json())
            .then(data => setGuidance(data))
            .catch(console.error);
    }, []);

    if (!guidance) return (
        <div className="card animate-pulse h-32 mb-6"></div>
    );

    const { greeting, message, actionItem, tip, sentiment } = guidance;

    return (
        <div className="card bg-white border-l-4 border-indigo-500 shadow-md p-6 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">🤖</div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">👋</span>
                    <h2 className="text-lg font-bold text-gray-800">{greeting}</h2>
                </div>

                <p className="text-gray-600 mb-4 max-w-2xl leading-relaxed">
                    {message}
                </p>

                {actionItem && (
                    <div className="flex items-center gap-4 mb-4">
                        <Link
                            href={actionItem.link}
                            className={`btn btn-${actionItem.type || 'primary'} btn-sm shadow-sm`}
                        >
                            {actionItem.text} →
                        </Link>
                    </div>
                )}

                <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-md text-sm text-yellow-800 flex items-start gap-2 max-w-xl">
                    <span>💡</span>
                    <span className="italic">{tip}</span>
                </div>
            </div>
        </div>
    );
}
