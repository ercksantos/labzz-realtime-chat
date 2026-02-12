'use client';

import { useState, useEffect, useCallback } from 'react';
import { chatService, type Message } from '@/services/chat.service';
import { Input, Loading, Button } from '../ui';
import { formatRelativeTime } from '@/lib/utils/dateUtils';

interface MessageSearchProps {
    conversationId?: string;
    onClose: () => void;
    onSelectMessage?: (message: Message) => void;
}

export function MessageSearch({ conversationId, onClose, onSelectMessage }: MessageSearchProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(null);

    const performSearch = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const data = await chatService.searchMessages({
                query: searchQuery,
                conversationId,
                limit: 20,
            });

            setResults(data.messages);
        } catch (err: any) {
            console.error('MessageSearch: Erro ao buscar mensagens', err);
            setError(err.response?.data?.message || 'Erro ao buscar mensagens');
        } finally {
            setIsLoading(false);
        }
    }, [conversationId]);

    // Busca com debounce
    useEffect(() => {
        if (searchDebounce) {
            clearTimeout(searchDebounce);
        }

        if (query) {
            const timeout = setTimeout(() => {
                performSearch(query);
            }, 500);

            setSearchDebounce(timeout);
        } else {
            setResults([]);
        }

        return () => {
            if (searchDebounce) {
                clearTimeout(searchDebounce);
            }
        };
    }, [query]);

    const handleSelectMessage = (message: Message) => {
        if (onSelectMessage) {
            onSelectMessage(message);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-20">
            <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl w-full max-w-2xl mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Buscar mensagens
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <svg
                            className="w-5 h-5 text-gray-600 dark:text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Search Input */}
                <div className="p-4">
                    <Input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Buscar mensagens..."
                        autoFocus
                    />
                </div>

                {/* Results */}
                <div className="p-4 max-h-96 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loading size="md" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-8">
                            <p className="text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="space-y-2">
                            {results.map((message) => (
                                <button
                                    key={message.id}
                                    onClick={() => handleSelectMessage(message)}
                                    className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm text-gray-900 dark:text-white">
                                                {message.sender.name}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                                {message.content}
                                            </p>
                                        </div>
                                        <span className="text-xs text-gray-500 dark:text-gray-500 flex-shrink-0">
                                            {formatRelativeTime(new Date(message.createdAt))}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : query ? (
                        <div className="text-center py-8">
                            <svg
                                className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                            <p className="text-gray-600 dark:text-gray-400">
                                Nenhuma mensagem encontrada
                            </p>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <svg
                                className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                            <p className="text-gray-600 dark:text-gray-400">
                                Digite para buscar mensagens
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
