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
    /**
     * Busca perfil do usuário atual
     */
    async getProfile(): Promise<User> {
        const response = await apiClient.get<{ status: string; data: { user: User } }>(
            '/users/me'
        );
        return response.data.data.user;
    },

    /**
     * Atualiza perfil do usuário
     */
    async updateProfile(data: UpdateProfileData): Promise<User> {
        const response = await apiClient.put<{ status: string; data: { user: User } }>(
            '/users/me',
            data
        );
        return response.data.data.user;
    },

    /**
     * Faz upload do avatar do usuário
     */
    async uploadAvatar(file: File): Promise<{ url: string }> {
        const formData = new FormData();
        formData.append('avatar', file);

        const response = await apiClient.postFormData<{ status: string; data: { url: string } }>(
            '/users/me/avatar',
            formData
        );
        return response.data.data;
    },

    /**
     * Remove avatar do usuário
     */
    async removeAvatar(): Promise<void> {
        await apiClient.delete('/users/me/avatar');
    },

    /**
     * Altera senha do usuário
     */
    async changePassword(data: ChangePasswordData): Promise<void> {
        await apiClient.put('/users/me/password', data);
    },

    /**
     * Busca status do 2FA
     */
    async get2FAStatus(): Promise<TwoFactorStatusResponse> {
        const response = await apiClient.get<{ status: string; data: TwoFactorStatusResponse }>(
            '/2fa/status'
        );
        return response.data.data;
    },

    /**
     * Inicia configuração do 2FA
     */
    async setup2FA(): Promise<TwoFactorSetupResponse> {
        const response = await apiClient.post<{ status: string; data: TwoFactorSetupResponse }>(
            '/2fa/setup'
        );
        return response.data.data;
    },

    /**
     * Verifica e ativa 2FA
     */
    async enable2FA(token: string): Promise<{ backupCodes: string[] }> {
        const response = await apiClient.post<{ status: string; data: { backupCodes: string[] } }>(
            '/2fa/enable',
            { token }
        );
        return response.data.data;
    },

    /**
     * Desativa 2FA
     */
    async disable2FA(password: string): Promise<void> {
        await apiClient.post('/2fa/disable', { password });
    },

    /**
     * Busca um usuário pelo ID
     */
    async getUserById(userId: string): Promise<User> {
        const response = await apiClient.get<{ status: string; data: { user: User } }>(
            `/users/${userId}`
        );
        return response.data.data.user;
    },

    /**
     * Deleta conta do usuário
     */
    async deleteAccount(password: string): Promise<void> {
        await apiClient.delete('/users/me', { data: { password } });
    },
};
