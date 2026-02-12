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
            // Obter tokens dos parâmetros da URL
            const accessToken = searchParams.get('accessToken');
            const refreshToken = searchParams.get('refreshToken');
            const error = searchParams.get('error');

            if (error) {
                // OAuth falhou - redirecionar para login com erro
                router.push(`/login?error=${encodeURIComponent(error)}`);
                return;
            }

            if (!accessToken || !refreshToken) {
                // Tokens ausentes - redirecionar para login
                router.push('/login?error=OAuth+failed');
                return;
            }

            // Salvar tokens
            apiClient.setTokens(accessToken, refreshToken);

            // Redirecionar para chat ou returnUrl
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
