'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { chatService } from '@/services/chat.service';
import { Input, Loading, Avatar, Button } from '../ui';

interface UserSearchProps {
    onClose: () => void;
}

export function UserSearch({ onClose }: UserSearchProps) {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<
        Array<{
            id: string;
            username: string;
            name: string;
            avatar: string | null;
            isOnline: boolean;
        }>
    >([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(null);

    const performSearch = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const data = await chatService.searchUsers({
                query: searchQuery,
                limit: 20,
            });

            setResults(data.users);
        } catch (err: any) {
            console.error('UserSearch: Erro ao buscar usuários', err);
            setError(err.response?.data?.message || 'Erro ao buscar usuários');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Debounced search
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

    const toggleUserSelection = (userId: string) => {
        setSelectedUsers((prev) => {
            if (prev.includes(userId)) {
                return prev.filter((id) => id !== userId);
            } else {
                return [...prev, userId];
            }
        });
    };

    const handleCreateConversation = async () => {
        if (selectedUsers.length === 0 || isCreating) return;

        setIsCreating(true);
        setError(null);

        try {
            const conversation = await chatService.createConversation(selectedUsers);
            console.log('UserSearch: Conversa criada', conversation);

            // Navigate to the new conversation
            router.push(`/chat?conversation=${conversation.id}`);
            onClose();
        } catch (err: any) {
            console.error('UserSearch: Erro ao criar conversa', err);
            setError(err.response?.data?.message || 'Erro ao criar conversa');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-20">
            <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl w-full max-w-2xl mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Nova Conversa
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
                        placeholder="Buscar usuários por nome ou username..."
                        autoFocus
                    />
                </div>

                {/* Selected Users */}
                {selectedUsers.length > 0 && (
                    <div className="px-4 pb-2">
                        <div className="flex flex-wrap gap-2">
                            {selectedUsers.map((userId) => {
                                const user = results.find((u) => u.id === userId);
                                if (!user) return null;

                                return (
                                    <div
                                        key={userId}
                                        className="flex items-center gap-2 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full"
                                    >
                                        <span className="text-sm">{user.name}</span>
                                        <button
                                            onClick={() => toggleUserSelection(userId)}
                                            className="hover:text-primary-900 dark:hover:text-primary-100"
                                        >
                                            <svg
                                                className="w-4 h-4"
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
                                );
                            })}
                        </div>
                    </div>
                )}

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
                            {results.map((user) => {
                                const isSelected = selectedUsers.includes(user.id);
                                return (
                                    <button
                                        key={user.id}
                                        onClick={() => toggleUserSelection(user.id)}
                                        className={`w-full text-left p-3 rounded-lg transition-colors ${isSelected
                                            ? 'bg-primary-100 dark:bg-primary-900'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar
                                                src={user.avatar || undefined}
                                                alt={user.name}
                                                size="md"
                                                isOnline={user.isOnline}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm text-gray-900 dark:text-white">
                                                    {user.name}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    @{user.username}
                                                </p>
                                            </div>
                                            {isSelected && (
                                                <svg
                                                    className="w-5 h-5 text-primary-600 dark:text-primary-400"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
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
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                            <p className="text-gray-600 dark:text-gray-400">
                                Nenhum usuário encontrado
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
                                Digite para buscar usuários
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer with Create Button */}
                {selectedUsers.length > 0 && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            onClick={handleCreateConversation}
                            disabled={isCreating}
                            isLoading={isCreating}
                            className="w-full"
                        >
                            Criar Conversa {selectedUsers.length > 1 && `(${selectedUsers.length} pessoas)`}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
