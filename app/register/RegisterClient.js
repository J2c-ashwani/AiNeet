'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';

import { Card, Button, Input, Alert, Select } from '@/components/ui';
import { Form, FormField } from '@/components/forms/Form';
import { registerSchema } from '@/lib/validation/auth';

// ── Registration Form Step ────────────────────────────────────────────────────
function RegistrationFormStep({ refCode, challengeId }) {
    const router = useRouter();
    const methods = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: { name: '', email: '', password: '', targetYear: '2027' },
    });

    const registerMutation = useMutation({
        mutationFn: async (formData) => {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, referralCode: refCode || undefined }),
            });
            const text = await res.text();
            let data;
            try { data = JSON.parse(text); }
            catch { throw new Error('Registration failed. Please try again.'); }
            if (!res.ok) throw new Error(data.error || 'Registration failed');
            return data;
        },
        onSuccess: () => {
            router.push(challengeId ? `/challenge/${challengeId}` : '/welcome');
        },
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

// ── Main Register Page ────────────────────────────────────────────────────────
export default function RegisterClient() {
    const searchParams = useSearchParams();
    const refCode = searchParams.get('ref') || '';
    const challengeId = searchParams.get('challenge') || '';

    return (
        <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 280px)', padding: '16px 16px' }}>
            <Card style={{ maxWidth: 440, width: '100%', padding: 32 }} className="animate-fade-in-up">
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <h1 style={{ fontWeight: 800, marginBottom: 8 }}>Create Account</h1>
                    <p>Start your NEET preparation journey</p>
                </div>

                <RegistrationFormStep
                    refCode={refCode}
                    challengeId={challengeId}
                />
            </Card>
        </div>
    );
}
