
'use client';
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

    if (loading) return <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading your mission...</div>;

    if (reviews.length === 0) {
        return (
            <div className="page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                    <Card style={{ textAlign: 'center', padding: '32px', maxWidth: '450px', width: '100%' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🎉</div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>All caught up!</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>You have no pending revisions for today.</p>
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
        <div className="page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                <div style={{ width: '100%', maxWidth: '650px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>Card {currentIndex + 1} / {reviews.length}</span>
                        <Badge variant="primary">{currentCard.subject_name}</Badge>
                    </div>

                    <Card style={{ padding: '32px', minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: '24px', color: 'var(--text-primary)', lineHeight: 1.6 }}>{currentCard.text}</h3>

                        {!showAnswer && (
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={() => setShowAnswer(true)}
                                style={{ marginTop: '32px' }}
                            >
                                Show Answer
                            </Button>
                        )}

                        {showAnswer && (
                            <div className="animate-fade-in" style={{ width: '100%' }}>
                                <div style={{ background: 'var(--success-light, rgba(34, 197, 94, 0.1))', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--success)', marginBottom: '32px', textAlign: 'left', width: '100%' }}>
                                    <p style={{ fontWeight: 700, color: 'var(--success)', marginBottom: '8px' }}>Correct Answer:</p>
                                    <p style={{ fontSize: '1.125rem', color: 'var(--text-primary)', marginBottom: currentCard.explanation ? '8px' : 0 }}>Option {currentCard.correct_option}</p>
                                    {currentCard.explanation && (
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '8px', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>{currentCard.explanation}</p>
                                    )}
                                </div>

                                <div className="grid grid-3" style={{ gap: '16px', width: '100%' }}>
                                    <Button
                                        variant="danger"
                                        onClick={() => handleRate(1)}
                                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px', height: 'auto' }}
                                    >
                                        <span style={{ fontWeight: 700 }}>Hard (1)</span>
                                        <span style={{ display: 'block', fontSize: '0.75rem', opacity: 0.8, marginTop: '4px' }}>Review Tomorrow</span>
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={() => handleRate(3)}
                                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px', height: 'auto' }}
                                    >
                                        <span style={{ fontWeight: 700 }}>Good (3)</span>
                                        <span style={{ display: 'block', fontSize: '0.75rem', opacity: 0.8, marginTop: '4px' }}>Review in 3d</span>
                                    </Button>
                                    <Button
                                        variant="success"
                                        onClick={() => handleRate(5)}
                                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px', height: 'auto' }}
                                    >
                                        <span style={{ fontWeight: 700 }}>Easy (5)</span>
                                        <span style={{ display: 'block', fontSize: '0.75rem', opacity: 0.8, marginTop: '4px' }}>Review in 7d</span>
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
