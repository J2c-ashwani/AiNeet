'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState('email'); // 'email' | 'otp' | 'password' | 'done'
    const [error, setError] = useState('');

    // Step 1: Send reset email
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

    // Step 2: Verify OTP code from email
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

    // Step 3: Set new password
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
        <div className="auth-page">
            <div className="auth-card animate-fade-in-up">
                <div className="auth-header">
                    <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>{current.icon}</div>
                    <h1>{current.title}</h1>
                    <p>{current.subtitle}</p>
                </div>

                {/* Progress indicator */}
                {step !== 'done' && (
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '24px' }}>
                        {['email', 'otp', 'password'].map((s, i) => (
                            <div key={s} style={{
                                width: '40px', height: '4px', borderRadius: '2px',
                                background: ['email', 'otp', 'password'].indexOf(step) >= i
                                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                    : 'rgba(255,255,255,0.08)',
                                transition: 'background 0.3s'
                            }} />
                        ))}
                    </div>
                )}

                {error && (
                    <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: 20 }}>
                        {error}
                    </div>
                )}

                {/* Step 1: Email */}
                <div style={{ display: step === 'email' ? 'block' : 'none' }}>
                    <form onSubmit={handleSendEmail}>
                        <div className="input-group">
                            <label>Email Address</label>
                            <input 
                                className="input" 
                                type="email" 
                                placeholder="Enter your registered email" 
                                required={step === 'email'} 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)} 
                                disabled={loading}
                                autoFocus
                            />
                        </div>
                        
                        <button className="btn btn-primary w-full" type="submit" disabled={loading || !email}>
                            {loading ? 'Sending Code...' : 'Send Reset Code →'}
                        </button>
                    </form>
                </div>

                {/* Step 2: OTP */}
                <div style={{ display: step === 'otp' ? 'block' : 'none' }}>
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
                                required={step === 'otp'} 
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 8))} 
                                disabled={loading}
                                autoFocus
                                style={{ fontSize: '1.5rem', letterSpacing: '8px', textAlign: 'center', fontWeight: 700 }}
                            />
                        </div>
                        
                        <button className="btn btn-primary w-full" type="submit" disabled={loading || otp.length < 4}>
                            {loading ? 'Verifying...' : 'Verify Code →'}
                        </button>

                        <div style={{ textAlign: 'center', marginTop: 16 }}>
                            <button 
                                type="button"
                                onClick={() => { setStep('email'); setOtp(''); setError(''); }}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}
                            >
                                Didn&apos;t receive it? Send again
                            </button>
                        </div>
                    </form>
                </div>

                {/* Step 3: New Password */}
                <div style={{ display: step === 'password' ? 'block' : 'none' }}>
                    <form onSubmit={handleSetPassword}>
                        <div className="input-group">
                            <label>New Password</label>
                            <input 
                                className="input" 
                                type="password" 
                                placeholder="8+ characters, letters & numbers" 
                                required={step === 'password'} 
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)} 
                                disabled={loading}
                                autoFocus
                            />
                        </div>
                        
                        <div className="input-group" style={{ marginBottom: 24 }}>
                            <label>Confirm Password</label>
                            <input 
                                className="input" 
                                type="password" 
                                placeholder="Repeat new password" 
                                required={step === 'password'} 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                disabled={loading}
                            />
                        </div>
                        
                        <button className="btn btn-primary w-full" type="submit" disabled={loading || !newPassword || !confirmPassword}>
                            {loading ? 'Securing Account...' : 'Set New Password →'}
                        </button>
                    </form>
                </div>

                {/* Step 4: Done */}
                {step === 'done' && (
                    <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '12px' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                            Your password has been updated. Redirecting...
                        </p>
                    </div>
                )}

                {step !== 'done' && (
                    <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Remember it? <a href="/login" style={{ color: 'var(--primary)' }}>Back to Login</a>
                    </p>
                )}
            </div>
        </div>
    );
}
