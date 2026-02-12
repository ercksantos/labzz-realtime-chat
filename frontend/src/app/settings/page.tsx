'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userService, TwoFactorSetupResponse } from '@/services/user.service';
import { Button, Input, Loading, Modal } from '@/components/ui';
import { cn } from '@/lib/utils/cn';

// ============= Password Change Component =============
function PasswordChange() {
    const [isChanging, setIsChanging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }

        if (formData.newPassword.length < 8) {
            setError('A nova senha deve ter pelo menos 8 caracteres');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await userService.changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
            });
            setSuccess('Senha alterada com sucesso!');
            setIsChanging(false);
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao alterar senha');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Senha
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Atualize sua senha periodicamente para maior segurança
                    </p>
                </div>
                {!isChanging && (
                    <Button variant="outline" onClick={() => setIsChanging(true)}>
                        Alterar
                    </Button>
                )}
            </div>

            {success && (
                <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm">
                    {success}
                </div>
            )}

            {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {isChanging && (
                <form onSubmit={handleSubmit} className="space-y-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Input
                        type="password"
                        name="currentPassword"
                        label="Senha atual"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        type="password"
                        name="newPassword"
                        label="Nova senha"
                        value={formData.newPassword}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        type="password"
                        name="confirmPassword"
                        label="Confirmar nova senha"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setIsChanging(false);
                                setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                setError('');
                            }}
                            disabled={isLoading}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" isLoading={isLoading}>
                            Salvar nova senha
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}

// ============= Two Factor Auth Component =============
function TwoFactorAuth() {
    const [isEnabled, setIsEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showSetupModal, setShowSetupModal] = useState(false);
    const [showDisableModal, setShowDisableModal] = useState(false);
    const [setupData, setSetupData] = useState<TwoFactorSetupResponse | null>(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [password, setPassword] = useState('');
    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const [showBackupCodes, setShowBackupCodes] = useState(false);
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = async () => {
        try {
            const status = await userService.get2FAStatus();
            setIsEnabled(status.enabled);
        } catch (err) {
            console.error('Erro ao verificar status do 2FA:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartSetup = async () => {
        setIsProcessing(true);
        setError('');

        try {
            const data = await userService.setup2FA();
            setSetupData(data);
            setShowSetupModal(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao iniciar configuração');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleVerifyAndEnable = async () => {
        if (verificationCode.length !== 6) {
            setError('O código deve ter 6 dígitos');
            return;
        }

        setIsProcessing(true);
        setError('');

        try {
            const { backupCodes: codes } = await userService.enable2FA(setupData!.secret, verificationCode);
            setBackupCodes(codes);
            setShowBackupCodes(true);
            setShowSetupModal(false);
            setIsEnabled(true);
            setVerificationCode('');
            setSetupData(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Código inválido');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDisable = async () => {
        setIsProcessing(true);
        setError('');

        try {
            await userService.disable2FA(password);
            setIsEnabled(false);
            setShowDisableModal(false);
            setPassword('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao desativar 2FA');
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-6 bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <Loading size="sm" />
                    <span className="text-gray-500 dark:text-gray-400">Carregando...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="p-6 bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            'p-3 rounded-lg',
                            isEnabled
                                ? 'bg-green-100 dark:bg-green-900/30'
                                : 'bg-gray-100 dark:bg-gray-800'
                        )}>
                            <svg
                                className={cn(
                                    'w-6 h-6',
                                    isEnabled
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-gray-500 dark:text-gray-400'
                                )}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Autenticação de Dois Fatores (2FA)
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {isEnabled
                                    ? 'Ativado - Sua conta está protegida'
                                    : 'Desativado - Adicione uma camada extra de segurança'}
                            </p>
                        </div>
                    </div>

                    {isEnabled ? (
                        <Button
                            variant="danger"
                            onClick={() => setShowDisableModal(true)}
                        >
                            Desativar
                        </Button>
                    ) : (
                        <Button
                            onClick={handleStartSetup}
                            isLoading={isProcessing}
                        >
                            Ativar
                        </Button>
                    )}
                </div>

                {error && !showSetupModal && !showDisableModal && (
                    <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
                        {error}
                    </div>
                )}
            </div>

            {/* Setup Modal */}
            <Modal
                isOpen={showSetupModal}
                onClose={() => {
                    setShowSetupModal(false);
                    setSetupData(null);
                    setVerificationCode('');
                    setError('');
                }}
                title="Configurar Autenticação 2FA"
            >
                <div className="space-y-6">
                    <div className="text-center">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Escaneie o QR Code abaixo com seu aplicativo autenticador
                            (Google Authenticator, Authy, etc.)
                        </p>

                        {setupData?.qrCode && (
                            <div className="inline-block p-4 bg-white rounded-lg shadow-inner">
                                <img
                                    src={setupData.qrCode}
                                    alt="QR Code 2FA"
                                    className="w-48 h-48"
                                />
                            </div>
                        )}

                        {setupData?.secret && (
                            <div className="mt-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                    Ou digite manualmente:
                                </p>
                                <code className="block p-2 bg-gray-100 dark:bg-gray-800 rounded font-mono text-sm break-all">
                                    {setupData.secret}
                                </code>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Código de verificação
                        </label>
                        <Input
                            type="text"
                            value={verificationCode}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                setVerificationCode(value);
                                setError('');
                            }}
                            placeholder="000000"
                            className="text-center text-2xl tracking-widest"
                            maxLength={6}
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                                setShowSetupModal(false);
                                setSetupData(null);
                                setVerificationCode('');
                                setError('');
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            className="flex-1"
                            onClick={handleVerifyAndEnable}
                            isLoading={isProcessing}
                            disabled={verificationCode.length !== 6}
                        >
                            Verificar e Ativar
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Backup Codes Modal */}
            <Modal
                isOpen={showBackupCodes}
                onClose={() => setShowBackupCodes(false)}
                title="Códigos de Backup"
            >
                <div className="space-y-4">
                    <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                        <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                            <strong>Importante:</strong> Salve estes códigos em um lugar seguro.
                            Cada código pode ser usado apenas uma vez para acessar sua conta
                            se você perder acesso ao seu dispositivo autenticador.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {backupCodes.map((code, index) => (
                            <code
                                key={index}
                                className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-center font-mono"
                            >
                                {code}
                            </code>
                        ))}
                    </div>

                    <Button
                        className="w-full"
                        onClick={() => setShowBackupCodes(false)}
                    >
                        Entendi, salvei os códigos
                    </Button>
                </div>
            </Modal>

            {/* Disable Modal */}
            <Modal
                isOpen={showDisableModal}
                onClose={() => {
                    setShowDisableModal(false);
                    setPassword('');
                    setError('');
                }}
                title="Desativar 2FA"
            >
                <div className="space-y-4">
                    <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <p className="text-red-800 dark:text-red-300 text-sm">
                            <strong>Atenção:</strong> Desativar a autenticação de dois fatores
                            reduzirá a segurança da sua conta.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Digite sua senha para confirmar
                        </label>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError('');
                            }}
                            placeholder="Sua senha"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                                setShowDisableModal(false);
                                setPassword('');
                                setError('');
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="danger"
                            className="flex-1"
                            onClick={handleDisable}
                            isLoading={isProcessing}
                            disabled={!password}
                        >
                            Desativar 2FA
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}

// ============= Delete Account Component =============
function DeleteAccount() {
    const { logout } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmText, setConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState('');

    const handleDelete = async () => {
        if (confirmText !== 'DELETAR') {
            setError('Digite "DELETAR" para confirmar');
            return;
        }

        setIsDeleting(true);
        setError('');

        try {
            await userService.deleteAccount(password);
            await logout();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao deletar conta');
            setIsDeleting(false);
        }
    };

    return (
        <>
            <div className="p-6 bg-white dark:bg-dark-card rounded-xl border border-red-200 dark:border-red-900/50">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
                            Zona de Perigo
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Ações irreversíveis para sua conta
                        </p>
                    </div>
                    <Button
                        variant="danger"
                        onClick={() => setShowModal(true)}
                    >
                        Deletar conta
                    </Button>
                </div>
            </div>

            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setPassword('');
                    setConfirmText('');
                    setError('');
                }}
                title="Deletar Conta"
            >
                <div className="space-y-4">
                    <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <p className="text-red-800 dark:text-red-300 text-sm">
                            <strong>Esta ação é irreversível!</strong> Todos os seus dados,
                            mensagens e configurações serão permanentemente excluídos.
                        </p>
                    </div>

                    <Input
                        type="password"
                        label="Senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Digite sua senha"
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Digite <strong>DELETAR</strong> para confirmar
                        </label>
                        <Input
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                            placeholder="DELETAR"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                                setShowModal(false);
                                setPassword('');
                                setConfirmText('');
                                setError('');
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="danger"
                            className="flex-1"
                            onClick={handleDelete}
                            isLoading={isDeleting}
                            disabled={!password || confirmText !== 'DELETAR'}
                        >
                            Deletar permanentemente
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}

// ============= Main Settings Page =============
export default function SettingsPage() {
    const { user } = useAuth();

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
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Configurações
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Gerencie sua conta e preferências de segurança
                    </p>
                </div>

                {/* Navigation */}
                <nav className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
                    <a
                        href="/profile"
                        className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                    >
                        Perfil
                    </a>
                    <span className="text-primary-600 dark:text-primary-400 font-medium">
                        Segurança
                    </span>
                </nav>

                {/* Settings Sections */}
                <div className="space-y-6" id="security">
                    <PasswordChange />
                    <TwoFactorAuth />
                    <DeleteAccount />
                </div>

                {/* Back to Profile */}
                <div className="mt-8">
                    <a
                        href="/profile"
                        className={cn(
                            'inline-flex items-center gap-2 text-primary-600 dark:text-primary-400',
                            'hover:text-primary-700 dark:hover:text-primary-300'
                        )}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Voltar para o perfil
                    </a>
                </div>
            </div>
        </div>
    );
}
