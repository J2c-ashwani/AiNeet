
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
        <div className="card bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-lg shadow-lg mb-6">
            <h3 className="text-xl font-bold mb-2">🧠 Daily Revision</h3>
            <p className="opacity-90 mb-4">You have {count} cards due for review based on your learning curve.</p>
            <Link href="/revision" className="btn bg-white text-indigo-600 border-none hover:bg-gray-100 font-semibold px-6 py-2 rounded-full inline-block">
                Start Review Session
            </Link>
        </div>
    );
}
