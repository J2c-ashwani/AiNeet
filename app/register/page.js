'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

import { Card, Button, Input, Skeleton } from '@/components/ui';

function RegisterContent() {
    const searchParams = useSearchParams();
    const refCode = searchParams.get('ref') || '';
    const challengeId = searchParams.get('challenge') || '';
    const [form, setForm] = useState({ name: '', email: '', password: '', targetYear: '2027' });
    const [step, setStep] = useState('form'); // 'form' | 'otp' | 'done'
    const [resendCooldown, setResendCooldown] = useState(0);
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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
                throw new Error('COLD_START');
            }
            throw new Error(data.error || 'Registration failed');
        }
        return data;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            await performRegistration(0);
            setStep('otp');
        } catch (err) {
            if (err.message === 'COLD_START') {
                setError('Waking secure servers... retrying (5–10 seconds)');
                setTimeout(async () => {
                    try {
                        await performRegistration(1);
                        setStep('otp');
                    } catch (finalErr) {
                        setError(finalErr.message === 'COLD_START' ? 'System timeout. Please refresh and try again.' : finalErr.message);
                    } finally {
                        setLoading(false);
                    }
                }, 6000);
                return;
            }
            setError(err.message);
        } finally {
            if (step === 'form') setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');

        if (!otp || otp.length < 4) {
            setError('Please enter the verification code from your email.');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: form.email, otp, type: 'signup' })
            });
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error || 'Invalid or expired code.');
            }

            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            );

            const { error: loginError } = await supabase.auth.signInWithPassword({
                email: form.email.toLowerCase().trim(),
                password: form.password
            });

            if (loginError) {
                throw new Error('Email verified but login failed. Please sign in manually.');
            }

            setStep('done');
            setTimeout(() => {
                window.location.href = challengeId ? `/challenge/${challengeId}` : '/welcome';
            }, 1500);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendCooldown > 0) return;
        setError('');
        setLoading(true);
        try {
            await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, referralCode: refCode || undefined })
            });
            
            setResendCooldown(60);
            const timer = setInterval(() => {
                setResendCooldown(prev => {
                    if (prev <= 1) { clearInterval(timer); return 0; }
                    return prev - 1;
                });
            }, 1000);
            setOtp('');
            setError('✅ New code sent! Check your inbox.');
            setTimeout(() => setError(''), 4000);
        } catch {
            setError('Failed to resend. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)' }}>
            <Card style={{ maxWidth: '440px', width: '100%', padding: '40px 32px' }} className="animate-fade-in-up">
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>
                        {step === 'form' ? '🧠' : step === 'otp' ? '📧' : '✅'}
                    </div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                        {step === 'form' ? 'Create Account' : step === 'otp' ? 'Verify Email' : "You're In!"}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {step === 'form' ? 'Start your NEET preparation journey' : 
                         step === 'otp' ? `Enter the code sent to ${form.email}` :
                         'Redirecting to your dashboard...'}
                    </p>
                </div>

                {step !== 'done' && (
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '32px' }}>
                        {['form', 'otp'].map((s, i) => (
                            <div key={s} style={{
                                width: '50px', height: '4px', borderRadius: '2px',
                                background: ['form', 'otp'].indexOf(step) >= i
                                    ? 'var(--accent-primary)'
                                    : 'var(--border)',
                                transition: 'background 0.3s'
                            }} />
                        ))}
                    </div>
                )}

                {refCode && step === 'form' && (
                    <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--radius-md)', color: 'var(--success)', fontSize: '0.9rem', marginBottom: '24px', textAlign: 'center', fontWeight: 500 }}>
                        🎉 You were invited by a friend! Sign up to start practicing.
                    </div>
                )}

                {error && (
                    <div style={{ 
                        padding: '16px', 
                        background: error.startsWith('✅') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                        border: `1px solid ${error.startsWith('✅') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`, 
                        borderRadius: 'var(--radius-md)', 
                        color: error.startsWith('✅') ? 'var(--success)' : 'var(--danger)', 
                        fontSize: '0.9rem', 
                        marginBottom: '24px', 
                        fontWeight: 500 
                    }}>
                        {error}
                    </div>
                )}

                {step === 'form' && (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <Input 
                            label="Full Name" 
                            type="text" 
                            placeholder="Enter your name" 
                            required 
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })} 
                            disabled={loading} 
                        />
                        <Input 
                            label="Email Address" 
                            type="email" 
                            placeholder="Enter your email" 
                            required 
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })} 
                            disabled={loading} 
                        />
                        <Input 
                            label="Password" 
                            type="password" 
                            placeholder="Create a password" 
                            required 
                            minLength={6} 
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })} 
                            disabled={loading} 
                        />
                        
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                NEET Target Year
                            </label>
                            <select 
                                style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-glass)', color: 'var(--text-primary)', fontSize: '1rem', outline: 'none' }} 
                                value={form.targetYear} 
                                onChange={(e) => setForm({ ...form, targetYear: e.target.value })} 
                                disabled={loading}
                            >
                                <option value="2027">NEET 2027</option>
                                <option value="2028">NEET 2028</option>
                                <option value="2029">NEET 2029</option>
                            </select>
                        </div>

                        <Button type="submit" loading={loading} style={{ marginTop: '12px' }}>
                            Create Account →
                        </Button>
                    </form>
                )}

                {step === 'otp' && (
                    <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <Input 
                            label="Verification Code" 
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={8}
                            placeholder="Enter code from email" 
                            required 
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 8))} 
                            disabled={loading}
                            autoFocus
                            style={{ fontSize: '1.5rem', letterSpacing: '8px', textAlign: 'center', fontWeight: 700 }}
                        />
                        
                        <Button type="submit" loading={loading} disabled={otp.length < 4} style={{ marginTop: '12px' }}>
                            Verify & Continue →
                        </Button>

                        <div style={{ textAlign: 'center', marginTop: '16px' }}>
                            <button 
                                type="button"
                                onClick={handleResendOtp}
                                disabled={loading}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}
                            >
                                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Didn't receive it? Resend code"}
                            </button>
                        </div>
                    </form>
                )}

                {step === 'done' && (
                    <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '12px' }}>
                        <p style={{ color: 'var(--success)', fontSize: '0.9rem', margin: 0, fontWeight: 500 }}>
                            Account verified! Redirecting...
                        </p>
                    </div>
                )}

                {step === 'form' && (
                    <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Already have an account? <a href="/login" style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'none' }}>Sign In</a>
                    </p>
                )}
            </Card>
        </div>
    );
}

export const dynamic = 'force-dynamic';

export default function RegisterPage() {
    return <RegisterContent />;
}
