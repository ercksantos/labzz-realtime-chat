'use client';

import { useState } from 'react';
import { Avatar, Badge } from '../ui';
import { UserSearch } from './UserSearch';
import { cn } from '@/lib/utils/cn';

interface Conversation {
    id: string;
    name: string;
    username: string;
    avatar?: string;
    lastMessage?: string;
    lastMessageTime?: string;
    unreadCount?: number;
    isOnline?: boolean;
}

// Mock data - substituir com dados reais
const mockConversations: Conversation[] = [
    {
        id: '1',
        name: 'João Silva',
        username: 'joaosilva',
        lastMessage: 'Oi, tudo bem?',
        lastMessageTime: '10:30',
        unreadCount: 2,
        isOnline: true,
    },
    {
        id: '2',
        name: 'Maria Santos',
        username: 'mariasantos',
        lastMessage: 'Vamos marcar aquela reunião?',
        lastMessageTime: 'Ontem',
        unreadCount: 0,
        isOnline: false,
    },
    {
        id: '3',
        name: 'Pedro Costa',
        username: 'pedrocosta',
        lastMessage: 'Obrigado pela ajuda!',
        lastMessageTime: '15/01',
        unreadCount: 0,
        isOnline: true,
    },
];

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeConversation, setActiveConversation] = useState<string | null>(null);
    const [showUserSearch, setShowUserSearch] = useState(false);

    const filteredConversations = mockConversations.filter(
        (conv) =>
            conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            conv.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            {/* Sidebar Container */}
            <aside
                className={cn(
                    'fixed lg:static inset-y-0 left-0 z-40',
                    'w-80 bg-white dark:bg-dark-card',
                    'border-r border-gray-200 dark:border-gray-700',
                    'flex flex-col transition-transform duration-300',
                    isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                )}
            >
                {/* Sidebar Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Conversas</h2>
                        <button
                            onClick={onClose}
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <svg
                                className="w-5 h-5 text-gray-500 dark:text-gray-400"
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

                    {/* Search Bar */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Buscar conversas..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={cn(
                                'w-full pl-10 pr-4 py-2 rounded-lg',
                                'bg-gray-100 dark:bg-dark-bg',
                                'border border-transparent',
                                'focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
                                'text-gray-900 dark:text-white',
                                'placeholder-gray-500 dark:placeholder-gray-400',
                                'transition-all'
                            )}
                        />
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
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
                    </div>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredConversations.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-gray-500 dark:text-gray-400">Nenhuma conversa encontrada</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredConversations.map((conversation) => (
                                <button
                                    key={conversation.id}
                                    onClick={() => {
                                        setActiveConversation(conversation.id);
                                        onClose();
                                    }}
                                    className={cn(
                                        'w-full p-4 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left',
                                        activeConversation === conversation.id &&
                                        'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-500'
                                    )}
                                >
                                    {/* Avatar with Online Status */}
                                    <div className="relative flex-shrink-0">
                                        <Avatar
                                            src={conversation.avatar}
                                            alt={conversation.name}
                                            size="md"
                                        />
                                        {conversation.isOnline && (
                                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-dark-card rounded-full" />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                                {conversation.name}
                                            </h3>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                                                {conversation.lastMessageTime}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                                {conversation.lastMessage || 'Sem mensagens'}
                                            </p>
                                            {conversation.unreadCount && conversation.unreadCount > 0 && (
                                                <Badge variant="primary" size="sm">
                                                    {conversation.unreadCount}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* New Chat Button */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setShowUserSearch(true)}
                        className={cn(
                            'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg',
                            'bg-primary-600 hover:bg-primary-700 active:bg-primary-800',
                            'text-white font-medium',
                            'transition-colors duration-200'
                        )}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                        Nova Conversa
                    </button>
                </div>
            </aside>

            {/* User Search Modal */}
            {showUserSearch && (
                <UserSearch
                    onClose={() => setShowUserSearch(false)}
                />
            )}
        </>
    );
}
