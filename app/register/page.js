'use client';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { createBrowserClient } from '@supabase/ssr';

import { Card, Button, Input, Skeleton, Alert, Select } from '@/components/ui';
import { Form, FormField } from '@/components/forms/Form';
import { registerSchema, otpSchema } from '@/lib/validation/auth';

// ── Step Indicator ────────────────────────────────────────────────────────────
function StepIndicator({ currentStep }) {
    const steps = ['form', 'otp'];
    return (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 32 }} aria-label="Registration progress">
            {steps.map((s, i) => (
                <div
                    key={s}
                    role="progressbar"
                    aria-valuenow={steps.indexOf(currentStep) + 1}
                    aria-valuemin={1}
                    aria-valuemax={steps.length}
                    style={{
                        width: 50,
                        height: 4,
                        transition: 'all 0.3s',
                        background: steps.indexOf(currentStep) >= i
                            ? 'var(--accent-primary)'
                            : 'var(--border)',
                    }}
                />
            ))}
        </div>
    );
}

// ── Registration Form Step ────────────────────────────────────────────────────
function RegistrationFormStep({ refCode, onSuccess }) {
    const methods = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: { name: '', email: '', password: '', targetYear: '2027' },
    });

    const registerMutation = useMutation({
        mutationFn: async (formData) => {
            // Cold-start resilient registration with one automatic retry
            const attemptRegister = async () => {
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...formData, referralCode: refCode || undefined }),
                });
                const text = await res.text();
                let data;
                try { data = JSON.parse(text); }
                catch { throw new Error('Server starting. Please try again in 5 seconds.'); }
                if (!res.ok) throw new Error(data.error || 'Registration failed');
                return data;
            };

            try {
                return await attemptRegister();
            } catch (err) {
                if (err.message?.includes('starting')) throw err;
                // Cold-start retry after 6 seconds
                await new Promise(r => setTimeout(r, 6000));
                return await attemptRegister();
            }
        },
        onSuccess: (_data, formData) => onSuccess(formData),
        onError: (error) => {
            methods.setError('root.serverError', { type: 'server', message: error.message });
        },
    });

    const rootError = methods.formState.errors.root?.serverError?.message;

    return (
        <>
            {refCode && (
                <Alert type="success">
                    You were invited by a friend! Sign up to start practicing.
                </Alert>
            )}
            {rootError && (
                <Alert type="error">{rootError}</Alert>
            )}
            <Form methods={methods} onSubmit={(d) => registerMutation.mutate(d)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <FormField name="name" label="Full Name">
                    <Input
                        {...methods.register('name')}
                        type="text"
                        placeholder="Enter your name"
                        disabled={registerMutation.isPending}
                    />
                </FormField>
                <FormField name="email" label="Email Address">
                    <Input
                        {...methods.register('email')}
                        type="email"
                        placeholder="Enter your email"
                        disabled={registerMutation.isPending}
                    />
                </FormField>
                <FormField name="password" label="Password">
                    <Input
                        {...methods.register('password')}
                        type="password"
                        placeholder="Create a password"
                        disabled={registerMutation.isPending}
                    />
                </FormField>
                <FormField name="targetYear" label="NEET Target Year">
                    <Select
                        {...methods.register('targetYear')}
                        disabled={registerMutation.isPending}
                        aria-label="Select your NEET target year"
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '1px solid var(--border)',
                            outline: 'none'
                        }}
                    >
                        <option value="2027">NEET 2027</option>
                        <option value="2028">NEET 2028</option>
                        <option value="2029">NEET 2029</option>
                    </Select>
                </FormField>
                <Button type="submit" loading={registerMutation.isPending} style={{ marginTop: 8, width: '100%' }}>
                    Create Account →
                </Button>
            </Form>
            <p style={{ textAlign: 'center', marginTop: 32, }}>
                Already have an account?{' '}
                <a href="/login" style={{ fontWeight: 600, textDecoration: 'none' }}>Sign In</a>
            </p>
        </>
    );
}

// ── OTP Verification Step ─────────────────────────────────────────────────────
function OtpVerificationStep({ email, password, challengeId }) {
    const [resendCooldown, setResendCooldown] = useState(0);
    const methods = useForm({
        resolver: zodResolver(otpSchema),
        defaultValues: { otp: '' },
    });

    const verifyMutation = useMutation({
        mutationFn: async ({ otp }) => {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, type: 'signup' }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Invalid or expired code.');

            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            );
            const { error: loginError } = await supabase.auth.signInWithPassword({
                email: email.toLowerCase().trim(),
                password,
            });
            if (loginError) throw new Error('Email verified but login failed. Please sign in manually.');
            return data;
        },
        onSuccess: () => {
            setTimeout(() => {
                window.location.href = challengeId ? `/challenge/${challengeId}` : '/welcome';
            }, 1500);
        },
        onError: (error) => {
            methods.setError('root.serverError', { type: 'server', message: error.message });
        },
    });

    const resendMutation = useMutation({
        mutationFn: async () => {
            await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
        },
        onSuccess: () => {
            methods.setValue('otp', '');
            setResendCooldown(60);
            const timer = setInterval(() => {
                setResendCooldown(prev => {
                    if (prev <= 1) { clearInterval(timer); return 0; }
                    return prev - 1;
                });
            }, 1000);
        },
    });

    const rootError = methods.formState.errors.root?.serverError?.message;
    const isSubmitting = verifyMutation.isPending;
    const isSuccess = verifyMutation.isSuccess;

    if (isSuccess) {
        return (
            <Alert type="success">Account verified! Redirecting...</Alert>
        );
    }

    return (
        <>
            {rootError && (
                <Alert type="error">{rootError}</Alert>
            )}
            <Form methods={methods} onSubmit={(d) => verifyMutation.mutate(d)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <FormField name="otp" label="Verification Code" description={`Enter the code sent to ${email}`}>
                    <Input
                        {...methods.register('otp')}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={8}
                        placeholder="Enter code"
                        disabled={isSubmitting}
                        autoFocus
                        style={{ letterSpacing: '0.5em', textAlign: 'center', fontWeight: 700 }}
                        onChange={(e) => {
                            const cleaned = e.target.value.replace(/\D/g, '').slice(0, 8);
                            methods.setValue('otp', cleaned, { shouldValidate: true });
                        }}
                    />
                </FormField>
                <Button type="submit" loading={isSubmitting} style={{ marginTop: 8, width: '100%' }}>
                    Verify &amp; Continue →
                </Button>
            </Form>
            <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => resendMutation.mutate()}
                    disabled={resendCooldown > 0 || resendMutation.isPending}
                >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Didn't receive it? Resend code"}
                </Button>
            </div>
        </>
    );
}

// ── Main Register Page ────────────────────────────────────────────────────────
function RegisterContent() {
    const searchParams = useSearchParams();
    const refCode = searchParams.get('ref') || '';
    const challengeId = searchParams.get('challenge') || '';

    const [step, setStep] = useState('form');
    // Store submitted form data to pass email/password to OTP step for auto-login
    const [submittedData, setSubmittedData] = useState(null);

    const stepTitles = {
        form: { heading: 'Create Account', sub: 'Start your NEET preparation journey' },
        otp:  { heading: 'Verify Email',   sub: submittedData ? `Enter the code sent to ${submittedData.email}` : '' },
    };

    const { heading, sub } = stepTitles[step] || {};

    return (
        <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', padding: '32px 16px' }}>
            <Card style={{ maxWidth: 440, width: '100%', padding: 32 }} className="animate-fade-in-up">
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <h1 style={{ fontWeight: 800, marginBottom: 8 }}>{heading}</h1>
                    <p >{sub}</p>
                </div>

                {/* Step Indicator */}
                <StepIndicator currentStep={step} />

                {/* Step Renderer */}
                {step === 'form' && (
                    <RegistrationFormStep
                        refCode={refCode}
                        onSuccess={(data) => {
                            setSubmittedData(data);
                            setStep('otp');
                        }}
                    />
                )}
                {step === 'otp' && submittedData && (
                    <OtpVerificationStep
                        email={submittedData.email}
                        password={submittedData.password}
                        challengeId={challengeId}
                    />
                )}
            </Card>
        </div>
    );
}

export const dynamic = 'force-dynamic';

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)' }}>
                <Skeleton style={{ maxWidth: 440, width: '100%', height: 500 }} />
            </div>
        }>
            <RegisterContent />
        </Suspense>
    );
}
