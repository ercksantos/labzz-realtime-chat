'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import type { User, LoginCredentials, RegisterData } from '@/types';

interface AuthContextData {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    verify2FA: (userId: string, token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const isAuthenticated = !!user;

    // Carregar usuário ao montar - apenas se houver token
    useEffect(() => {
        const loadUser = async () => {
            try {
                // Só tenta carregar se houver um token
                const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
                if (token) {
                    const currentUser = await authService.getCurrentUser();
                    setUser(currentUser);
                } else {
                    setUser(null);
                }
            } catch (error) {
                // Usuário não autenticado ou token inválido
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();
    }, []);

    const login = useCallback(
        async (credentials: LoginCredentials) => {
            try {
                const authData = await authService.login(credentials);
                setUser(authData.user);
                router.push('/chat');
            } catch (error: any) {
                // Se retornar requires2FA, não seta o user ainda
                if (error.response?.data?.data?.requires2FA) {
                    throw error; // Login page vai tratar
                }
                throw error;
            }
        },
        [router]
    );

    const register = useCallback(
        async (data: RegisterData) => {
            try {
                console.log('Register: sending data', { ...data, password: '[REDACTED]' });
                const authData = await authService.register(data);
                console.log('Register: success', authData.user);
                setUser(authData.user);
                router.push('/chat');
            } catch (error: any) {
                console.error('Register: error', error);
                throw error;
            }
        },
        [router]
    );

    const logout = useCallback(async () => {
        await authService.logout();
        setUser(null);
        router.push('/login');
    }, [router]);

    const verify2FA = useCallback(
        async (userId: string, token: string) => {
            const authData = await authService.verify2FA(userId, token);
            setUser(authData.user);
            // Não navegar aqui - o componente gerencia a navegação
        },
        []
    );

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isLoading,
                login,
                register,
                logout,
                verify2FA,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
