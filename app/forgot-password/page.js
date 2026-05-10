'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Card, Button, Input } from '@/components/ui';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState('email'); // 'email' | 'otp' | 'password' | 'done'
    const [error, setError] = useState('');

    const handleSendEmail = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error || 'Request failed.');
            }

            setStep('otp');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
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
                body: JSON.stringify({ email, otp, type: 'recovery' })
            });
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error || 'Invalid or expired code.');
            }

            setStep('password');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSetPassword = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (newPassword.length < 8 || !/\d/.test(newPassword) || !/[a-zA-Z]/.test(newPassword)) {
            setError('Password must be at least 8 characters with letters and numbers.');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/update-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: newPassword })
            });
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error || 'Failed to update password.');
            }

            setStep('done');
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const stepConfig = {
        email: { icon: '🔑', title: 'Reset Password', subtitle: 'Enter your account email' },
        otp: { icon: '📧', title: 'Check Your Email', subtitle: `We sent a 6-digit code to ${email}` },
        password: { icon: '🛡️', title: 'New Password', subtitle: 'Set a secure new password' },
        done: { icon: '✅', title: 'Password Reset!', subtitle: 'Redirecting you to the app...' },
    };

    const current = stepConfig[step];

    return (
        <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)' }}>
            <Card style={{ maxWidth: '440px', width: '100%', padding: '40px 32px' }} className="animate-fade-in-up">
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>{current.icon}</div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>{current.title}</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>{current.subtitle}</p>
                </div>

                {step !== 'done' && (
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '32px' }}>
                        {['email', 'otp', 'password'].map((s, i) => (
                            <div key={s} style={{
                                width: '40px', height: '4px', borderRadius: '2px',
                                background: ['email', 'otp', 'password'].indexOf(step) >= i
                                    ? 'var(--accent-primary)'
                                    : 'var(--border)',
                                transition: 'background 0.3s'
                            }} />
                        ))}
                    </div>
                )}

                {error && (
                    <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontSize: '0.9rem', marginBottom: '24px', fontWeight: 500 }}>
                        {error}
                    </div>
                )}

                {step === 'email' && (
                    <form onSubmit={handleSendEmail} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <Input 
                            label="Email Address" 
                            type="email" 
                            placeholder="Enter your registered email" 
                            required 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)} 
                            disabled={loading}
                            autoFocus
                        />
                        <Button type="submit" loading={loading} style={{ marginTop: '12px' }}>
                            Send Reset Code →
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
                            Verify Code →
                        </Button>
                        <div style={{ textAlign: 'center', marginTop: '16px' }}>
                            <button 
                                type="button"
                                onClick={() => { setStep('email'); setOtp(''); setError(''); }}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}
                            >
                                Didn't receive it? Send again
                            </button>
                        </div>
                    </form>
                )}

                {step === 'password' && (
                    <form onSubmit={handleSetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <Input 
                            label="New Password" 
                            type="password" 
                            placeholder="8+ characters, letters & numbers" 
                            required 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)} 
                            disabled={loading}
                            autoFocus
                        />
                        <Input 
                            label="Confirm Password" 
                            type="password" 
                            placeholder="Repeat new password" 
                            required 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            disabled={loading}
                        />
                        <Button type="submit" loading={loading} disabled={!newPassword || !confirmPassword} style={{ marginTop: '12px' }}>
                            Set New Password →
                        </Button>
                    </form>
                )}

                {step === 'done' && (
                    <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '12px' }}>
                        <p style={{ color: 'var(--success)', fontSize: '0.9rem', margin: 0, fontWeight: 500 }}>
                            Your password has been updated. Redirecting...
                        </p>
                    </div>
                )}

                {step !== 'done' && (
                    <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Remember it? <a href="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}>Back to Login</a>
                    </p>
                )}
            </Card>
        </div>
    );
}
