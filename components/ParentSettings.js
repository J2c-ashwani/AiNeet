
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

    if (loading) return <div className="animate-pulse h-32 bg-gray-800 rounded-lg"></div>;

    return (
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-2">👨‍👩‍👧‍👦 Parent Connect</h3>
            <p className="text-gray-400 text-sm mb-6">
                Add your parent's details to send them <strong>Weekly Progress Reports</strong>.
                This helps keep them informed about your hard work and improvements.
            </p>

            <form onSubmit={handleSave} className="space-y-4">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Parent's Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="parent@example.com"
                        className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm text-gray-400 mb-1">Parent's Phone (Optional)</label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+91 9876543210"
                        className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                    />
                </div>

                <div className="flex items-center justify-between mt-4">
                    <span className="text-sm font-medium text-green-400">{message}</span>
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
}
