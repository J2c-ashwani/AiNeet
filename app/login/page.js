'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // MD UX Fix: Catch bad links
    useEffect(() => {
        const errorParam = searchParams.get('error');
        if (errorParam === 'reset_link_invalid') {
            setError('This reset link is expired or invalid. Please request a new one.');
        } else if (errorParam === 'auth_failed') {
            setError('Authentication failed. Please try again.');
        }
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            // Hard navigate to dashboard to force SSR to read the freshly baked session cookies
            window.location.href = '/';
        } catch (err) {
            setError(err.message);
        } finally { setLoading(false); }
    };

    return (
        <div className="auth-page">
            <div className="auth-card animate-fade-in-up">
                <div className="auth-header">
                    <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🧠</div>
                    <h1>Welcome Back</h1>
                    <p>Continue your NEET preparation</p>
                </div>

                {error && (
                    <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: 20 }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Email</label>
                        <input className="input" type="email" placeholder="Enter your email" required value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div className="input-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={{ margin: 0 }}>Password</label>
                            <Link href="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none' }}>Forgot Password?</Link>
                        </div>
                        <input className="input" type="password" placeholder="Enter your password" required value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })} />
                    </div>
                    <button className="btn btn-primary w-full" type="submit" disabled={loading}>
                        {loading ? 'Signing In...' : 'Sign In →'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Don't have an account? <a href="/register">Create Account</a>
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="auth-page">
                <div className="auth-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔐</div>
                    <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
                </div>
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
