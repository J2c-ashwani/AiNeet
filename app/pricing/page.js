'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data.user) setUser(data.user);
            })
            .catch(() => { });
    }, []);

    const handleSubscribe = async (planId) => {
        if (!user) {
            router.push('/login?next=/pricing');
            return;
        }

        setLoading(planId);
        setError('');

        try {
            // 1. Create order
            const res = await fetch('/api/subscription/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId }) // 'pro' or 'premium'
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to create order');

            // 2. Mock Verification Flow (Since we use dummy keys for now)
            if (data.isMock) {
                const verifyRes = await fetch('/api/subscription/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderId: data.orderId, planId: data.planId })
                });
                const verifyData = await verifyRes.json();

                if (verifyRes.ok) {
                    alert(`✅ Upgraded to ${planId.toUpperCase()} successfully!`);
                    router.push('/profile');
                } else {
                    throw new Error(verifyData.error || 'Mock Verification Failed');
                }
            } else {
                alert('Cashfree integration triggered (Needs Cashfree SDK to complete)');
                // In production, we'd load Cashfree script, open modal, listen to callback, then call /verify
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Navbar />
            <div className="page" style={{ maxWidth: 1000 }}>
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold mb-4" style={{ background: 'linear-gradient(to right, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Unlock Your Full NEET Potential
                    </h1>
                    <p className="text-xl text-gray-400">Choose the plan that fits your preparation needs.</p>
                </div>

                {error && (
                    <div className="bg-red-900/50 border border-red-500/50 text-red-200 p-4 rounded-lg mb-8 text-center">
                        {error}
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">

                    {/* Pro Plan */}
                    <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8 relative flex flex-col hover:border-blue-500/30 transition-colors">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-white mb-2">NEET Pro</h2>
                            <p className="text-gray-400 mb-4">Perfect for serious aspirants needing rigorous practice.</p>
                            <div className="text-3xl font-extrabold text-white">₹199<span className="text-lg text-gray-500 font-normal">/month</span></div>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1">
                            {['Up to 20 Custom AI Tests / month', '50 AI Doubts Resolution / day', '30 NCERT AI Explanations / month', 'Unlimited Daily Challenges', 'Multiplayer Battleground Access', 'Ad-Free Experience', 'PDF Export for Tests'].map((feature, i) => (
                                <li key={i} className="flex items-start text-gray-300">
                                    <span className="text-blue-500 mr-2">✓</span> {feature}
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => handleSubscribe('pro')}
                            disabled={loading}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${user?.subscription_tier === 'pro' ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                        >
                            {loading === 'pro' ? 'Processing...' : (user?.subscription_tier === 'pro' ? 'Current Plan' : 'Upgrade to Pro')}
                        </button>
                    </div>

                    {/* Premium Plan */}
                    <div className="bg-gradient-to-b from-[#1a1a2e] to-[#111] border border-blue-500/50 rounded-2xl p-8 relative flex flex-col shadow-[0_0_30px_rgba(59,130,246,0.15)] transform md:-translate-y-4">
                        <div className="absolute top-0 right-8 transform -translate-y-1/2">
                            <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</span>
                        </div>

                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-white mb-2">NEET Premium</h2>
                            <p className="text-gray-400 mb-4">The ultimate arsenal for maximizing your score.</p>
                            <div className="text-3xl font-extrabold text-white">₹399<span className="text-lg text-gray-500 font-normal">/month</span></div>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1">
                            {['100 Custom AI Tests / month', 'Unlimited AI Doubts', 'Unlimited NCERT Explanations', 'Parent Connect (Weekly Reports)', 'Priority Email Support', 'Everything in Pro Plan'].map((feature, i) => (
                                <li key={i} className="flex items-start text-gray-300">
                                    <span className="text-purple-400 mr-2">✦</span> {feature}
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => handleSubscribe('premium')}
                            disabled={loading}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${user?.subscription_tier === 'premium' ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white'}`}
                        >
                            {loading === 'premium' ? 'Processing...' : (user?.subscription_tier === 'premium' ? 'Current Plan' : 'Upgrade to Premium')}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
