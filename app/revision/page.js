
'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';

export default function RevisionPage() {
    const [reviews, setReviews] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetch('/api/revision/due')
            .then(res => res.json())
            .then(data => {
                setReviews(data.reviews || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleRate = async (quality) => {
        const currentCard = reviews[currentIndex];
        if (!currentCard) return;

        try {
            await fetch('/api/revision/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questionId: currentCard.question_id, quality })
            });

            // Move to next card
            setShowAnswer(false);
            if (currentIndex < reviews.length - 1) {
                setCurrentIndex(prev => prev + 1);
            } else {
                // Done
                alert('Session Complete! Great job.');
                router.push('/');
            }
        } catch (err) {
            console.error('Failed to log review', err);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading your mission...</div>;

    if (reviews.length === 0) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <div className="card text-center p-8 max-w-md">
                        <div className="text-4xl mb-4">🎉</div>
                        <h2>All caught up!</h2>
                        <p className="text-muted">You have no pending revisions for today.</p>
                        <button onClick={() => router.push('/')} className="btn btn-primary mt-6">Back to Dashboard</button>
                    </div>
                </div>
            </div>
        );
    }

    const currentCard = reviews[currentIndex];

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-2xl">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-muted">Card {currentIndex + 1} / {reviews.length}</span>
                        <span className="badge badge-primary">{currentCard.subject_name}</span>
                    </div>

                    <div className="card p-8 min-h-[300px] flex flex-col justify-center items-center text-center shadow-lg">
                        <h3 className="text-xl font-medium mb-6">{currentCard.text}</h3>

                        {!showAnswer && (
                            <button
                                onClick={() => setShowAnswer(true)}
                                className="btn btn-primary btn-lg mt-8"
                            >
                                Show Answer
                            </button>
                        )}

                        {showAnswer && (
                            <div className="animate-fade-in w-full">
                                <div className="bg-green-50 p-4 rounded-lg border border-green-100 mb-8 text-left w-full">
                                    <p className="font-bold text-green-800 mb-2">Correct Answer:</p>
                                    <p className="text-lg">Option {currentCard.correct_option}</p>
                                    {currentCard.explanation && (
                                        <p className="text-muted text-sm mt-2 border-t pt-2">{currentCard.explanation}</p>
                                    )}
                                </div>

                                <div className="grid grid-3 gap-4 w-full">
                                    <button
                                        onClick={() => handleRate(1)}
                                        className="btn bg-red-100 text-red-700 hover:bg-red-200 border-red-200"
                                    >
                                        Hard (1)
                                        <span className="block text-xs opacity-70">Review Tomorrow</span>
                                    </button>
                                    <button
                                        onClick={() => handleRate(3)}
                                        className="btn bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200"
                                    >
                                        Good (3)
                                        <span className="block text-xs opacity-70">Review in 3d</span>
                                    </button>
                                    <button
                                        onClick={() => handleRate(5)}
                                        className="btn bg-green-100 text-green-700 hover:bg-green-200 border-green-200"
                                    >
                                        Easy (5)
                                        <span className="block text-xs opacity-70">Review in 7d</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
