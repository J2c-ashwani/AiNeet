'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

/**
 * P0-2 Trust Fix: Registration Page
 * 
 * Two-step auth flow:
 * 1. Server creates account via /api/auth/register (admin.createUser)
 * 2. Client performs login via Supabase browser client (owns cookies/session)
 * 3. Hard navigate to dashboard after confirmed client auth success
 * 
 * This eliminates SSR cookie propagation ambiguity entirely.
 */

export default function RegisterPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const refCode = searchParams.get('ref') || '';
    const challengeId = searchParams.get('challenge') || '';
    const [form, setForm] = useState({ name: '', email: '', password: '', targetYear: '2026' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // MD Mandate: Pre-Signup Database Wake Call (Silent)
    useEffect(() => {
        fetch('/api/cron/keepalive').catch(() => null); 
    }, []);

    const performRegistration = async (retryCount = 0) => {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...form, referralCode: refCode || undefined })
        });
        
        let data;
        const text = await res.text();
        try {
            data = JSON.parse(text);
        } catch {
            throw new Error('Server starting. Please try again in 5 seconds.');
        }

        if (!res.ok) {
            if (res.status === 500 && retryCount < 1) {
                // Supabase cold start detected. Throw specific error to trigger auto-retry
                throw new Error('COLD_START');
            }
            throw new Error(data.error || 'Registration failed');
        }
        return data;
    };

    const performClientLogin = async () => {
        // P0-2: Client owns session establishment — no SSR cookie ambiguity
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        const { error: loginError } = await supabase.auth.signInWithPassword({
            email: form.email.toLowerCase().trim(),
            password: form.password
        });

        if (loginError) {
            throw new Error('Account created but login failed. Please sign in manually.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            // Step 1: Server creates the account
            await performRegistration(0);

            // Step 2: Client establishes auth session (owns cookies)
            await performClientLogin();
            
            // Step 3: Hard navigate after confirmed auth
            if (challengeId) {
                window.location.href = `/challenge/${challengeId}`;
            } else {
                window.location.href = '/dashboard';
            }
        } catch (err) {
            if (err.message === 'COLD_START') {
                setError('Waking secure servers... retrying (5–10 seconds)');
                
                // MD Safety Net: Auto-retry after 6 seconds to allow Supabase to boot
                setTimeout(async () => {
                    try {
                        await performRegistration(1);
                        await performClientLogin();
                        window.location.href = challengeId ? `/challenge/${challengeId}` : '/dashboard';
                    } catch (finalErr) {
                        setError(finalErr.message === 'COLD_START' ? 'System timeout. Please refresh and try again.' : finalErr.message);
                        setLoading(false);
                    }
                }, 6000);
            } else {
                setError(err.message);
                setLoading(false);
            }
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card animate-fade-in-up">
                <div className="auth-header">
                    <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🧠</div>
                    <h1>Create Account</h1>
                    <p>Start your NEET preparation journey</p>
                </div>

                {refCode && (
                    <div style={{ padding: '12px 16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--radius-md)', color: '#10b981', fontSize: '0.85rem', marginBottom: 20, textAlign: 'center' }}>
                        🎉 You were invited by a friend! Sign up to start practicing together.
                    </div>
                )}

                {error && (
                    <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: 20 }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Full Name</label>
                        <input className="input" type="text" placeholder="Enter your name" required value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div className="input-group">
                        <label>Email</label>
                        <input className="input" type="email" placeholder="Enter your email" required value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <input className="input" type="password" placeholder="Create a password" required minLength={6} value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })} />
                    </div>
                    <div className="input-group">
                        <label>NEET Target Year</label>
                        <select className="input" value={form.targetYear} onChange={(e) => setForm({ ...form, targetYear: e.target.value })}>
                            <option value="2026">NEET 2026</option>
                            <option value="2027">NEET 2027</option>
                            <option value="2028">NEET 2028</option>
                        </select>
                    </div>
                    <button className="btn btn-primary w-full" type="submit" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Create Account →'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Already have an account? <a href="/login">Sign In</a>
                </p>
            </div>
        </div>
    );
}
