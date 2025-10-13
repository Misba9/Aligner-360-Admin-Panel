'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import { useMutation } from '@tanstack/react-query';
import { AuthService } from '@/services/auth.service';

const VerifyEmail: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            verifyEmail(token);
        } else {
            setError('Invalid verification link');
        }
    }, [searchParams]);

    const verifyEmail = async (token: string) => {
        verifyEmailMutation.mutate(token);
    };
    const verifyEmailMutation = useMutation({
        mutationFn: async (token: string) => {
            return await AuthService.verifyEmail(token);
        },
        onSuccess: (data) => {
            setSuccess(true);
            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push('/login?message=email-verified');
            }, 3000);
        },
        onError: (err: any) => {
            setError(
                err.response?.data?.message ||
                'Failed to verify email. The link may be expired or invalid.'
            );
        }
    })

    const handleResendEmail = async () => {
        // You could implement this if you store the email in localStorage or get it from user input
        setError('Please contact support for a new verification email.');
    };

    if (verifyEmailMutation.isPending) {
        return (

            <div className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-2xl p-8 text-center">
                <div className="mb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                    <h3 className="text-xl font-semibold text-neutral-800 mb-2">Verifying Your Email</h3>
                    <p className="text-neutral-600">
                        Please wait while we verify your email address...
                    </p>
                </div>
            </div>

        );
    }

    if (success) {
        return (

            <div className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-2xl p-8 text-center">
                <div className="mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-neutral-800 mb-2">Email Verified Successfully!</h3>
                    <p className="text-neutral-600 mb-6">
                        Your email has been verified and your account is now active. You can now access all features of DentistPortal.
                    </p>

                    <div className="space-y-4">
                        <button
                            onClick={() => router.push('/login')}
                            className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            Continue to Login
                        </button>

                        <p className="text-sm text-neutral-500">
                            Redirecting automatically in a few seconds...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (

        <div className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-2xl p-8 text-center">
            <div className="mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-2">Verification Failed</h3>
                <p className="text-red-600 mb-6">
                    {error}
                </p>

                <div className="space-y-4">
                    <button
                        onClick={() => router.push('/signup')}
                        className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        Create New Account
                    </button>

                    <button
                        onClick={() => router.push('/login')}
                        className="w-full px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                        Try to Login
                    </button>

                    <p className="text-sm text-neutral-500">
                        Need help?{' '}
                        <a href="mailto:support@dentistportal.com" className="text-primary-600 hover:text-primary-700">
                            Contact Support
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};
const VerifyEmailPage = () => {
    return (
        <Suspense>
            <VerifyEmail />
        </Suspense>
    )
}
export default VerifyEmailPage;
