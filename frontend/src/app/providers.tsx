'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SocketProvider } from '@/contexts/SocketContext';
import { ToastProvider } from '@/components/ui';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <ToastProvider position="top-right">
                <AuthProvider>
                    <SocketProvider>{children}</SocketProvider>
                </AuthProvider>
            </ToastProvider>
        </ThemeProvider>
    );
}
