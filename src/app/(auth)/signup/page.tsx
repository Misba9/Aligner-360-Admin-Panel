'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import AuthLayout from '@/components/auth/AuthLayout';
import SignupForm from '@/components/auth/SignupForm';
import { AuthService } from '@/services/auth.service';
import { SignupFormData } from '@/types/auth';

const SignupPage: React.FC = () => {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const signupMutation = useMutation({
        mutationFn: (data: SignupFormData) => AuthService.signup(data),
        onSuccess: (response) => {
            if (response.success) {
                setSuccess(true);
                // Show success message and redirect after a short delay
                setTimeout(() => {
                    router.push('/login?message=signup-success');
                }, 2000);
            }
        },
        onError: (error: any) => {
            console.error('Signup error:', error);
            if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError('Signup failed. Please try again.');
            }
        },
    });

    const handleSignup = (data: SignupFormData) => {
        setError(null);
        signupMutation.mutate(data);
    };

    if (success) {
        return (
            <AuthLayout>
                <div className="bg-white shadow-lg rounded-lg p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-8 h-8 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h2>
                    <p className="text-gray-600 mb-4">
                        Your admin account has been created successfully. Please check your email to verify your account.
                    </p>
                    <p className="text-sm text-gray-500">
                        Redirecting to login page...
                    </p>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout>
            <SignupForm
                onSubmit={handleSignup}
                isLoading={signupMutation.isPending}
                error={error}
            />
        </AuthLayout>
    );
};

export default SignupPage;
