
"use client";
import { useState, useEffect } from 'react';

export default function ParentSettings() {
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetch('/api/user/parent-settings')
            .then(res => res.json())
            .then(data => {
                if (data.parent_email) setEmail(data.parent_email);
                if (data.parent_phone) setPhone(data.parent_phone);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load settings", err);
                setLoading(false);
            });
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            const res = await fetch('/api/user/parent-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ parent_email: email, parent_phone: phone })
            });
            const data = await res.json();

            if (res.ok) {
                setMessage('✅ Settings saved successfully!');
            } else {
                setMessage('❌ ' + (data.error || 'Failed to save'));
            }
        } catch (err) {
            setMessage('❌ Network Error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="card animate-pulse" style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spinner" style={{ width: 30, height: 30 }}></div>
        </div>
    );

    return (
        <div className="card">
            <h3 className="mb-2" style={{ fontSize: '1.4rem' }}>👨‍👩‍👧‍👦 Parent Connect</h3>
            <p className="text-muted text-sm mb-6" style={{ lineHeight: 1.6 }}>
                Add your parent's details to send them <strong style={{ color: 'var(--text-primary)' }}>Weekly Progress Reports</strong>.
                This helps keep them informed about your hard work and improvements.
            </p>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Parent's Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="parent@example.com"
                        className="input"
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Parent's Phone (Optional)</label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+91 9876543210"
                        className="input"
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: message.includes('❌') ? 'var(--danger)' : 'var(--success)' }}>
                        {message}
                    </span>
                    <button
                        type="submit"
                        disabled={saving}
                        className="btn btn-primary"
                        style={{ minWidth: '160px' }}
                    >
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
}
