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
    const response = await apiClient.post<{ status: string; data: any }>(
      '/auth/login',
      credentials
    );
    const authData = response.data.data;

    // Backend retorna tokens no nível raiz ou dentro de 'tokens'
    const accessToken = authData.tokens?.accessToken || authData.accessToken;
    const refreshToken = authData.tokens?.refreshToken || authData.refreshToken;

    apiClient.setTokens(accessToken, refreshToken);

    return {
      user: authData.user,
      tokens: { accessToken, refreshToken },
    };
  },

  async logout(): Promise<void> {
    try {
      const refreshToken =
        typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken });
      }
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
    const response = await apiClient.post<{ status: string; data: any }>('/auth/verify-2fa', {
      userId,
      token,
    });
    const authData = response.data.data;

    const accessToken = authData.tokens?.accessToken || authData.accessToken;
    const refreshToken = authData.tokens?.refreshToken || authData.refreshToken;

    apiClient.setTokens(accessToken, refreshToken);

    return {
      user: authData.user,
      tokens: { accessToken, refreshToken },
    };
  },

  async getCsrfToken(): Promise<{ csrfToken: string }> {
    const response = await apiClient.get<{ status: string; data: { csrfToken: string } }>(
      '/auth/csrf-token'
    );
    return response.data.data;
  },
};
