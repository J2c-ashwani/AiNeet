'use client';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';

import { Card, Button, Input, Skeleton, Alert } from '@/components/ui';
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
        <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', padding: '32px 16px' }}>
            <Card style={{ maxWidth: '440px', width: '100%', padding: '32px' }} className="animate-fade-in-up">
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Welcome Back</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Continue your NEET preparation</p>
                </div>

                {rootError && (
                    <Alert type="error">{rootError}</Alert>
                )}

                <Form methods={methods} onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                    
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <a href="/forgot-password" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent-primary)', textDecoration: 'none' }}>
                            Forgot Password?
                        </a>
                    </div>
                    
                    <Button 
                        type="submit" 
                        loading={loginMutation.isPending}
                        style={{ marginTop: '8px', width: '100%' }}
                    >
                        Sign In →
                    </Button>
                </Form>

                <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    Don't have an account? <a href="/register" style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'none' }}>Create Account</a>
                </p>
            </Card>
        </div>
    );
}

export const dynamic = 'force-dynamic';

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)' }}>
                <Skeleton style={{ maxWidth: '440px', width: '100%', height: '400px' }} />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
