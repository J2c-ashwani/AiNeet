'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';

import { Card, Button, Input } from '@/components/ui';
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
            <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
                <Card className="w-full max-w-[440px] p-8 text-center">
                    <div role="status" className="p-5 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <h2 className="text-lg font-bold text-emerald-700 mb-2">Password Secured</h2>
                        <p className="text-emerald-600 text-sm">Redirecting you to the dashboard...</p>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-8">
            <Card className="w-full max-w-[440px] p-8 animate-fade-in-up">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-extrabold text-[var(--text-primary)] mb-2">
                        Secure New Password
                    </h1>
                    <p className="text-[var(--text-secondary)] text-sm">
                        Almost there. Enter your new credentials.
                    </p>
                </div>

                {rootError && (
                    <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm mb-6 font-medium">
                        {rootError}
                    </div>
                )}

                <Form methods={methods} onSubmit={(d) => updateMutation.mutate(d)} className="flex flex-col gap-5">
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
                        className="mt-2 w-full"
                    >
                        Confirm &amp; Login →
                    </Button>
                </Form>
            </Card>
        </div>
    );
}
