'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const PLANS = [
    {
        id: 'free',
        name: 'Free',
        tagline: 'Get started with AI-powered NEET prep',
        price: '₹0',
        period: 'forever',
        gradient: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderColor: 'rgba(148, 163, 184, 0.2)',
        accentColor: '#94a3b8',
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
        gradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
        borderColor: 'rgba(99, 102, 241, 0.4)',
        accentColor: '#818cf8',
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
            { text: 'Parent Weekly Reports', included: false },
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
        gradient: 'linear-gradient(135deg, #2d1b69 0%, #4c1d95 30%, #7c3aed 60%, #4c1d95 100%)',
        borderColor: 'rgba(167, 139, 250, 0.5)',
        accentColor: '#a78bfa',
        badge: '⭐ MOST POPULAR',
        features: [
            { text: '100 Custom AI Tests / month', included: true },
            { text: 'Unlimited AI Doubts', included: true },
            { text: 'Unlimited NCERT Explanations', included: true },
            { text: 'Snap & Solve (AI Camera)', included: true },
            { text: 'Advanced Analytics & Insights', included: true },
            { text: 'Parent Connect (Weekly Reports)', included: true },
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
            if (!res.ok) throw new Error(data.error || 'Failed to create order');

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
        <div>
            <div style={{ minHeight: '100vh', padding: '40px 16px 80px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                    {/* Hero Header */}
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <div style={{
                            display: 'inline-block', padding: '8px 20px', borderRadius: '100px',
                            background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(167,139,250,0.15))',
                            border: '1px solid rgba(167,139,250,0.3)', marginBottom: '20px',
                            fontSize: '0.85rem', color: '#a78bfa', fontWeight: 600, letterSpacing: '0.5px'
                        }}>
                            🚀 Join 50,000+ NEET aspirants already using AI Coach
                        </div>
                        <h1 style={{
                            fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 900, lineHeight: 1.1,
                            background: 'linear-gradient(135deg, #e2e8f0, #f8fafc, #c7d2fe, #a78bfa)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            marginBottom: '16px'
                        }}>
                            Invest in Your NEET Score,<br />Not Just Coaching Fees
                        </h1>
                        <p style={{ fontSize: '1.15rem', color: '#94a3b8', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
                            Traditional coaching costs ₹2-4 Lakhs/year. Get AI-powered personalized preparation for less than ₹13/day.
                        </p>
                    </div>

                    {error && (
                        <div style={{
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                            color: '#fca5a5', padding: '14px 20px', borderRadius: '12px',
                            marginBottom: '32px', textAlign: 'center', fontSize: '0.9rem'
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Pricing Cards */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '24px',
                        marginBottom: '80px',
                        alignItems: 'stretch'
                    }}>
                        {PLANS.map((plan) => {
                            const isCurrentPlan = user?.subscription_tier === plan.id;
                            const isFree = plan.id === 'free';
                            const isPremium = plan.id === 'premium';
                            return (
                                <div key={plan.id} style={{
                                    background: plan.gradient,
                                    border: `1.5px solid ${plan.borderColor}`,
                                    borderRadius: '20px',
                                    padding: '32px 28px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    position: 'relative',
                                    transition: 'all 0.3s ease',
                                    transform: isPremium ? 'scale(1.03)' : 'none',
                                    boxShadow: isPremium
                                        ? '0 0 60px rgba(124, 58, 237, 0.2), 0 20px 60px rgba(0,0,0,0.4)'
                                        : '0 4px 20px rgba(0,0,0,0.2)',
                                }}>
                                    {plan.badge && (
                                        <div style={{
                                            position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)',
                                            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                                            color: 'white', padding: '6px 18px', borderRadius: '100px',
                                            fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1px',
                                            boxShadow: '0 4px 15px rgba(124,58,237,0.4)', whiteSpace: 'nowrap'
                                        }}>
                                            {plan.badge}
                                        </div>
                                    )}

                                    {/* Plan Name */}
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>
                                        {plan.name}
                                    </h2>
                                    <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '20px', lineHeight: 1.4 }}>
                                        {plan.tagline}
                                    </p>

                                    {/* Price */}
                                    <div style={{ marginBottom: '24px' }}>
                                        <span style={{ fontSize: '2.8rem', fontWeight: 900, color: '#f8fafc' }}>
                                            {plan.price}
                                        </span>
                                        <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 500 }}>
                                            {plan.period}
                                        </span>
                                        {!isFree && (
                                            <div style={{ fontSize: '0.8rem', color: plan.accentColor, marginTop: '4px', fontWeight: 600 }}>
                                                {plan.id === 'pro' ? '= ₹6.6/day' : '= ₹13/day'}
                                            </div>
                                        )}
                                    </div>

                                    {/* Divider */}
                                    <div style={{ height: '1px', background: `${plan.accentColor}33`, marginBottom: '20px' }} />

                                    {/* Features */}
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {plan.features.map((f, i) => (
                                            <li key={i} style={{
                                                display: 'flex', alignItems: 'center', gap: '10px',
                                                fontSize: '0.9rem', color: f.included ? '#e2e8f0' : '#475569',
                                                opacity: f.included ? 1 : 0.5
                                            }}>
                                                <span style={{
                                                    width: '20px', height: '20px', borderRadius: '50%', display: 'flex',
                                                    alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', flexShrink: 0,
                                                    background: f.included ? `${plan.accentColor}22` : 'rgba(71,85,105,0.2)',
                                                    color: f.included ? plan.accentColor : '#475569',
                                                    border: `1px solid ${f.included ? `${plan.accentColor}44` : 'rgba(71,85,105,0.3)'}`
                                                }}>
                                                    {f.included ? '✓' : '✗'}
                                                </span>
                                                {f.text}
                                            </li>
                                        ))}
                                    </ul>

                                    {/* CTA Button */}
                                    <button
                                        onClick={() => !isFree && handleSubscribe(plan.id)}
                                        disabled={loading || isFree || isCurrentPlan}
                                        style={{
                                            marginTop: '28px', width: '100%', padding: '16px',
                                            borderRadius: '14px', border: 'none', fontSize: '1rem',
                                            fontWeight: 700, cursor: (isFree || isCurrentPlan) ? 'default' : 'pointer',
                                            transition: 'all 0.3s ease',
                                            background: isFree
                                                ? 'rgba(148,163,184,0.1)'
                                                : isCurrentPlan
                                                    ? 'rgba(148,163,184,0.1)'
                                                    : isPremium
                                                        ? 'linear-gradient(135deg, #7c3aed, #a855f7, #7c3aed)'
                                                        : 'linear-gradient(135deg, #4f46e5, #6366f1)',
                                            color: (isFree || isCurrentPlan) ? '#64748b' : '#ffffff',
                                            boxShadow: (isFree || isCurrentPlan) ? 'none'
                                                : isPremium
                                                    ? '0 8px 30px rgba(124,58,237,0.4)'
                                                    : '0 4px 15px rgba(79,70,229,0.3)'
                                        }}
                                    >
                                        {loading === plan.id ? '⏳ Processing...' : isCurrentPlan ? '✓ Current Plan' : isFree ? 'Your Free Plan' : plan.cta}
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Social Proof */}
                    <div style={{ marginBottom: '80px' }}>
                        <h2 style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', marginBottom: '12px' }}>
                            Trusted by NEET Toppers
                        </h2>
                        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '40px', fontSize: '1rem' }}>
                            Real results from real students
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                            {TESTIMONIALS.map((t, i) => (
                                <div key={i} style={{
                                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                                    borderRadius: '16px', padding: '24px', position: 'relative'
                                }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '12px', opacity: 0.3 }}>"</div>
                                    <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '16px', fontStyle: 'italic' }}>
                                        {t.text}
                                    </p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.9rem' }}>{t.name}</span>
                                        <span style={{
                                            background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))',
                                            color: '#4ade80', padding: '4px 12px', borderRadius: '8px',
                                            fontSize: '0.8rem', fontWeight: 700, border: '1px solid rgba(34,197,94,0.2)'
                                        }}>
                                            {t.score}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Comparison Table */}
                    <div style={{ marginBottom: '80px' }}>
                        <h2 style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', marginBottom: '40px' }}>
                            Why AI NEET Coach vs Traditional Coaching?
                        </h2>
                        <div style={{
                            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '16px', overflow: 'hidden'
                        }}>
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
                                    borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                                    padding: '16px 20px', alignItems: 'center',
                                    background: i === 0 ? 'rgba(255,255,255,0.03)' : 'transparent'
                                }}>
                                    <span style={{ color: '#e2e8f0', fontWeight: i === 0 ? 700 : 500, fontSize: '0.9rem' }}>{row.feature}</span>
                                    <span style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'center', opacity: 0.8 }}>{row.traditional}</span>
                                    <span style={{ color: '#4ade80', fontSize: '0.85rem', textAlign: 'center', fontWeight: 600 }}>{row.ai}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* FAQ */}
                    <div style={{ maxWidth: '700px', margin: '0 auto', marginBottom: '60px' }}>
                        <h2 style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', marginBottom: '32px' }}>
                            Frequently Asked Questions
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {FAQ.map((item, i) => (
                                <div key={i} style={{
                                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                                    borderRadius: '12px', overflow: 'hidden', transition: 'all 0.3s'
                                }}>
                                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{
                                        width: '100%', padding: '16px 20px', display: 'flex', justifyContent: 'space-between',
                                        alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer',
                                        color: '#e2e8f0', fontSize: '0.95rem', fontWeight: 600, textAlign: 'left'
                                    }}>
                                        {item.q}
                                        <span style={{
                                            transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.3s', fontSize: '1.2rem', color: '#64748b'
                                        }}>▾</span>
                                    </button>
                                    {openFaq === i && (
                                        <div style={{ padding: '0 20px 16px', color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                            {item.a}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Final CTA */}
                    <div style={{
                        textAlign: 'center', padding: '48px 24px', borderRadius: '24px',
                        background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(99,102,241,0.1), rgba(124,58,237,0.15))',
                        border: '1px solid rgba(167,139,250,0.2)',
                    }}>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', marginBottom: '12px' }}>
                            Still thinking? Start with Free.
                        </h2>
                        <p style={{ color: '#94a3b8', marginBottom: '24px', fontSize: '1rem' }}>
                            No credit card required. Upgrade only when you see results.
                        </p>
                        <a href="/register" style={{
                            display: 'inline-block', padding: '16px 40px', borderRadius: '14px',
                            background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: 'white',
                            fontWeight: 700, fontSize: '1.05rem', textDecoration: 'none',
                            boxShadow: '0 8px 30px rgba(124,58,237,0.4)', transition: 'all 0.3s'
                        }}>
                            Start Free — No Card Needed →
                        </a>
                    </div>

                </div>
            </div>
        </div>
    );
}
