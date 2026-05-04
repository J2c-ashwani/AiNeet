'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UpdatePasswordPage() {
    const router = useRouter();
    const [form, setForm] = useState({ password: '', confirm: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirm) {
            setError('Passwords do not match.');
            return;
        }

        if (form.password.length < 8 || !/\d/.test(form.password) || !/[a-zA-Z]/.test(form.password)) {
            setError('Password must be at least 8 characters long and contain both letters and numbers.');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/update-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: form.password })
            });
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error || 'Failed to update password.');
            }

            setSuccess(true);
            // Wait 1.5 seconds for UX completion feeling before aggressive hard-route to dashboard
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);

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
                    <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🛡️</div>
                    <h1>Secure New Password</h1>
                    <p>Almost there. Enter your new credentials.</p>
                </div>

                {success ? (
                    <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '12px' }}>
                        <div style={{ fontSize: '2rem', marginBottom: 10 }}>✅</div>
                        <h3 style={{ color: '#4ade80', margin: '0 0 8px 0' }}>Password Secured</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                            Redirecting you to the dashboard...
                        </p>
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
                                <label>New Password</label>
                                <input 
                                    className="input" 
                                    type="password" 
                                    placeholder="8+ characters, letters & numbers" 
                                    required 
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })} 
                                    disabled={loading}
                                />
                            </div>
                            
                            <div className="input-group" style={{ marginBottom: 24 }}>
                                <label>Confirm Password</label>
                                <input 
                                    className="input" 
                                    type="password" 
                                    placeholder="Repeat new password" 
                                    required 
                                    value={form.confirm}
                                    onChange={(e) => setForm({ ...form, confirm: e.target.value })} 
                                    disabled={loading}
                                />
                            </div>
                            
                            <button className="btn btn-primary w-full" type="submit" disabled={loading || !form.password || !form.confirm}>
                                {loading ? 'Securing Account...' : 'Confirm & Login →'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
