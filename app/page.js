'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
    const { user } = useAuth();

    const features = [
        {
            title: 'Mock Test Generator',
            desc: 'Configure and generate infinite AI-powered NEET mock tests.',
            icon: '📝',
            path: '/test/configure',
            color: '#6366f1'
        },
        {
            title: 'NEET Battleground',
            desc: 'Compete in real-time 1v1 mock battles against friends or randoms.',
            icon: '⚔️',
            path: '/battleground',
            color: '#f43f5e'
        },
        {
            title: 'NCERT Blueprint',
            desc: 'Track your line-by-line reading progress of the NCERT syllabus.',
            icon: '📚',
            path: '/blueprint',
            color: '#38bdf8'
        },
        {
            title: 'AI Doubt Solver',
            desc: 'Stuck on a numeric? Ask our 24/7 AI tutor for step-by-step help.',
            icon: '💡',
            path: '/doubts',
            color: '#10b981'
        },
        {
            title: 'Mistake Book',
            desc: 'Automatically tracks your incorrect answers for targeted revision.',
            icon: '📓',
            path: '/mistakes',
            color: '#f59e0b'
        },
        {
            title: 'Global Leaderboard',
            desc: 'Check the real-time rankings and see where you stand globally.',
            icon: '🏆',
            path: '/leaderboard',
            color: '#8b5cf6'
        }
    ];

    return (
        <>
        <div style={{ padding: '40px 24px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
            
            
            {/* Header / Welcome */}
            <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>
                        {user
                            ? <>Welcome back, <span style={{ color: '#818cf8' }}>{user.full_name?.split(' ')[0] || 'Aspirant'}</span> 👋</>
                            : <><span style={{ background: 'linear-gradient(135deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI NEET Coach</span> — Explore Features</>
                        }
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
                        Explore all intelligent preparation features below.
                    </p>
                </div>
                
                {!user && (
                    <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '16px 24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div>
                            <div style={{ color: '#e0e7ff', fontWeight: 600, marginBottom: '4px' }}>You are browsing as a Guest</div>
                            <div style={{ color: '#818cf8', fontSize: '0.9rem' }}>Sign in to save test history and analytics.</div>
                        </div>
                        <Link href="/login" style={{ background: '#6366f1', color: 'white', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
                            Sign In
                        </Link>
                    </div>
                )}
            </div>

            {/* Feature Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                {features.map((feature, i) => (
                    <Link href={feature.path} key={i} style={{ textDecoration: 'none' }}>
                        <div style={{ 
                            background: '#111827', 
                            border: '1px solid #1f2937', 
                            borderRadius: '20px', 
                            padding: '24px', 
                            height: '100%',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.borderColor = feature.color;
                            e.currentTarget.style.boxShadow = `0 10px 30px -10px ${feature.color}40`;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = '#1f2937';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                        >
                            <div style={{ 
                                width: '56px', 
                                height: '56px', 
                                borderRadius: '16px', 
                                background: `${feature.color}15`, 
                                color: feature.color, 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                fontSize: '1.8rem',
                                marginBottom: '20px'
                            }}>
                                {feature.icon}
                            </div>
                            
                            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
                                {feature.title}
                            </h3>
                            
                            <p style={{ color: '#94a3b8', lineHeight: 1.5, fontSize: '0.95rem', flexGrow: 1 }}>
                                {feature.desc}
                            </p>
                            
                            <div style={{ marginTop: '24px', color: feature.color, fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                Open Feature 
                                <span style={{ transform: 'translateX(2px)' }}>→</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Bottom Banner */}
            <div style={{ marginTop: '48px', background: 'linear-gradient(135deg, #1e1b4b, #312e81)', borderRadius: '24px', padding: '32px', textAlign: 'center', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginBottom: '12px' }}>
                    Download the Mobile App
                </h3>
                <p style={{ color: '#c7d2fe', marginBottom: '24px', maxWidth: '600px', margin: '0 auto 24px' }}>
                    Get the smoothest experience with push notifications, offline mode, and native camera integration for doubt solving.
                </p>
                <a href="/download" style={{ background: '#22c55e', color: 'white', padding: '12px 24px', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, display: 'inline-block' }}>
                    📱 Download Android App
                </a>
            </div>

        </div>
        </>
    );
}
