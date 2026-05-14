'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Card, Button, Badge } from '@/components/ui';

const PLANS = [
    {
        id: 'free',
        name: 'Free',
        tagline: 'Get started with AI-powered NEET prep',
        price: '₹0',
        period: 'forever',
        gradient: 'var(--bg-card)',
        borderColor: 'var(--border)',
        accentColor: 'var(--text-muted)',
        badge: null,
        features: [
            { text: '3 AI Tests / day', included: true },
            { text: '5 AI Doubts / day', included: true },
            { text: 'NCERT Chapter Reading', included: true },
            { text: 'Basic Performance Stats', included: true },
            { text: 'Daily Challenges', included: true },
            { text: 'Snap & Solve (AI Camera)', included: false },
            { text: 'Advanced Analytics', included: false },
            { text: 'Priority AI Responses', included: false },
            { text: 'Ad-Free Experience', included: false },
        ],
        cta: 'Current Plan',
        ctaDisabled: true,
    },
    {
        id: 'pro',
        name: 'NEET Pro',
        tagline: 'For serious aspirants who want an edge',
        price: '₹199',
        period: '/month',
        gradient: 'var(--bg-glass)',
        borderColor: 'var(--primary-dark)',
        accentColor: 'var(--primary)',
        badge: null,
        features: [
            { text: '20 Custom AI Tests / month', included: true },
            { text: '50 AI Doubts / day', included: true },
            { text: '30 NCERT AI Explanations', included: true },
            { text: 'Snap & Solve (AI Camera)', included: true },
            { text: 'Multiplayer Battleground', included: true },
            { text: 'Ad-Free Experience', included: true },
            { text: 'PDF Export for Tests', included: true },
            { text: 'Advanced Analytics', included: false },
            { text: 'Parent Connect (Early Access Beta)', included: false },
        ],
        cta: 'Upgrade to Pro',
        ctaDisabled: false,
    },
    {
        id: 'premium',
        name: 'NEET Premium',
        tagline: 'The ultimate arsenal to maximize your score',
        price: '₹399',
        period: '/month',
        gradient: 'var(--bg-glass-hover)',
        borderColor: 'var(--accent-primary)',
        accentColor: 'var(--accent-primary)',
        badge: '⭐ MOST POPULAR',
        features: [
            { text: '100 Custom AI Tests / month', included: true },
            { text: 'Unlimited AI Doubts', included: true },
            { text: 'Unlimited NCERT Explanations', included: true },
            { text: 'Snap & Solve (AI Camera)', included: true },
            { text: 'Advanced Analytics & Insights', included: true },
            { text: 'Parent Connect (Early Access Beta)', included: true },
            { text: 'Priority AI Responses', included: true },
            { text: 'Priority Email Support', included: true },
            { text: 'Everything in Pro Plan', included: true },
        ],
        cta: 'Upgrade to Premium',
        ctaDisabled: false,
    },
];

const TESTIMONIALS = [
    { name: 'Priya S.', score: '645/720', text: 'The AI doubt solver saved me hours. It explains like a personal tutor.' },
    { name: 'Rahul K.', score: '598/720', text: 'Snap & Solve is insane. I just photo my doubt and get the answer in seconds.' },
    { name: 'Ananya M.', score: '612/720', text: 'Premium analytics showed me exactly which topics I was weak in. Game changer.' },
];

const FAQ = [
    { q: 'Can I cancel anytime?', a: 'Yes. Cancel anytime from your Profile page. No questions asked.' },
    { q: 'Do I get a refund?', a: 'We offer a 7-day money-back guarantee if you\'re not satisfied.' },
    { q: 'Is payment secure?', a: 'Yes. All payments are processed through Cashfree, India\'s trusted payment gateway.' },
    { q: 'Can I switch plans?', a: 'Absolutely. Upgrade or downgrade anytime. We\'ll prorate the difference.' },
];

export default function PricingPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [openFaq, setOpenFaq] = useState(null);

    const handleSubscribe = async (planId) => {
        if (!user) {
            window.location.href = '/login?next=/pricing';
            return;
        }
        setLoading(planId);
        setError('');
        try {
            const res = await fetch('/api/subscription/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId })
            });
            const data = await res.json();
            if (!res.ok) {
                const errorMsg = data.devError ? `${data.error} (Dev: ${data.devError})` : (data.error || 'Failed to initiate payment.');
                throw new Error(errorMsg);
            } 
            if (data.isMock) {
                const verifyRes = await fetch('/api/subscription/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderId: data.orderId, planId: data.planId })
                });
                const verifyData = await verifyRes.json();
                if (verifyRes.ok) {
                    alert(`✅ Upgraded to ${planId.toUpperCase()} successfully!`);
                    window.location.href = '/profile';
                } else {
                    throw new Error(verifyData.error || 'Verification Failed');
                }
            } else {
                alert('Redirecting to Cashfree payment gateway...');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page" style={{ paddingBottom: '80px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                {/* Hero Header */}
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <Badge variant="primary" style={{ marginBottom: '24px', padding: '8px 16px', fontSize: '0.9rem' }}>
                        🚀 Join 50,000+ NEET aspirants already using AI Coach
                    </Badge>
                    <h1 style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1.2, color: 'var(--text-primary)', marginBottom: '16px' }}>
                        Invest in Your NEET Score,<br />Not Just Coaching Fees
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
                        Traditional coaching costs ₹2-4 Lakhs/year. Get AI-powered personalized preparation for less than ₹13/day.
                    </p>
                </div>

                {error && (
                    <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontSize: '0.95rem', marginBottom: '32px', textAlign: 'center', fontWeight: 500 }}>
                        {error}
                    </div>
                )}

                {/* Pricing Cards */}
                <div className="grid grid-3" style={{ marginBottom: '80px', alignItems: 'stretch' }}>
                    {PLANS.map((plan) => {
                        const isCurrentPlan = user?.subscription_tier === plan.id;
                        const isFree = plan.id === 'free';
                        const isPremium = plan.id === 'premium';
                        return (
                            <Card key={plan.id} style={{
                                background: plan.gradient,
                                border: `1.5px solid ${plan.borderColor}`,
                                padding: '40px 32px',
                                display: 'flex',
                                flexDirection: 'column',
                                position: 'relative',
                                transform: isPremium ? 'scale(1.05)' : 'none',
                                zIndex: isPremium ? 10 : 1,
                            }}>
                                {plan.badge && (
                                    <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)' }}>
                                        <Badge variant="accent" style={{ padding: '6px 16px', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1px' }}>
                                            {plan.badge}
                                        </Badge>
                                    </div>
                                )}

                                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                                    {plan.name}
                                </h2>
                                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.4 }}>
                                    {plan.tagline}
                                </p>

                                <div style={{ marginBottom: '32px' }}>
                                    <span style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                                        {plan.price}
                                    </span>
                                    <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                                        {plan.period}
                                    </span>
                                    {!isFree && (
                                        <div style={{ fontSize: '0.85rem', color: plan.accentColor, marginTop: '4px', fontWeight: 700 }}>
                                            {plan.id === 'pro' ? '= ₹6.6/day' : '= ₹13/day'}
                                        </div>
                                    )}
                                </div>

                                <div style={{ height: '1px', background: 'var(--border)', marginBottom: '24px' }} />

                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {plan.features.map((f, i) => (
                                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem', color: f.included ? 'var(--text-primary)' : 'var(--text-muted)', opacity: f.included ? 1 : 0.6 }}>
                                            <span style={{ flexShrink: 0, color: f.included ? plan.accentColor : 'var(--text-muted)', fontWeight: 800 }}>
                                                {f.included ? '✓' : '✗'}
                                            </span>
                                            {f.text}
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    variant={isPremium ? 'accent' : isFree ? 'secondary' : 'primary'}
                                    size="lg"
                                    onClick={() => !isFree && handleSubscribe(plan.id)}
                                    disabled={loading || isFree || isCurrentPlan}
                                    loading={loading === plan.id}
                                    className="critical-flow"
                                    style={{ marginTop: '32px', width: '100%' }}
                                >
                                    {isCurrentPlan ? '✓ Current Plan' : isFree ? 'Your Free Plan' : plan.cta}
                                </Button>
                            </Card>
                        );
                    })}
                </div>

                {/* Social Proof */}
                <div style={{ marginBottom: '80px' }}>
                    <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
                        Trusted by NEET Toppers
                    </h2>
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '48px', fontSize: '1.1rem' }}>
                        Real results from real students
                    </p>
                    <div className="grid grid-3">
                        {TESTIMONIALS.map((t, i) => (
                            <Card key={i} style={{ padding: '32px' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '16px', opacity: 0.5, color: 'var(--primary)' }}>"</div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '24px', fontStyle: 'italic' }}>
                                    {t.text}
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem' }}>{t.name}</span>
                                    <Badge variant="success" style={{ fontWeight: 800 }}>
                                        {t.score}
                                    </Badge>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Comparison Table */}
                <div style={{ marginBottom: '80px' }}>
                    <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '40px' }}>
                        Why AI NEET Coach vs Traditional Coaching?
                    </h2>
                    <Card style={{ padding: '0', overflow: 'hidden' }}>
                        {[
                            { feature: 'Monthly Cost', traditional: '₹15,000 - ₹30,000', ai: '₹199 - ₹399' },
                            { feature: 'Available 24/7', traditional: '❌ Fixed hours', ai: '✅ Anytime' },
                            { feature: 'Personalized Tests', traditional: '❌ Same for all', ai: '✅ AI adapts to you' },
                            { feature: 'Instant Doubt Solving', traditional: '❌ Wait for class', ai: '✅ < 10 seconds' },
                            { feature: 'Performance Tracking', traditional: '❌ Manual', ai: '✅ Real-time AI analytics' },
                            { feature: 'Revision Alerts', traditional: '❌ None', ai: '✅ Spaced repetition' },
                        ].map((row, i) => (
                            <div key={i} style={{
                                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                                borderBottom: i < 5 ? '1px solid var(--border)' : 'none',
                                padding: '20px 24px', alignItems: 'center',
                                background: i === 0 ? 'var(--bg-glass)' : 'transparent'
                            }}>
                                <span style={{ color: 'var(--text-primary)', fontWeight: i === 0 ? 800 : 600, fontSize: '0.95rem' }}>{row.feature}</span>
                                <span style={{ color: 'var(--danger)', fontSize: '0.9rem', textAlign: 'center', fontWeight: 500 }}>{row.traditional}</span>
                                <span style={{ color: 'var(--success)', fontSize: '0.9rem', textAlign: 'center', fontWeight: 700 }}>{row.ai}</span>
                            </div>
                        ))}
                    </Card>
                </div>

                {/* FAQ */}
                <div style={{ maxWidth: '700px', margin: '0 auto', marginBottom: '80px' }}>
                    <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '40px' }}>
                        Frequently Asked Questions
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {FAQ.map((item, i) => (
                            <Card key={i} style={{ padding: '0' }} interactive>
                                <div role="button" onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{
                                    width: '100%', padding: '24px', display: 'flex', justifyContent: 'space-between',
                                    alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer',
                                    color: 'var(--text-primary)', fontSize: '1.05rem', fontWeight: 700, textAlign: 'left'
                                }}>
                                    {item.q}
                                    <span style={{ transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s', color: 'var(--text-muted)' }}>▾</span>
                                </div>
                                {openFaq === i && (
                                    <div style={{ padding: '0 24px 24px', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                                        {item.a}
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Final CTA */}
                <Card style={{ textAlign: 'center', padding: '60px 24px', background: 'var(--bg-glass)', border: '1px solid var(--primary-dark)' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
                        Still thinking? Start with Free.
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '1.1rem' }}>
                        No credit card required. Upgrade only when you see results.
                    </p>
                    <Link href="/register">
                        <Button variant="accent" size="lg">
                            Start Free — No Card Needed →
                        </Button>
                    </Link>
                </Card>

            </div>
        </div>
    );
}
