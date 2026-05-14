'use client';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';

import { Card, Button, Input, Skeleton } from '@/components/ui';
import { Form, FormField } from '@/components/forms/Form';
import { loginSchema } from '@/lib/validation/auth';

function LoginContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const errorParam = searchParams.get('error');

    // Canonical Typed Form
    const methods = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    });

    // Centralized Stateful Mutation Orchestration
    const loginMutation = useMutation({
        mutationFn: async (credentials) => {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Authentication failed.');
            return data;
        },
        onSuccess: () => {
            window.location.href = '/';
        },
        onError: (error) => {
            methods.setError('root.serverError', {
                type: 'server',
                message: error.message
            });
        }
    });

    const onSubmit = (data) => {
        loginMutation.mutate(data);
    };

    const getUrlError = () => {
        if (errorParam === 'reset_link_invalid') return 'This reset link is expired or invalid. Please request a new one.';
        if (errorParam === 'auth_failed') return 'Authentication failed. Please try again.';
        return null;
    };

    const rootError = methods.formState.errors.root?.serverError?.message || getUrlError();

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-8">
            <Card className="w-full max-w-[440px] p-8 animate-fade-in-up">
                <div className="text-center mb-8">
                    {/* Banned raw emoji replaced with text/icon equivalent if we had an Icon component, omitting for strict compliance or using simple text */}
                    <h1 className="text-2xl font-extrabold text-[var(--text-primary)] mb-2">Welcome Back</h1>
                    <p className="text-[var(--text-secondary)]">Continue your NEET preparation</p>
                </div>

                {rootError && (
                    <div 
                        role="alert"
                        className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm mb-6 font-medium"
                    >
                        {rootError}
                    </div>
                )}

                <Form methods={methods} onSubmit={onSubmit} className="flex flex-col gap-5">
                    <FormField name="email" label="Email">
                        <Input 
                            {...methods.register('email')}
                            type="email" 
                            placeholder="Enter your email" 
                            disabled={loginMutation.isPending}
                        />
                    </FormField>
                    
                    <FormField name="password" label="Password">
                        <Input 
                            {...methods.register('password')}
                            type="password" 
                            placeholder="Enter your password" 
                            disabled={loginMutation.isPending}
                        />
                    </FormField>
                    
                    <div className="flex justify-end">
                        <a href="/forgot-password" className="text-sm font-semibold text-[var(--accent-primary)] hover:underline">
                            Forgot Password?
                        </a>
                    </div>
                    
                    <Button 
                        type="submit" 
                        loading={loginMutation.isPending}
                        className="mt-2 w-full"
                    >
                        Sign In →
                    </Button>
                </Form>

                <p className="text-center mt-8 text-sm text-[var(--text-muted)]">
                    Don't have an account? <a href="/register" className="text-[var(--text-primary)] font-semibold hover:underline">Create Account</a>
                </p>
            </Card>
        </div>
    );
}

export const dynamic = 'force-dynamic';

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
                <Skeleton className="w-full max-w-[440px] h-[400px]" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
