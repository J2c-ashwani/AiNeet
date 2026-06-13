'use client';
import { Icon } from '@/components/ui/Icon';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Card, Button, Badge } from '@/components/ui';
import { startSubscriptionCheckout } from '@/lib/client/subscription-checkout';

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
        badge: { icon: 'Star', text: 'MOST POPULAR' },
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
    { q: 'Can I cancel anytime?', a: 'Yes. Cancel renewal anytime from your Profile page. Your paid access remains active until the end of the current billing period, and there will be no charge from the next cycle.' },
    { q: 'Do I get a refund?', a: 'Subscriptions are non-refundable once a billing period has started. Exceptional duplicate-charge, fraud, or chargeback cases are reviewed by billing support.' },
    { q: 'Is payment secure?', a: 'Yes. Payments are processed through the secure billing provider shown at checkout.' },
    { q: 'Can I switch plans?', a: 'You can upgrade from the pricing page. Downgrade and plan-change requests are handled by billing support so your access and billing period stay consistent.' },
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
            const result = await startSubscriptionCheckout(planId);
            if (result.provider === 'google_play') {
                window.location.href = '/profile';
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page" style={{ paddingBottom: 80 }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>

                {/* Hero Header */}
                <div style={{ textAlign: 'center', marginBottom: 60 }}>
                    <Badge variant="primary" style={{ marginBottom: 24, padding: '8px 16px', }}>
                        <Icon name="Zap" /> Join 50,000+ NEET aspirants already using AI Coach
                    </Badge>
                    <h1 style={{ fontWeight: 900, lineHeight: 1.2, marginBottom: 16 }}>
                        Invest in Your NEET Score,<br />Not Just Coaching Fees
                    </h1>
                    <p style={{ maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
                        Traditional coaching costs ₹2-4 Lakhs/year. Get AI-powered personalized preparation for less than ₹13/day.
                    </p>
                </div>

                {error && (
                    <div style={{ padding: 16, border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: 32, textAlign: 'center', fontWeight: 500 }}>
                        {error}
                    </div>
                )}

                {/* Pricing Cards */}
                <div className="grid grid-3" style={{ marginBottom: 80, alignItems: 'stretch' }}>
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
                                
                            }}>
                                {plan.badge && (
                                    <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)' }}>
                                        <Badge variant="accent" style={{ padding: '6px 16px', fontWeight: 800, letterSpacing: 1, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                            {plan.badge.icon && <Icon name={plan.badge.icon} size={16} />}
                                            <span>{plan.badge.text}</span>
                                        </Badge>
                                    </div>
                                )}

                                <h2 style={{ fontWeight: 800, marginBottom: 8 }}>
                                    {plan.name}
                                </h2>
                                <p style={{ marginBottom: 24, lineHeight: 1.4 }}>
                                    {plan.tagline}
                                </p>

                                <div style={{ marginBottom: 32 }}>
                                    <span style={{ fontWeight: 900, }}>
                                        {plan.price}
                                    </span>
                                    <span style={{ fontWeight: 500 }}>
                                        {plan.period}
                                    </span>
                                    {!isFree && (
                                        <div style={{ color: plan.accentColor, marginTop: 4, fontWeight: 700 }}>
                                            {plan.id === 'pro' ? '= ₹6.6/day' : '= ₹13/day'}
                                        </div>
                                    )}
                                </div>

                                <div style={{ height: 1, marginBottom: 24 }} />

                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    {plan.features.map((f, i) => (
                                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, color: f.included ? 'var(--text-primary)' : 'var(--text-muted)', opacity: f.included ? 1 : 0.6 }}>
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
                                    style={{ marginTop: 32, width: '100%' }}
                                >
                                    {isCurrentPlan ? '✓ Current Plan' : isFree ? 'Your Free Plan' : plan.cta}
                                </Button>
                            </Card>
                        );
                    })}
                </div>

                {/* Social Proof */}
                <div style={{ marginBottom: 80 }}>
                    <h2 style={{ textAlign: 'center', fontWeight: 800, marginBottom: 16 }}>
                        Trusted by NEET Toppers
                    </h2>
                    <p style={{ textAlign: 'center', marginBottom: 48, }}>
                        Real results from real students
                    </p>
                    <div className="grid grid-3">
                        {TESTIMONIALS.map((t, i) => (
                            <Card key={i} style={{ padding: 32 }}>
                                <div style={{ marginBottom: 16, opacity: 0.5, }}>"</div>
                                <p style={{ lineHeight: 1.6, marginBottom: 24, fontStyle: 'italic' }}>
                                    {t.text}
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 700, }}>{t.name}</span>
                                    <Badge variant="success" style={{ fontWeight: 800 }}>
                                        {t.score}
                                    </Badge>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Comparison Table */}
                <div style={{ marginBottom: 80 }}>
                    <h2 style={{ textAlign: 'center', fontWeight: 800, marginBottom: 40 }}>
                        Why AI NEET Coach vs Traditional Coaching?
                    </h2>
                    <Card style={{ padding: '0', overflow: 'hidden' }}>
                        {[
                            { feature: 'Monthly Cost', traditional: '₹15,000 - ₹30,000', ai: '₹199 - ₹399' },
                            { feature: 'Available 24/7', traditional: <><Icon name="XCircle" size={16} /> Fixed hours</>, ai: <><Icon name="CheckCircle" size={16} /> Anytime</> },
                            { feature: 'Personalized Tests', traditional: <><Icon name="XCircle" size={16} /> Same for all</>, ai: <><Icon name="CheckCircle" size={16} /> AI adapts to you</> },
                            { feature: 'Instant Doubt Solving', traditional: <><Icon name="XCircle" size={16} /> Wait for class</>, ai: <><Icon name="CheckCircle" size={16} /> &lt; 10 seconds</> },
                            { feature: 'Performance Tracking', traditional: <><Icon name="XCircle" size={16} /> Manual</>, ai: <><Icon name="CheckCircle" size={16} /> Real-time AI analytics</> },
                            { feature: 'Revision Alerts', traditional: <><Icon name="XCircle" size={16} /> None</>, ai: <><Icon name="CheckCircle" size={16} /> Spaced repetition</> },
                        ].map((row, i) => (
                            <div key={i} style={{
                                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                                borderBottom: i < 5 ? '1px solid var(--border)' : 'none',
                                padding: '20px 24px', alignItems: 'center',
                                background: i === 0 ? 'var(--bg-glass)' : 'transparent'
                            }}>
                                <span style={{ fontWeight: i === 0 ? 800 : 600, }}>{row.feature}</span>
                                <span style={{ textAlign: 'center', fontWeight: 500 }}>{row.traditional}</span>
                                <span style={{ textAlign: 'center', fontWeight: 700 }}>{row.ai}</span>
                            </div>
                        ))}
                    </Card>
                </div>

                {/* FAQ */}
                <div style={{ maxWidth: 700, margin: '0 auto', marginBottom: 80 }}>
                    <h2 style={{ textAlign: 'center', fontWeight: 800, marginBottom: 40 }}>
                        Frequently Asked Questions
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {FAQ.map((item, i) => (
                            <Card key={i} style={{ padding: '0' }} interactive>
                                <div role="button" onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{
                                    width: '100%', padding: 24, display: 'flex', justifyContent: 'space-between',
                                    alignItems: 'center', border: 'none', cursor: 'pointer',
                                    fontWeight: 700, textAlign: 'left'
                                }}>
                                    {item.q}
                                    <span style={{ transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s', }}>▾</span>
                                </div>
                                {openFaq === i && (
                                    <div style={{ padding: '0 24px 24px', lineHeight: 1.6 }}>
                                        {item.a}
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Final CTA */}
                <Card style={{ textAlign: 'center', padding: '60px 24px', border: '1px solid var(--primary-dark)' }}>
                    <h2 style={{ fontWeight: 800, marginBottom: 16 }}>
                        Still thinking? Start with Free.
                    </h2>
                    <p style={{ marginBottom: 32, }}>
                        Start free. Upgrade only when you see results.
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
