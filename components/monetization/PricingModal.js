
"use client";
import { useState } from 'react';

export default function PricingModal({ isOpen, onClose, userPlan }) {
    if (!isOpen) return null;

    const handleSubscribe = async (planId) => {
        try {
            // 1. Create Order
            const res = await fetch('/api/subscription/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId })
            });
            const data = await res.json();

            if (data.error) throw new Error(data.error);

            // 2. Initialize Razorpay (Mock for now)
            alert(`Integration Ready! \nOrder ID: ${data.orderId}\nAmount: ₹${data.amount}\n\nIn production, this opens Razorpay.`);

            // 3. Verify Payment (Simulation)
            const verifyRes = await fetch('/api/subscription/verify', {
                method: 'POST',
                body: JSON.stringify({
                    orderId: data.orderId,
                    paymentId: 'pay_mock_' + Date.now(),
                    signature: 'mock_sig',
                    planId
                })
            });

            if (verifyRes.ok) {
                alert("Upgrade Successful! Welcome to Pro.");
                window.location.reload();
            }

        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl w-full max-w-4xl overflow-hidden relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>

                <div className="grid md:grid-cols-2">
                    {/* Pro Plan */}
                    <div className="p-8 border-r border-gray-800 flex flex-col">
                        <div className="mb-4">
                            <span className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Most Popular</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Pro Plan</h3>
                        <div className="text-4xl font-bold text-white mb-6">₹199<span className="text-lg text-gray-500 font-normal">/mo</span></div>

                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center text-gray-300">
                                <span className="text-green-500 mr-2">✓</span> 50 AI Doubts / month
                            </li>
                            <li className="flex items-center text-gray-300">
                                <span className="text-green-500 mr-2">✓</span> 20 AI Tests / month
                            </li>
                            <li className="flex items-center text-gray-300">
                                <span className="text-green-500 mr-2">✓</span> No Ads
                            </li>
                            <li className="flex items-center text-gray-300">
                                <span className="text-green-500 mr-2">✓</span> Detailed Analytics
                            </li>
                        </ul>

                        <button
                            onClick={() => handleSubscribe('pro')}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all"
                        >
                            Upgrade to Pro
                        </button>
                    </div>

                    {/* Premium Plan */}
                    <div className="p-8 bg-gradient-to-br from-[#1a1a1a] to-purple-900/20 flex flex-col">
                        <div className="mb-4">
                            <span className="bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Best Value</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Premium</h3>
                        <div className="text-4xl font-bold text-white mb-6">₹399<span className="text-lg text-gray-500 font-normal">/mo</span></div>

                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center text-gray-300">
                                <span className="text-purple-400 mr-2">✦</span> 200 AI Doubts / month
                            </li>
                            <li className="flex items-center text-gray-300">
                                <span className="text-purple-400 mr-2">✦</span> 100 AI Tests / month
                            </li>
                            <li className="flex items-center text-gray-300">
                                <span className="text-purple-400 mr-2">✦</span> Priority Support
                            </li>
                            <li className="flex items-center text-gray-300">
                                <span className="text-purple-400 mr-2">✦</span> Parent Weekly Reports
                            </li>
                        </ul>

                        <button
                            onClick={() => handleSubscribe('premium')}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-purple-900/30"
                        >
                            Get Premium
                        </button>
                    </div>
                </div>

                <div className="bg-gray-900/50 p-4 text-center text-gray-500 text-xs">
                    Secure payment via Razorpay. Cancel anytime.
                </div>
            </div>
        </div>
    );
}
