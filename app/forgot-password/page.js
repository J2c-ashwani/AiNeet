'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';

import { Card, Button, Input, Alert } from '@/components/ui';
import { Form, FormField } from '@/components/forms/Form';

// ── Local Schemas ─────────────────────────────────────────────────────────────
const emailSchema = z.object({
    email: z.string().email('Please enter a valid email address.'),
});

const otpSchema = z.object({
    otp: z.string().min(4, 'Please enter the verification code from your email.').max(8),
});

const passwordSchema = z.object({
    newPassword: z
        .string()
        .min(8, 'Password must be at least 8 characters.')
        .regex(/\d/, 'Password must contain at least one number.')
        .regex(/[a-zA-Z]/, 'Password must contain at least one letter.'),
    confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
});

// ── Step Indicator ────────────────────────────────────────────────────────────
const STEPS = ['email', 'otp', 'password'];

function StepIndicator({ currentStep }) {
    return (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 32 }} aria-label="Password reset progress">
            {STEPS.map((s, i) => (
                <div
                    key={s}
                    style={{
                        width: 40,
                        height: 4,
                        transition: 'all 0.3s',
                        background: STEPS.indexOf(currentStep) >= i
                            ? 'var(--accent-primary)'
                            : 'var(--border)',
                    }}
                />
            ))}
        </div>
    );
}

// ── Email Step ────────────────────────────────────────────────────────────────
function EmailStep({ onSuccess }) {
    const methods = useForm({ resolver: zodResolver(emailSchema) });
    const mutation = useMutation({
        mutationFn: async ({ email }) => {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Request failed.');
            return email;
        },
        onSuccess: (email) => onSuccess(email),
        onError: (err) => methods.setError('root.serverError', { type: 'server', message: err.message }),
    });

    return (
        <>
            {methods.formState.errors.root?.serverError?.message && (
                <Alert type="error">{methods.formState.errors.root.serverError.message}</Alert>
            )}
            <Form methods={methods} onSubmit={(d) => mutation.mutate(d)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <FormField name="email" label="Email Address">
                    <Input
                        {...methods.register('email')}
                        type="email"
                        placeholder="Enter your registered email"
                        disabled={mutation.isPending}
                        autoFocus
                    />
                </FormField>
                <Button type="submit" loading={mutation.isPending} style={{ marginTop: 8, width: '100%' }}>
                    Send Reset Code →
                </Button>
            </Form>
        </>
    );
}

// ── OTP Step ──────────────────────────────────────────────────────────────────
function OtpStep({ email, onSuccess, onBack }) {
    const methods = useForm({ resolver: zodResolver(otpSchema) });
    const mutation = useMutation({
        mutationFn: async ({ otp }) => {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, type: 'recovery' }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Invalid or expired code.');
            return data;
        },
        onSuccess: () => onSuccess(),
        onError: (err) => methods.setError('root.serverError', { type: 'server', message: err.message }),
    });

    return (
        <>
            {methods.formState.errors.root?.serverError?.message && (
                <Alert type="error">{methods.formState.errors.root.serverError.message}</Alert>
            )}
            <Form methods={methods} onSubmit={(d) => mutation.mutate(d)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <FormField name="otp" label="Verification Code" description={`We sent a 6-digit code to ${email}`}>
                    <Input
                        {...methods.register('otp')}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={8}
                        placeholder="Enter code"
                        disabled={mutation.isPending}
                        autoFocus
                        className="text-2xl tracking-[0.5em] text-center font-bold"
                        onChange={(e) => {
                            const cleaned = e.target.value.replace(/\D/g, '').slice(0, 8);
                            methods.setValue('otp', cleaned, { shouldValidate: true });
                        }}
                    />
                </FormField>
                <Button type="submit" loading={mutation.isPending} style={{ marginTop: 8, width: '100%' }}>
                    Verify Code →
                </Button>
            </Form>
            <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Button variant="ghost" size="sm" onClick={onBack}>
                    Didn&apos;t receive it? Send again
                </Button>
            </div>
        </>
    );
}

// ── New Password Step ─────────────────────────────────────────────────────────
function NewPasswordStep({ onSuccess }) {
    const methods = useForm({ resolver: zodResolver(passwordSchema) });
    const mutation = useMutation({
        mutationFn: async ({ newPassword }) => {
            const res = await fetch('/api/auth/update-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: newPassword }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update password.');
            return data;
        },
        onSuccess: () => {
            onSuccess();
            setTimeout(() => { window.location.href = '/'; }, 2000);
        },
        onError: (err) => methods.setError('root.serverError', { type: 'server', message: err.message }),
    });

    return (
        <>
            {methods.formState.errors.root?.serverError?.message && (
                <Alert type="error">{methods.formState.errors.root.serverError.message}</Alert>
            )}
            <Form methods={methods} onSubmit={(d) => mutation.mutate(d)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <FormField name="newPassword" label="New Password" description="8+ characters, letters & numbers">
                    <Input
                        {...methods.register('newPassword')}
                        type="password"
                        placeholder="Create a strong password"
                        disabled={mutation.isPending}
                        autoFocus
                    />
                </FormField>
                <FormField name="confirmPassword" label="Confirm Password">
                    <Input
                        {...methods.register('confirmPassword')}
                        type="password"
                        placeholder="Repeat new password"
                        disabled={mutation.isPending}
                    />
                </FormField>
                <Button type="submit" loading={mutation.isPending} style={{ marginTop: 8, width: '100%' }}>
                    Set New Password →
                </Button>
            </Form>
        </>
    );
}

// ── Root Page ─────────────────────────────────────────────────────────────────
export default function ForgotPasswordPage() {
    const [step, setStep] = useState('email');
    const [email, setEmail] = useState('');

    const stepConfig = {
        email:    { title: 'Reset Password',    sub: 'Enter your account email' },
        otp:      { title: 'Check Your Email',  sub: `We sent a 6-digit code to ${email}` },
        password: { title: 'New Password',      sub: 'Set a secure new password' },
        done:     { title: 'Password Reset!',   sub: 'Redirecting you to the app...' },
    };

    const { title, sub } = stepConfig[step];

    return (
        <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', padding: '32px 16px' }}>
            <Card style={{ maxWidth: 440, width: '100%', padding: 32 }} className="animate-fade-in-up">
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <h1 style={{ fontWeight: 800, marginBottom: 8 }}>{title}</h1>
                    <p >{sub}</p>
                </div>

                {step !== 'done' && <StepIndicator currentStep={step} />}

                {step === 'email' && (
                    <EmailStep onSuccess={(e) => { setEmail(e); setStep('otp'); }} />
                )}
                {step === 'otp' && (
                    <OtpStep
                        email={email}
                        onSuccess={() => setStep('password')}
                        onBack={() => { setStep('email'); }}
                    />
                )}
                {step === 'password' && (
                    <NewPasswordStep onSuccess={() => setStep('done')} />
                )}
                {step === 'done' && (
                    <Alert type="success">Your password has been updated. Redirecting...</Alert>
                )}

                {step !== 'done' && (
                    <p style={{ textAlign: 'center', marginTop: 32, }}>
                        Remember it?{' '}
                        <a href="/login" style={{ fontWeight: 600, textDecoration: 'none' }}>
                            Back to Login
                        </a>
                    </p>
                )}
            </Card>
        </div>
    );
}
