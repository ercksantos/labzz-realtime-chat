'use client';

import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';

interface MessageInputProps {
    onSendMessage: (content: string) => void;
    onTyping?: () => void;
    disabled?: boolean;
    placeholder?: string;
}

export function MessageInput({
    onSendMessage,
    onTyping,
    disabled = false,
    placeholder = 'Digite uma mensagem...',
}: MessageInputProps) {
    const [message, setMessage] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    const handleSend = () => {
        const trimmedMessage = message.trim();
        if (!trimmedMessage || disabled) return;

        onSendMessage(trimmedMessage);
        setMessage('');

        // Resetar altura do textarea
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        // Enviar com Enter (sem Shift)
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleChange = (value: string) => {
        setMessage(value);

        // Auto-resize do textarea
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }

        // Emitir evento de digitação
        if (onTyping) {
            onTyping();

            // Limpar timeout anterior
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Timeout para parar indicador de digitação
            typingTimeoutRef.current = setTimeout(() => {
                // Emitir evento de parar digitação se necessário
            }, 1000);
        }
    };

    return (
        <div className="bg-white dark:bg-dark-card border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-end gap-2">
                {/* Emoji Button - placeholder */}
                <button
                    type="button"
                    disabled={disabled}
                    className={cn(
                        'flex-shrink-0 p-2 rounded-lg',
                        'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
                        'hover:bg-gray-100 dark:hover:bg-gray-700',
                        'transition-colors',
                        disabled && 'opacity-50 cursor-not-allowed'
                    )}
                    title="Emoji"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </button>

                {/* Message Input */}
                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => handleChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={disabled}
                        placeholder={placeholder}
                        rows={1}
                        className={cn(
                            'w-full px-4 py-3 rounded-lg resize-none',
                            'bg-gray-100 dark:bg-dark-bg',
                            'border border-transparent focus:border-primary-500',
                            'focus:outline-none focus:ring-2 focus:ring-primary-500/20',
                            'text-gray-900 dark:text-white',
                            'placeholder-gray-500 dark:placeholder-gray-400',
                            'transition-all max-h-32 overflow-y-auto',
                            disabled && 'opacity-50 cursor-not-allowed'
                        )}
                    />
                </div>

                {/* Attachment Button - placeholder */}
                <button
                    type="button"
                    disabled={disabled}
                    className={cn(
                        'flex-shrink-0 p-2 rounded-lg',
                        'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
                        'hover:bg-gray-100 dark:hover:bg-gray-700',
                        'transition-colors',
                        disabled && 'opacity-50 cursor-not-allowed'
                    )}
                    title="Anexar arquivo"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                        />
                    </svg>
                </button>

                {/* Send Button */}
                <button
                    type="button"
                    onClick={handleSend}
                    disabled={!message.trim() || disabled}
                    className={cn(
                        'flex-shrink-0 p-3 rounded-lg',
                        'bg-primary-600 hover:bg-primary-700 active:bg-primary-800',
                        'text-white transition-colors',
                        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-600'
                    )}
                    title="Enviar mensagem"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                    </svg>
                </button>
            </div>

            {/* Hint */}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 px-1">
                Pressione <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-gray-200 dark:bg-gray-700 rounded">Enter</kbd> para enviar,{' '}
                <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-gray-200 dark:bg-gray-700 rounded">Shift + Enter</kbd> para nova linha
            </p>
        </div>
    );
}
