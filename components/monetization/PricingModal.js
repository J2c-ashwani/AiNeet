
"use client";
import { useState } from 'react';
import { Button } from '@/components/ui';
import { Icon } from '@/components/ui/Icon';
import { openCashfreeCheckout } from '@/lib/client/cashfree-checkout';

export default function PricingModal({ isOpen, onClose, userPlan }) {
    const [submittingPlan, setSubmittingPlan] = useState(null);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubscribe = async (planId) => {
        setSubmittingPlan(planId);
        setError('');
        try {
            const res = await fetch('/api/subscription/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId })
            });
            const data = await res.json();

            if (!res.ok || data.error) {
                throw new Error(data.error || 'Payment could not be started.');
            }

            await openCashfreeCheckout({
                paymentSessionId: data.paymentSessionId,
                environment: data.environment,
            });
        } catch (err) {
            setError(err.message || 'Payment could not be started.');
        } finally {
            setSubmittingPlan(null);
        }
    };

    return (
        <div className="fixed inset-0 surface_black_80 backdrop-blur-sm z-50 flex items-center justify-center space_pa_4">
            <div className="surface_gray_900 border line_gray_800 radius_2xl w-full max-w-4xl overflow-hidden relative">
                <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close" className="absolute top-2 right-2 w-11 h-11 flex items-center justify-center tone_gray_400 hover_tone_white space_pa_2">
                    <Icon name="X" size={20} />
                </Button>

                <div className="grid md:grid-cols-2">
                    {/* Pro Plan */}
                    <div className="space_pa_8 border-r line_gray_800 flex flex-col">
                        <div className="space_mb_4">
                            <span className="surface_blue_500_10 tone_blue_500 space_px_3 space_py_1 radius_full text-xs font-bold uppercase tracking-wider">Most Popular</span>
                        </div>
                        <h3 className="text-2xl font-bold tone_white space_mb_2">Pro Plan</h3>
                        <div className="text-4xl font-bold tone_white space_mb_6">₹199<span className="text-lg tone_gray_500 font-normal">/mo</span></div>

                        <ul className="space-y-4 space_mb_8 flex-1">
                            <li className="flex items-center tone_gray_300">
                                <Icon name="Check" size={18} className="tone_green_500 space_mr_2" /> 50 AI Doubts / month
                            </li>
                            <li className="flex items-center tone_gray_300">
                                <Icon name="Check" size={18} className="tone_green_500 space_mr_2" /> 20 AI Tests / month
                            </li>
                            <li className="flex items-center tone_gray_300">
                                <Icon name="Check" size={18} className="tone_green_500 space_mr_2" /> No Ads
                            </li>
                            <li className="flex items-center tone_gray_300">
                                <Icon name="Check" size={18} className="tone_green_500 space_mr_2" /> Detailed Analytics
                            </li>
                        </ul>

                        <Button
                            onClick={() => handleSubscribe('pro')}
                            disabled={submittingPlan !== null || userPlan === 'pro'}
                            loading={submittingPlan === 'pro'}
                            className="w-full surface_blue_600 hover_surface_blue_500 tone_white font-bold space_py_3 radius_xl transition-all"
                        >
                            {userPlan === 'pro' ? 'Current Plan' : 'Upgrade to Pro'}
                        </Button>
                    </div>

                    {/* Premium Plan */}
                    <div className="space_pa_8 surface_gray_900 flex flex-col">
                        <div className="space_mb_4">
                            <span className="surface_purple_500_10 tone_purple_400 space_px_3 space_py_1 radius_full text-xs font-bold uppercase tracking-wider">Best Value</span>
                        </div>
                        <h3 className="text-2xl font-bold tone_white space_mb_2">Premium</h3>
                        <div className="text-4xl font-bold tone_white space_mb_6">₹399<span className="text-lg tone_gray_500 font-normal">/mo</span></div>

                        <ul className="space-y-4 space_mb_8 flex-1">
                            <li className="flex items-center tone_gray_300">
                                <Icon name="Sparkles" size={18} className="tone_purple_400 space_mr_2" /> 200 AI Doubts / month
                            </li>
                            <li className="flex items-center tone_gray_300">
                                <Icon name="Sparkles" size={18} className="tone_purple_400 space_mr_2" /> 100 AI Tests / month
                            </li>
                            <li className="flex items-center tone_gray_300">
                                <Icon name="Sparkles" size={18} className="tone_purple_400 space_mr_2" /> Priority Support
                            </li>
                            <li className="flex items-center tone_gray_300">
                                <Icon name="Sparkles" size={18} className="tone_purple_400 space_mr_2" /> Parent Weekly Reports
                            </li>
                        </ul>

                        <Button
                            onClick={() => handleSubscribe('premium')}
                            disabled={submittingPlan !== null || userPlan === 'premium'}
                            loading={submittingPlan === 'premium'}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 tone_white font-bold space_py_3 radius_xl transition-all shadow-lg shadow-purple-900/30"
                        >
                            {userPlan === 'premium' ? 'Current Plan' : 'Get Premium'}
                        </Button>
                    </div>
                </div>

                {error && (
                    <div className="surface_red_500_10 tone_red_400 text-sm text-center space_px_4 space_py_3">
                        {error}
                    </div>
                )}

                <div className="surface_gray_900_50 space_pa_4 text-center tone_gray_500 text-xs">
                    Secure payment via Cashfree. Cancel anytime.
                </div>
            </div>
        </div>
    );
}
