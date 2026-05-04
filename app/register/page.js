'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';

/**
 * Registration Page with Email OTP Verification
 * 
 * Flow:
 * 1. User fills form → server creates unverified account
 * 2. User enters 6-digit OTP from email → verifies email
 * 3. Client auto-logs in → redirects to home
 */

export default function RegisterPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const refCode = searchParams.get('ref') || '';
    const challengeId = searchParams.get('challenge') || '';
    const [form, setForm] = useState({ name: '', email: '', password: '', targetYear: '2026' });
    const [step, setStep] = useState('form'); // 'form' | 'otp' | 'done'
    const [resendCooldown, setResendCooldown] = useState(0);
    const [otp, setOtp] = useState('');
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
                throw new Error('COLD_START');
            }
            throw new Error(data.error || 'Registration failed');
        }
        return data;
    };

    // Step 1: Submit registration form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            await performRegistration(0);
            // Account created, OTP email sent — move to verification
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
                return; // Don't setLoading(false) yet — auto-retry is pending
            }
            setError(err.message);
        } finally {
            if (step === 'form') setLoading(false);
        }
    };

    // Step 2: Verify OTP
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

            // OTP verified — now establish client session
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

            // Success
            setStep('done');
            setTimeout(() => {
                window.location.href = challengeId ? `/challenge/${challengeId}` : '/';
            }, 1500);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP via API (avoids Supabase client-side rate limits)
    const handleResendOtp = async () => {
        if (resendCooldown > 0) return;
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, referralCode: refCode || undefined })
            });
            // This will cleanup zombie + re-create + resend OTP
            // Start 60s cooldown
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
        <div className="auth-page">
            <div className="auth-card animate-fade-in-up">
                <div className="auth-header">
                    <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>
                        {step === 'form' ? '🧠' : step === 'otp' ? '📧' : '✅'}
                    </div>
                    <h1>
                        {step === 'form' ? 'Create Account' : step === 'otp' ? 'Verify Email' : 'You\'re In!'}
                    </h1>
                    <p>
                        {step === 'form' ? 'Start your NEET preparation journey' : 
                         step === 'otp' ? `Enter the code sent to ${form.email}` :
                         'Redirecting to your dashboard...'}
                    </p>
                </div>

                {/* Progress indicator */}
                {step !== 'done' && (
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '24px' }}>
                        {['form', 'otp'].map((s, i) => (
                            <div key={s} style={{
                                width: '50px', height: '4px', borderRadius: '2px',
                                background: ['form', 'otp'].indexOf(step) >= i
                                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                    : 'rgba(255,255,255,0.08)',
                                transition: 'background 0.3s'
                            }} />
                        ))}
                    </div>
                )}

                {refCode && step === 'form' && (
                    <div style={{ padding: '12px 16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--radius-md)', color: '#10b981', fontSize: '0.85rem', marginBottom: 20, textAlign: 'center' }}>
                        🎉 You were invited by a friend! Sign up to start practicing together.
                    </div>
                )}

                {error && (
                    <div style={{ 
                        padding: '12px 16px', 
                        background: error.startsWith('✅') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', 
                        border: `1px solid ${error.startsWith('✅') ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, 
                        borderRadius: 'var(--radius-md)', 
                        color: error.startsWith('✅') ? '#10b981' : 'var(--danger)', 
                        fontSize: '0.85rem', marginBottom: 20 
                    }}>
                        {error}
                    </div>
                )}

                {/* Step 1: Registration Form */}
                {step === 'form' && (
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label>Full Name</label>
                            <input className="input" type="text" placeholder="Enter your name" required value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={loading} />
                        </div>
                        <div className="input-group">
                            <label>Email</label>
                            <input className="input" type="email" placeholder="Enter your email" required value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })} disabled={loading} />
                        </div>
                        <div className="input-group">
                            <label>Password</label>
                            <input className="input" type="password" placeholder="Create a password" required minLength={6} value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })} disabled={loading} />
                        </div>
                        <div className="input-group">
                            <label>NEET Target Year</label>
                            <select className="input" value={form.targetYear} onChange={(e) => setForm({ ...form, targetYear: e.target.value })} disabled={loading}>
                                <option value="2026">NEET 2026</option>
                                <option value="2027">NEET 2027</option>
                                <option value="2028">NEET 2028</option>
                            </select>
                        </div>
                        <button className="btn btn-primary w-full" type="submit" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Create Account →'}
                        </button>
                    </form>
                )}

                {/* Step 2: OTP Verification */}
                {step === 'otp' && (
                    <form onSubmit={handleVerifyOtp}>
                        <div className="input-group">
                            <label>Verification Code</label>
                            <input 
                                className="input" 
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
                        </div>
                        
                        <button className="btn btn-primary w-full" type="submit" disabled={loading || otp.length < 4}>
                            {loading ? 'Verifying...' : 'Verify & Continue →'}
                        </button>

                        <div style={{ textAlign: 'center', marginTop: 16 }}>
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

                {/* Step 3: Done */}
                {step === 'done' && (
                    <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '12px' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                            Account verified! Redirecting...
                        </p>
                    </div>
                )}

                {step === 'form' && (
                    <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Already have an account? <Link href="/login">Sign In</Link>
                    </p>
                )}
            </div>
        </div>
    );
}
