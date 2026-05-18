
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function RevisionCard() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        fetch('/api/revision/due')
            .then(res => res.json())
            .then(data => {
                if (data.reviews) setCount(data.reviews.length);
            })
            .catch(console.error);
    }, []);

    if (count === 0) return null; // Hide if no reviews

    return (
        <div className="card bg-gradient-to-r from-indigo-500 to-purple-600 tone_white space_pa_6 radius_lg shadow-lg space_mb_6">
            <h3 className="text-xl font-bold space_mb_2">🧠 Daily Revision</h3>
            <p className="opacity-90 space_mb_4">You have {count} cards due for review based on your learning curve.</p>
            <a href="/revision" className="btn surface_white tone_indigo_600 border-none hover_surface_gray_100 font-semibold space_px_6 space_py_2 radius_full inline-block">
                Start Review Session
            </a>
        </div>
    );
}
