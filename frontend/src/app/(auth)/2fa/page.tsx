'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Loading } from '@/components/ui';

function TwoFactorForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const userId = searchParams.get('userId'); const returnUrl = searchParams.get('returnUrl') || '/chat';
    const { verify2FA } = useAuth();
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (!userId) {
            router.push('/login');
        } else {
            inputRefs.current[0]?.focus();
        }
    }, [userId, router]);

    const handleChange = (index: number, value: string) => {
        // Apenas números
        if (value && !/^\d$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);
        setError('');

        // Focar próximo input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Submeter automaticamente com 6 dígitos
        if (newCode.every((digit) => digit !== '') && index === 5) {
            handleSubmit(newCode.join(''));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        // Tratar backspace
        if (e.key === 'Backspace') {
            e.preventDefault();
            const newCode = [...code];

            if (code[index]) {
                // Limpar input atual
                newCode[index] = '';
                setCode(newCode);
            } else if (index > 0) {
                // Voltar ao input anterior e limpar
                newCode[index - 1] = '';
                setCode(newCode);
                inputRefs.current[index - 1]?.focus();
            }
        }
        // Tratar setas esquerda/direita
        else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();

        // Processar apenas se tiver 6 dígitos
        if (/^\d{6}$/.test(pastedData)) {
            const newCode = pastedData.split('');
            setCode(newCode);
            setError('');

            // Focus last input
            inputRefs.current[5]?.focus();

            // Submeter automaticamente
            handleSubmit(pastedData);
        }
    };

    const handleSubmit = async (codeString?: string) => {
        const finalCode = codeString || code.join('');

        if (finalCode.length !== 6) {
            setError('Por favor, insira os 6 dígitos');
            return;
        }

        if (!userId) {
            setError('ID do usuário não encontrado');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await verify2FA(userId, finalCode);
            // Sucesso - navegar para URL de retorno ou chat
            router.push(returnUrl);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Código inválido. Por favor, tente novamente.');
            setCode(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        // TODO: Implementar reenvio quando o backend suportar
        setError('Funcionalidade de reenvio não implementada ainda');
    };

    if (!userId) {
        return null; // Router will redirect
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-4">
                        <svg
                            className="h-8 w-8 text-primary-600 dark:text-primary-400"
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
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Verificação em duas etapas
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Digite o código de 6 dígitos enviado para o seu dispositivo de autenticação
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-8">
                    {/* Error Alert */}
                    {error && (
                        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Code Input */}
                    <div className="mb-8">
                        <div className="flex justify-center gap-2 sm:gap-3">
                            {code.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => {
                                        inputRefs.current[index] = el;
                                    }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={handlePaste}
                                    disabled={isLoading}
                                    className={`w-12 h-12 sm:w-14 sm:h-14 text-center text-2xl font-semibold border-2 rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    transition-colors duration-200
                    ${error
                                            ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
                                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-bg'
                                        }
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                    text-gray-900 dark:text-white
                  `}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="button"
                        onClick={() => handleSubmit()}
                        fullWidth
                        isLoading={isLoading}
                        disabled={isLoading || code.some((digit) => digit === '')}
                    >
                        Verificar código
                    </Button>

                    {/* Resend Code */}
                    <div className="mt-4 text-center">
                        <button
                            type="button"
                            onClick={handleResendCode}
                            disabled={isLoading}
                            className={`text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
                        >
                            Não recebeu o código? Reenviar
                        </button>
                    </div>

                    {/* Back to Login */}
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={() => router.push('/login')}
                            disabled={isLoading}
                            className={`w-full text-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
                        >
                            ← Voltar para o login
                        </button>
                    </div>
                </div>

                {/* Security Notice */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex">
                        <svg
                            className="h-5 w-5 text-blue-400 flex-shrink-0 mr-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            Por questões de segurança, você precisa inserir o código de autenticação a cada novo
                            login.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function TwoFactorPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
                <Loading size="xl" />
            </div>
        }>
            <TwoFactorForm />
        </Suspense>
    );
}
