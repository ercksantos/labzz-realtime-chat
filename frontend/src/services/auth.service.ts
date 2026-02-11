import { apiClient } from '@/lib/api/client';
import type { AuthResponse, LoginCredentials, RegisterData, User } from '@/types';

export const authService = {
    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await apiClient.post<{ status: string; data: AuthResponse }>(
            '/auth/register',
            data
        );
        const authData = response.data.data;

        // Salvar tokens
        apiClient.setTokens(authData.tokens.accessToken, authData.tokens.refreshToken);

        return authData;
    },

    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await apiClient.post<{ status: string; data: AuthResponse }>(
            '/auth/login',
            credentials
        );
        const authData = response.data.data;

        // Salvar tokens
        apiClient.setTokens(authData.tokens.accessToken, authData.tokens.refreshToken);

        return authData;
    },

    async logout(): Promise<void> {
        try {
            await apiClient.post('/auth/logout');
        } finally {
            // Sempre limpa tokens, mesmo se API falhar
            apiClient.clearTokens();
        }
    },

    async getCurrentUser(): Promise<User> {
        const response = await apiClient.get<{ status: string; data: { user: User } }>('/auth/me');
        return response.data.data.user;
    },

    async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
        const response = await apiClient.post<{ status: string; data: { accessToken: string } }>(
            '/auth/refresh',
            { refreshToken }
        );
        return response.data.data;
    },

    async verify2FA(userId: string, token: string): Promise<AuthResponse> {
        const response = await apiClient.post<{ status: string; data: AuthResponse }>(
            '/auth/verify-2fa',
            { userId, token }
        );
        const authData = response.data.data;

        // Salvar tokens
        apiClient.setTokens(authData.tokens.accessToken, authData.tokens.refreshToken);

        return authData;
    },

    async getCsrfToken(): Promise<{ csrfToken: string }> {
        const response = await apiClient.get<{ status: string; data: { csrfToken: string } }>(
            '/auth/csrf-token'
        );
        return response.data.data;
    },
};
