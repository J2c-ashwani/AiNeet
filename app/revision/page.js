'use client';
import { Icon } from '@/components/ui/Icon';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Badge } from '@/components/ui';

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
                window.location.href = '/';
            }
        } catch (err) {
            console.error('Failed to log review', err);
        }
    };

    if (loading) return <div style={{ padding: 32, textAlign: 'center', }}>Loading your mission...</div>;

    if (reviews.length === 0) {
        return (
            <div className="page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                    <Card style={{ textAlign: 'center', padding: 32, maxWidth: 450, width: '100%' }}>
                        <div style={{ marginBottom: 16 }}><Icon name="Star" size={16} /></div>
                        <h2 style={{ fontWeight: 800, marginBottom: 8, }}>All caught up!</h2>
                        <p style={{ marginBottom: 0, }}>You have no pending revisions for today.</p>
                        <Button variant="primary" onClick={() => window.location.href = '/'} style={{ width: '100%' }}>
                            Back to Dashboard
                        </Button>
                    </Card>
                </div>
            </div>
        );
    }

    const currentCard = reviews[currentIndex];

    return (
        <div className="page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', }}>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                <div style={{ width: '100%', maxWidth: 650 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0, }}>
                        <span style={{ fontWeight: 600 }}>Card {currentIndex + 1} / {reviews.length}</span>
                        <Badge variant="primary">{currentCard.subject_name}</Badge>
                    </div>

                    <Card style={{ padding: 32, minHeight: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}>
                        <h3 style={{ fontWeight: 500, marginBottom: 0, lineHeight: 1.6 }}>{currentCard.text}</h3>

                        {!showAnswer && (
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={() => setShowAnswer(true)}
                                style={{ marginTop: 0, }}
                            >
                                Show Answer
                            </Button>
                        )}

                        {showAnswer && (
                            <div className="animate-fade-in" style={{ width: '100%' }}>
                                <div style={{ padding: 16, border: '1px solid var(--success)', marginBottom: 32, textAlign: 'left', width: '100%' }}>
                                    <p style={{ fontWeight: 700, marginBottom: 8 }}>Correct Answer:</p>
                                    <p style={{ marginBottom: currentCard.explanation ? '8px' : 0 }}>Option {currentCard.correct_option}</p>
                                    {currentCard.explanation && (
                                        <p style={{ marginTop: 0, borderTop: '1px solid var(--border)', paddingTop: 16, }}>{currentCard.explanation}</p>
                                    )}
                                </div>

                                <div className="grid grid-3" style={{ gap: 16, width: '100%' }}>
                                    <Button
                                        variant="danger"
                                        onClick={() => handleRate(1)}
                                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 12, height: 'auto' }}
                                    >
                                        <span style={{ fontWeight: 700 }}>Hard (1)</span>
                                        <span style={{ display: 'block', opacity: 0.8, marginTop: 0, }}>Review Tomorrow</span>
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={() => handleRate(3)}
                                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 12, height: 'auto' }}
                                    >
                                        <span style={{ fontWeight: 700 }}>Good (3)</span>
                                        <span style={{ display: 'block', opacity: 0.8, marginTop: 0, }}>Review in 3d</span>
                                    </Button>
                                    <Button
                                        variant="success"
                                        onClick={() => handleRate(5)}
                                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 12, height: 'auto' }}
                                    >
                                        <span style={{ fontWeight: 700 }}>Easy (5)</span>
                                        <span style={{ display: 'block', opacity: 0.8, marginTop: 0, }}>Review in 7d</span>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
