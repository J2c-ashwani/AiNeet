'use client';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { createBrowserClient } from '@supabase/ssr';

import { Card, Button, Input, Skeleton } from '@/components/ui';
import { Form, FormField } from '@/components/forms/Form';
import { registerSchema, otpSchema } from '@/lib/validation/auth';

// ── Step Indicator ────────────────────────────────────────────────────────────
function StepIndicator({ currentStep }) {
    const steps = ['form', 'otp'];
    return (
        <div className="flex gap-2 justify-center mb-8" aria-label="Registration progress">
            {steps.map((s, i) => (
                <div
                    key={s}
                    role="progressbar"
                    aria-valuenow={steps.indexOf(currentStep) + 1}
                    aria-valuemin={1}
                    aria-valuemax={steps.length}
                    className="w-[50px] h-1 rounded-sm transition-all duration-300"
                    style={{
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
                <div
                    role="status"
                    className="p-4 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-700 text-sm mb-6 text-center font-medium"
                >
                    You were invited by a friend! Sign up to start practicing.
                </div>
            )}
            {rootError && (
                <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm mb-6 font-medium">
                    {rootError}
                </div>
            )}
            <Form methods={methods} onSubmit={(d) => registerMutation.mutate(d)} className="flex flex-col gap-5">
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
                    {/* Using native select temporarily — Select primitive to be created in Phase 2 */}
                    <select
                        {...methods.register('targetYear')}
                        disabled={registerMutation.isPending}
                        aria-label="Select your NEET target year"
                        className="w-full px-4 py-3 rounded-md border border-[var(--border)] bg-[var(--bg-glass)] text-[var(--text-primary)] text-base outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                    >
                        <option value="2027">NEET 2027</option>
                        <option value="2028">NEET 2028</option>
                        <option value="2029">NEET 2029</option>
                    </select>
                </FormField>
                <Button type="submit" loading={registerMutation.isPending} className="mt-2 w-full">
                    Create Account →
                </Button>
            </Form>
            <p className="text-center mt-8 text-sm text-[var(--text-muted)]">
                Already have an account?{' '}
                <a href="/login" className="text-[var(--text-primary)] font-semibold hover:underline">Sign In</a>
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
            <div
                role="status"
                className="text-center p-5 bg-emerald-50 border border-emerald-200 rounded-lg"
            >
                <p className="text-emerald-700 text-sm font-medium">Account verified! Redirecting...</p>
            </div>
        );
    }

    return (
        <>
            {rootError && (
                <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm mb-6 font-medium">
                    {rootError}
                </div>
            )}
            <Form methods={methods} onSubmit={(d) => verifyMutation.mutate(d)} className="flex flex-col gap-5">
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
                        className="text-2xl tracking-[0.5em] text-center font-bold"
                        onChange={(e) => {
                            const cleaned = e.target.value.replace(/\D/g, '').slice(0, 8);
                            methods.setValue('otp', cleaned, { shouldValidate: true });
                        }}
                    />
                </FormField>
                <Button type="submit" loading={isSubmitting} className="mt-2 w-full">
                    Verify &amp; Continue →
                </Button>
            </Form>
            <div className="text-center mt-4">
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
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-8">
            <Card className="w-full max-w-[440px] p-8 animate-fade-in-up">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-extrabold text-[var(--text-primary)] mb-2">{heading}</h1>
                    <p className="text-[var(--text-secondary)] text-sm">{sub}</p>
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
            <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
                <Skeleton className="w-full max-w-[440px] h-[500px]" />
            </div>
        }>
            <RegisterContent />
        </Suspense>
    );
}
