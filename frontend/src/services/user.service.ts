import { apiClient } from '@/lib/api/client';
import type { User } from '@/types';

export interface UpdateProfileData {
  name?: string;
  username?: string;
  email?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface TwoFactorSetupResponse {
  secret: string;
  qrCode: string;
}

export interface TwoFactorStatusResponse {
  enabled: boolean;
  enabledAt?: string;
}

export const userService = {
  async getProfile(): Promise<User> {
    const response = await apiClient.get<{ status: string; data: { user: User } }>('/users/me');
    return response.data.data.user;
  },

  async updateProfile(data: UpdateProfileData): Promise<User> {
    const response = await apiClient.put<{ status: string; data: { user: User } }>(
      '/users/me',
      data
    );
    return response.data.data.user;
  },

  async uploadAvatar(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiClient.postFormData<{ status: string; data: { url: string } }>(
      '/users/me/avatar',
      formData
    );
    return response.data.data;
  },

  async removeAvatar(): Promise<void> {
    await apiClient.delete('/users/me/avatar');
  },

  async changePassword(data: ChangePasswordData): Promise<void> {
    await apiClient.put('/users/me/password', data);
  },

  async get2FAStatus(): Promise<TwoFactorStatusResponse> {
    // Backend não tem endpoint separado de status. Buscar do perfil
    const response = await apiClient.get<{ status: string; data: { user: User } }>('/users/me');
    const user = response.data.data.user;
    return {
      enabled: !!(user as any).twoFactorEnabled,
    };
  },

  async setup2FA(): Promise<TwoFactorSetupResponse> {
    const response = await apiClient.get<{ status: string; data: TwoFactorSetupResponse }>(
      '/2fa/generate'
    );
    return response.data.data;
  },

  async enable2FA(secret: string, token: string): Promise<{ backupCodes: string[] }> {
    const response = await apiClient.post<{ status: string; data: { backupCodes: string[] } }>(
      '/2fa/enable',
      { secret, token }
    );
    return response.data.data;
  },

  async disable2FA(password: string): Promise<void> {
    await apiClient.post('/2fa/disable', { password });
  },

  async getUserById(userId: string): Promise<User> {
    const response = await apiClient.get<{ status: string; data: { user: User } }>(
      `/users/${userId}`
    );
    return response.data.data.user;
  },

  async deleteAccount(password: string): Promise<void> {
    await apiClient.delete('/users/me', { data: { password } });
  },
};
