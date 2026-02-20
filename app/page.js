'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';

export default function Home() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeFaq, setActiveFaq] = useState(null);

    useEffect(() => {
        fetch('/api/auth/me').then(r => r.json()).then(data => {
            if (data.user) { setUser(data.user); router.push('/dashboard'); }
            else setLoading(false);
        }).catch(() => setLoading(false));
    }, [router]);

    if (loading) return (
        <div className="loading-overlay" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spinner" style={{ width: 40, height: 40, border: '4px solid rgba(255,255,255,0.1)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );

    const faqs = [
        { q: 'Is AI NEET Coach free to use?', a: 'Yes! AI NEET Coach offers a free forever plan that includes AI-powered test generation, doubt solving, and performance analytics. Premium plans are available for advanced features like unlimited AI doubts and detailed rank predictions.' },
        { q: 'How does AI NEET Coach generate personalized tests?', a: 'Our AI engine analyzes your performance history, weak areas, and target topics to generate custom NEET-format tests. Each test adapts to your preparation level, ensuring you practice the right questions at the right difficulty.' },
        { q: 'Can I use AI NEET Coach on my mobile phone?', a: 'Absolutely! AI NEET Coach is available as a responsive web app, installable PWA, and a native Android app. Your progress syncs seamlessly across all devices.' },
        { q: 'Does AI NEET Coach cover all NEET subjects?', a: 'Yes, AI NEET Coach covers all three NEET subjects — Physics, Chemistry, and Biology (Botany & Zoology) — with chapter-wise questions aligned to the NCERT syllabus and previous year patterns.' }
    ];

    return (
        <div>
            {/* Navbar */}
            <nav className="navbar" style={{ position: 'sticky', top: 0, zIndex: 100, height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: 'rgba(10, 14, 26, 0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', fontWeight: 800, color: '#f1f5f9' }}>
                    <span style={{ fontSize: '1.6rem' }}>🧠</span>
                    <span style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI NEET Coach</span>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <a href="/login" className="btn btn-ghost" style={{ background: 'transparent', color: '#94a3b8', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', textDecoration: 'none', fontWeight: 600 }}>Sign In</a>
                    <a href="/register" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)', color: 'white', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', textDecoration: 'none', fontWeight: 600, boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)' }}>Get Started Free</a>
                </div>
            </nav>

            {/* Main Page Container */}
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>

                {/* Hero Section */}
                <header style={{ textAlign: 'center', padding: '100px 0 80px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ padding: '8px 16px', borderRadius: '9999px', background: 'rgba(99, 102, 241, 0.1)', color: '#a78bfa', fontSize: '0.85rem', fontWeight: 600, border: '1px solid rgba(99, 102, 241, 0.3)', marginBottom: '32px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <span>🚀</span> NEW: Now available on Android!
                    </div>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-0.03em', color: '#f8fafc' }}>
                        Crack NEET 2026 with an<br />
                        <span style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Unfair AI Advantage.</span>
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: '#94a3b8', maxWidth: '700px', margin: '0 auto 40px', lineHeight: 1.6 }}>
                        India's most advanced AI-powered NEET preparation platform. Generate personalized mock tests, get instant doubt resolutions via image upload, and follow a study plan tailored to your weak areas.
                    </p>

                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <a href="/register" className="btn btn-primary btn-lg" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)', color: 'white', padding: '16px 32px', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 700, textDecoration: 'none', boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)', transition: 'transform 0.2s' }}>
                            Start Preparing for Free →
                        </a>
                        <a href="#android-app" className="btn btn-secondary btn-lg" style={{ background: 'rgba(255,255,255,0.05)', color: '#f8fafc', padding: '16px 32px', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>
                            📱 Download Android App
                        </a>
                    </div>

                    <div style={{ marginTop: '48px', display: 'flex', alignItems: 'center', gap: '16px', color: '#64748b', fontSize: '0.9rem' }}>
                        <div style={{ display: 'flex' }}>
                            {[1, 2, 3, 4, 5].map(i => <span key={i}>⭐</span>)}
                        </div>
                        <span>Trusted by <b>1,200+</b> NEET aspirants</span>
                    </div>
                </header>

                {/* Features Grid */}
                <section style={{ padding: '80px 0' }} id="features">
                    <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px', color: '#f8fafc' }}>Everything you need to score <span style={{ color: '#10b981' }}>720/720</span></h2>
                        <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Powered by Google Gemini AI, designed specifically for the latest NTA syllabus.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                        {[
                            { icon: '🎯', title: 'Adaptive AI Mock Tests', desc: 'Stop taking generic tests. Generate infinite mock papers that specifically target your weak areas in Physics, Chemistry, and Biology.' },
                            { icon: '📸', title: 'Snap & Solve Doubts', desc: 'Stuck on a tricky Physics numerical? Just snap a photo. Our AI tutor will give you step-by-step solutions with NEET shortcuts.' },
                            { icon: '📅', title: 'Personalized Study Plans', desc: 'Get a daily generated schedule based on your performance data. We tell you exactly what chapter to read and what questions to practice.' },
                            { icon: '📈', title: 'Hyper-Detailed Analytics', desc: 'Track your accuracy, time spent per question, and subject-wise percentile. Predict your All India Rank (AIR) before the actual exam.' },
                            { icon: '🧠', title: 'Spaced Repetition Flashcards', desc: 'Memorize complex biological terms and chemical reactions permanently using our scientifically proven AI spaced repetition engine.' },
                            { icon: '📓', title: 'Auto Mistake Book', desc: 'Every incorrect answer is automatically saved to your private Mistake Book for rapid revision a week before the exam.' }
                        ].map((f, i) => (
                            <div key={i} style={{ padding: '32px', background: 'rgba(17, 24, 39, 0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', transition: 'transform 0.3s, border-color 0.3s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '20px' }}>{f.icon}</div>
                                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '12px', color: '#f8fafc' }}>{f.title}</h3>
                                <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Mobile App Section */}
                <section id="android-app" style={{ margin: '80px 0', padding: '64px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05))', borderRadius: '32px', border: '1px solid rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '40px' }}>
                    <div style={{ flex: '1 1 400px' }}>
                        <div style={{ display: 'inline-block', padding: '6px 12px', borderRadius: '8px', background: '#10b981', color: 'white', fontWeight: 700, fontSize: '0.8rem', marginBottom: '16px' }}>100% NATIVE PERFORMANCE</div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f8fafc', marginBottom: '24px', lineHeight: 1.2 }}>Take your NEET prep wherever you go.</h2>
                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', color: '#94a3b8', fontSize: '1.1rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ color: '#10b981' }}>✓</span> Daily push notifications for tests</li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ color: '#10b981' }}>✓</span> Native camera access for doubt solving</li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ color: '#10b981' }}>✓</span> Smooth, distraction-free environment</li>
                        </ul>
                        <a href="/register" className="btn btn-primary" style={{ background: 'white', color: '#0a0e1a', padding: '14px 28px', borderRadius: '12px', fontSize: '1rem', fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
                            Get the Android APK →
                        </a>
                    </div>
                    <div style={{ flex: '1 1 300px', display: 'flex', justifyContent: 'center' }}>
                        <div style={{ width: '280px', height: '560px', borderRadius: '40px', background: '#0a0e1a', border: '8px solid #1e293b', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', position: 'relative', overflow: 'hidden' }}>
                            {/* Mock Mockup Screen */}
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(180deg, rgba(99,102,241,0.2) 0%, #0a0e1a 40%)', padding: '20px' }}>
                                <div style={{ height: '24px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', width: '40%', margin: '20px auto 40px' }} />
                                <div style={{ height: '100px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', marginBottom: '16px' }} />
                                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                                    <div style={{ height: '80px', flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '16px' }} />
                                    <div style={{ height: '80px', flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '16px' }} />
                                </div>
                                <div style={{ height: '200px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px' }} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section style={{ padding: '80px 0', maxWidth: '800px', margin: '0 auto' }} id="faq">
                    <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f8fafc' }}>Frequently Asked Questions</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {faqs.map((faq, index) => (
                            <div key={index} style={{ background: 'rgba(17, 24, 39, 0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden' }}>
                                <button
                                    onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', background: 'transparent', border: 'none', color: '#f8fafc', fontSize: '1.1rem', fontWeight: 600, textAlign: 'left', cursor: 'pointer' }}
                                >
                                    {faq.q}
                                    <span style={{ transform: activeFaq === index ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s', color: '#6366f1' }}>▼</span>
                                </button>
                                {activeFaq === index && (
                                    <div style={{ padding: '0 24px 24px', color: '#94a3b8', lineHeight: 1.6, animation: 'fadeIn 0.3s ease' }}>
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Final CTA */}
                <section style={{ padding: '100px 0', textAlign: 'center' }}>
                    <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: '#f8fafc', marginBottom: '24px' }}>
                        Don't let your competition use AI <br /><span style={{ background: 'linear-gradient(135deg, #10b981, #059669)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>while you study the old way.</span>
                    </h2>
                    <p style={{ fontSize: '1.2rem', color: '#94a3b8', marginBottom: '40px' }}>Join today for free and experience the future of medical entrance preparation.</p>
                    <a href="/register" className="btn btn-primary btn-lg" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)', color: 'white', padding: '18px 40px', borderRadius: '12px', fontSize: '1.2rem', fontWeight: 700, textDecoration: 'none', boxShadow: '0 8px 30px rgba(99, 102, 241, 0.5)' }}>
                        Create Your Free Account →
                    </a>
                </section>

            </div>

            {/* Footer */}
            <footer style={{ background: '#050810', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '64px 24px 40px' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '48px', justifyContent: 'space-between' }}>
                    <div style={{ maxWidth: '300px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '16px' }}>
                            <span>🧠</span> AI NEET Coach
                        </div>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>India's premier intelligent learning system designed exclusively to help students crack the National Eligibility cum Entrance Test.</p>
                    </div>

                    <div style={{ display: 'flex', gap: '64px', flexWrap: 'wrap' }}>
                        <div>
                            <h4 style={{ color: '#f8fafc', fontWeight: 600, marginBottom: '20px' }}>Features</h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <li><a href="#features" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' }}>AI Mock Tests</a></li>
                                <li><a href="#features" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' }}>Snap Doubt Solver</a></li>
                                <li><a href="#features" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' }}>Rank Predictor</a></li>
                                <li><a href="#features" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' }}>NCERT Revision</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 style={{ color: '#f8fafc', fontWeight: 600, marginBottom: '20px' }}>Legal</h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <li><a href="#" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' }}>Privacy Policy</a></li>
                                <li><a href="#" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' }}>Terms of Service</a></li>
                                <li><a href="#" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' }}>Refund Policy</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div style={{ maxWidth: '1280px', margin: '48px auto 0', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                    <p>© 2026 AI NEET Coach. All rights reserved.</p>
                    <p>Powered by Advanced Artificial Intelligence</p>
                </div>
            </footer>
        </div>
    );
}
