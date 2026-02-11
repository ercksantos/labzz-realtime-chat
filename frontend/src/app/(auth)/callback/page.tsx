'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { Loading } from '@/components/ui';

/**
 * OAuth Callback page
 * Receives tokens from backend OAuth flow and saves them
 * Then redirects to chat or intended destination
 */
function CallbackHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const handleCallback = async () => {
            // Get tokens from query params
            const accessToken = searchParams.get('accessToken');
            const refreshToken = searchParams.get('refreshToken');
            const error = searchParams.get('error');

            if (error) {
                // OAuth failed - redirect to login with error message
                router.push(`/login?error=${encodeURIComponent(error)}`);
                return;
            }

            if (!accessToken || !refreshToken) {
                // Missing tokens - redirect to login
                router.push('/login?error=OAuth+failed');
                return;
            }

            // Save tokens
            apiClient.setTokens(accessToken, refreshToken);

            // Redirect to chat or returnUrl if provided
            const returnUrl = searchParams.get('returnUrl') || '/chat';
            router.push(returnUrl);
        };

        handleCallback();
    }, [router, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
            <div className="text-center">
                <Loading size="xl" />
                <p className="mt-4 text-gray-600 dark:text-gray-400">Autenticando...</p>
            </div>
        </div>
    );
}

export default function OAuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
                <Loading size="xl" />
            </div>
        }>
            <CallbackHandler />
        </Suspense>
    );
}
