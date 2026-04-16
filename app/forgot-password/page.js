'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
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
                // Rate limits will trigger this
                throw new Error(data.error || 'Request failed.');
            }

            // Always generic success UI
            setSuccess(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card animate-fade-in-up">
                <div className="auth-header">
                    <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔑</div>
                    <h1>Reset Password</h1>
                    {!success && <p>Enter your account email</p>}
                </div>

                {success ? (
                    <div style={{ textAlign: 'center', marginBottom: 20 }}>
                        <div style={{ padding: '20px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '12px', marginBottom: 24 }}>
                            <h3 style={{ color: '#4ade80', margin: '0 0 8px 0', fontSize: '1.1rem' }}>Check your email</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0, lineHeight: 1.5 }}>
                                If this email exists in our system, we've sent a secure reset link. 
                                Please check your spam folder if it doesn't arrive in 2 minutes.
                            </p>
                        </div>
                        <Link href="/login" className="btn" style={{ background: 'var(--surface-light)', color: '#fff', textDecoration: 'none', display: 'inline-block', width: '100%' }}>
                            ← Return to Sign In
                        </Link>
                    </div>
                ) : (
                    <>
                        {error && (
                            <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: 20 }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label>Email Address</label>
                                <input 
                                    className="input" 
                                    type="email" 
                                    placeholder="Enter your registered email" 
                                    required 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)} 
                                    disabled={loading}
                                />
                            </div>
                            
                            <button className="btn btn-primary w-full" type="submit" disabled={loading || !email}>
                                {loading ? 'Sending Request...' : 'Send Reset Link →'}
                            </button>
                        </form>

                        <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Remember it? <Link href="/login" style={{ color: 'var(--primary)' }}>Back to Login</Link>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
