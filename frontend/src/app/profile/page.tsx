'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/user.service';
import { Avatar, Button, Input, Loading, Modal } from '@/components/ui';
import { cn } from '@/lib/utils/cn';

interface AvatarUploadProps {
  currentAvatar?: string;
  userName: string;
  onAvatarChange: (url: string | null) => void;
}

function AvatarUpload({ currentAvatar, userName, onAvatarChange }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validação de tipo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem válida.');
      return;
    }

    // Validação de tamanho (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.');
      return;
    }

    // Criar preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
      setSelectedFile(file);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const { url } = await userService.uploadAvatar(selectedFile);
      onAvatarChange(url);
      setShowCropModal(false);
      setPreviewUrl(null);
      setSelectedFile(null);
    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error);
      alert('Erro ao fazer upload do avatar. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!currentAvatar) return;

    try {
      await userService.removeAvatar();
      onAvatarChange(null);
    } catch (error) {
      console.error('Erro ao remover avatar:', error);
      alert('Erro ao remover avatar. Tente novamente.');
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <Avatar src={currentAvatar} alt={userName} size="xl" className="w-32 h-32" />
        <button
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'absolute inset-0 flex items-center justify-center',
            'bg-black/50 rounded-full opacity-0 group-hover:opacity-100',
            'transition-opacity cursor-pointer'
          )}
        >
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
          Alterar foto
        </Button>
        {currentAvatar && (
          <Button variant="ghost" size="sm" onClick={handleRemoveAvatar}>
            Remover
          </Button>
        )}
      </div>

      {/* Modal de Preview/Crop */}
      <Modal
        isOpen={showCropModal}
        onClose={() => {
          setShowCropModal(false);
          setPreviewUrl(null);
          setSelectedFile(null);
        }}
        title="Atualizar foto de perfil"
      >
        <div className="flex flex-col items-center gap-6 py-4">
          {previewUrl && (
            <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700">
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            A imagem será recortada automaticamente para um círculo
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowCropModal(false);
                setPreviewUrl(null);
                setSelectedFile(null);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpload} isLoading={isUploading}>
              Salvar foto
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Estado do formulário
  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
  });

  // Sincronizar formData quando user carrega
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
      });
    }
  }, [user]);

  // Handler de atualização do avatar
  const handleAvatarChange = useCallback((url: string | null) => {
    // Em uma implementação real, atualizaria o contexto de auth
    setSuccessMessage('Foto de perfil atualizada com sucesso!');
    setTimeout(() => setSuccessMessage(''), 3000);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setErrorMessage('');

    try {
      await userService.updateProfile(formData);
      setSuccessMessage('Perfil atualizado com sucesso!');
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Erro ao atualizar perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      name: user?.name || '',
      username: user?.username || '',
      email: user?.email || '',
    });
    setIsEditing(false);
    setErrorMessage('');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Meu Perfil</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Gerencie suas informações pessoais
          </p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
            {errorMessage}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          {/* Avatar Section */}
          <div className="p-8 border-b border-gray-200 dark:border-gray-700">
            <AvatarUpload
              currentAvatar={user.avatar}
              userName={user.name}
              onAvatarChange={handleAvatarChange}
            />
          </div>

          {/* Profile Info */}
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Informações do Perfil
              </h2>
              {!isEditing && (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Editar
                </Button>
              )}
            </div>

            <div className="space-y-6">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome completo
                </label>
                {isEditing ? (
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Seu nome"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white py-2">{user.name}</p>
                )}
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome de usuário
                </label>
                {isEditing ? (
                  <Input
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="seu_username"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white py-2">@{user.username}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                {isEditing ? (
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="seu@email.com"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white py-2">{user.email}</p>
                )}
              </div>

              {/* Account Info (read only) */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Membro desde
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Última atualização
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {user.updatedAt
                        ? new Date(user.updatedAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Actions */}
            {isEditing && (
              <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={handleCancelEdit} disabled={isSaving}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveProfile} isLoading={isSaving}>
                  Salvar alterações
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/settings"
            className={cn(
              'flex items-center gap-4 p-4 rounded-xl',
              'bg-white dark:bg-dark-card',
              'border border-gray-200 dark:border-gray-700',
              'hover:border-primary-500 dark:hover:border-primary-500',
              'transition-colors group'
            )}
          >
            <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <svg
                className="w-6 h-6 text-primary-600 dark:text-primary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                Configurações
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Gerenciar conta e preferências
              </p>
            </div>
          </a>

          <a
            href="/settings#security"
            className={cn(
              'flex items-center gap-4 p-4 rounded-xl',
              'bg-white dark:bg-dark-card',
              'border border-gray-200 dark:border-gray-700',
              'hover:border-primary-500 dark:hover:border-primary-500',
              'transition-colors group'
            )}
          >
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <svg
                className="w-6 h-6 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                Segurança
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Senha e autenticação 2FA</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
