'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Card, Button, Input, Skeleton } from '@/components/ui';

function LoginContent() {
    const searchParams = useSearchParams();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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
            window.location.href = '/';
        } catch (err) {
            setError(err.message);
        } finally { setLoading(false); }
    };

    return (
        <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)' }}>
            <Card style={{ maxWidth: '440px', width: '100%', padding: '40px 32px' }} className="animate-fade-in-up">
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🧠</div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Welcome Back</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Continue your NEET preparation</p>
                </div>

                {error && (
                    <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontSize: '0.9rem', marginBottom: '24px', fontWeight: 500 }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <Input 
                        label="Email" 
                        type="email" 
                        placeholder="Enter your email" 
                        required 
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })} 
                    />
                    
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Password</label>
                            <a href="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}>Forgot Password?</a>
                        </div>
                        <Input 
                            type="password" 
                            placeholder="Enter your password" 
                            required 
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })} 
                        />
                    </div>
                    
                    <Button type="submit" loading={loading} style={{ marginTop: '12px' }}>
                        Sign In →
                    </Button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Don't have an account? <a href="/register" style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'none' }}>Create Account</a>
                </p>
            </Card>
        </div>
    );
}

export const dynamic = 'force-dynamic';

export default function LoginPage() {
    return <LoginContent />;
}
