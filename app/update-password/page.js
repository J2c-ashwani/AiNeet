'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';

import { Card, Button, Input, Alert } from '@/components/ui';
import { Form, FormField } from '@/components/forms/Form';

// ── Schema ────────────────────────────────────────────────────────────────────
const updatePasswordSchema = z.object({
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters.')
        .regex(/\d/, 'Password must contain at least one number.')
        .regex(/[a-zA-Z]/, 'Password must contain at least one letter.'),
    confirm: z.string(),
}).refine(d => d.password === d.confirm, {
    message: 'Passwords do not match.',
    path: ['confirm'],
});

// ── Page ──────────────────────────────────────────────────────────────────────
export default function UpdatePasswordPage() {
    const methods = useForm({
        resolver: zodResolver(updatePasswordSchema),
        defaultValues: { password: '', confirm: '' },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ password }) => {
            const res = await fetch('/api/auth/update-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update password.');
            return data;
        },
        onSuccess: () => {
            // Wait 1.5s for UX completion feeling before redirect
            setTimeout(() => { window.location.href = '/'; }, 1500);
        },
        onError: (err) => {
            methods.setError('root.serverError', { type: 'server', message: err.message });
        },
    });

    const rootError = methods.formState.errors.root?.serverError?.message;

    if (updateMutation.isSuccess) {
        return (
            <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', padding: '32px 16px' }}>
                <Card style={{ maxWidth: '440px', width: '100%', padding: '32px', textAlign: 'center' }}>
                    <Alert type="success">
                        <strong style={{ display: 'block', fontSize: '1.125rem', marginBottom: '8px' }}>Password Secured</strong>
                        Redirecting you to the dashboard...
                    </Alert>
                </Card>
            </div>
        );
    }

    return (
        <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', padding: '32px 16px' }}>
            <Card style={{ maxWidth: '440px', width: '100%', padding: '32px' }} className="animate-fade-in-up">
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                        Secure New Password
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Almost there. Enter your new credentials.
                    </p>
                </div>

                {rootError && (
                    <Alert type="error">{rootError}</Alert>
                )}

                <Form methods={methods} onSubmit={(d) => updateMutation.mutate(d)} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <FormField name="password" label="New Password" description="8+ characters, letters & numbers">
                        <Input
                            {...methods.register('password')}
                            type="password"
                            placeholder="Create a strong password"
                            disabled={updateMutation.isPending}
                            autoFocus
                        />
                    </FormField>
                    <FormField name="confirm" label="Confirm Password">
                        <Input
                            {...methods.register('confirm')}
                            type="password"
                            placeholder="Repeat new password"
                            disabled={updateMutation.isPending}
                        />
                    </FormField>
                    <Button
                        type="submit"
                        loading={updateMutation.isPending}
                        style={{ marginTop: '8px', width: '100%' }}
                    >
                        Confirm &amp; Login →
                    </Button>
                </Form>
            </Card>
        </div>
    );
}
