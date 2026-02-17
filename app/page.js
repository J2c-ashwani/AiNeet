'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/auth/me').then(r => r.json()).then(data => {
            if (data.user) { setUser(data.user); router.push('/dashboard'); }
            else setLoading(false);
        }).catch(() => setLoading(false));
    }, [router]);

    if (loading) return (
        <div className="loading-overlay" style={{ minHeight: '100vh' }}>
            <div className="spinner" style={{ width: 40, height: 40 }}></div>
        </div>
    );

    return (
        <div>
            {/* Navbar */}
            <nav className="navbar">
                <div className="nav-brand">
                    <span style={{ fontSize: '1.6rem' }}>🧠</span>
                    <span>AI NEET Coach</span>
                </div>
                <div className="flex gap-3">
                    <a href="/login" className="btn btn-ghost">Sign In</a>
                    <a href="/register" className="btn btn-primary">Get Started Free</a>
                </div>
            </nav>

            {/* Hero */}
            <section className="hero-section animate-fade-in-up">
                <div style={{ fontSize: '4rem', marginBottom: 20 }}>🧠</div>
                <h1 className="hero-title">
                    Your Personal<br />
                    <span className="hero-gradient">AI NEET Coach</span>
                </h1>
                <p className="hero-subtitle">
                    India's most intelligent NEET preparation platform. Get personalized tests,
                    AI-powered doubt solving, smart study plans, rank prediction, and performance
                    analytics — all powered by artificial intelligence.
                </p>
                <div className="hero-actions">
                    <a href="/register" className="btn btn-primary btn-lg">
                        Start Preparing Now →
                    </a>
                    <a href="/login" className="btn btn-secondary btn-lg">
                        Already have an account
                    </a>
                </div>
            </section>

            {/* Features */}
            <div className="features-grid stagger">
                {[
                    { icon: '🎯', title: 'AI Test Generator', desc: 'Generate personalized tests instantly based on your preparation level, weak areas, and selected topics.' },
                    { icon: '🤖', title: 'AI Doubt Solver', desc: 'Ask any doubt and get instant, NEET-focused explanations with memory tricks and shortcuts.' },
                    { icon: '📊', title: 'Smart Analytics', desc: 'Track accuracy, speed, weak areas, and improvement trends with detailed performance dashboards.' },
                    { icon: '📅', title: 'AI Study Planner', desc: 'Get personalized daily study plans that adapt based on your performance and progress.' },
                    { icon: '🏆', title: 'Rank Predictor', desc: 'Know your predicted NEET rank, percentile, and college possibilities based on test performance.' },
                    { icon: '🎮', title: 'Gamification', desc: 'Earn XP, unlock badges, maintain streaks, and compete on leaderboards. Make learning fun!' },
                    { icon: '📓', title: 'Mistake Notebook', desc: 'Auto-generated notebook of your repeated mistakes, weak concepts, and improvement suggestions.' },
                    { icon: '🔄', title: 'Spaced Repetition', desc: 'Smart revision system that resurfaces weak topics at optimal intervals for maximum retention.' },
                    { icon: '⏱️', title: 'NEET Simulation', desc: 'Full mock tests with NEET format — 180 questions, 720 marks, 3-hour timer, negative marking.' },
                ].map((f, i) => (
                    <div key={i} className="feature-card">
                        <div className="feature-icon">{f.icon}</div>
                        <h3>{f.title}</h3>
                        <p>{f.desc}</p>
                    </div>
                ))}
            </div>

            {/* CTA */}
            <section className="hero-section" style={{ paddingTop: 20 }}>
                <h2 style={{ fontSize: '2rem', marginBottom: 16 }}>
                    Ready to crack <span className="hero-gradient">NEET?</span>
                </h2>
                <p className="hero-subtitle" style={{ marginBottom: 24 }}>
                    Join thousands of students preparing smarter with AI.
                </p>
                <a href="/register" className="btn btn-primary btn-lg">
                    Start Free Preparation →
                </a>
                <p className="text-muted mt-4 text-sm">No credit card required • Free forever plan available</p>
            </section>

            {/* Footer */}
            <footer style={{ textAlign: 'center', padding: '40px 20px', borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <p>© 2026 AI NEET Coach. Built with ❤️ for NEET aspirants.</p>
                <p style={{ marginTop: 8 }}>Powered by Artificial Intelligence</p>
            </footer>
        </div>
    );
}
