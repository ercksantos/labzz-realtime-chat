'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loading } from '@/components/ui';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

/**
 * HOC Component to protect routes that require authentication
 * Redirects to /login if user is not authenticated
 * Shows loading spinner while checking authentication status
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            // Save intended destination to redirect after login
            const returnUrl = encodeURIComponent(pathname);
            router.push(`/login?returnUrl=${returnUrl}`);
        }
    }, [isAuthenticated, isLoading, router, pathname]);

    // Show loading while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
                <div className="text-center">
                    <Loading size="xl" />
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Verificando autenticação...</p>
                </div>
            </div>
        );
    }

    // Don't render protected content if not authenticated
    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}
