'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import AuthLayout from '@/components/auth/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';
import { AuthService } from '@/services/auth.service';
import { LoginFormData } from '@/types/auth';

const LoginPage: React.FC = () => {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    const loginMutation = useMutation({
        mutationFn: (data: LoginFormData) => AuthService.login(data),
        onSuccess: (response) => {
            if (response.success && response.user?.role === 'admin') {
                // Redirect to admin dashboard
                router.push('/dashboard');
            } else {
                setError('Access denied. Admin privileges required.');
            }
        },
        onError: (error: any) => {
            console.error('Login error:', error);
            if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError('Login failed. Please check your credentials and try again.');
            }
        },
    });

    const handleLogin = (data: LoginFormData) => {
        setError(null);
        loginMutation.mutate(data);
    };

    return (
        <AuthLayout>
            <LoginForm
                onSubmit={handleLogin}
                isLoading={loginMutation.isPending}
                error={error}
            />
        </AuthLayout>
    );
};

export default LoginPage;
