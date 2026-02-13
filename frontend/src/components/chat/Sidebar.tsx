'use client';

import { useState } from 'react';
import { Avatar, Badge } from '../ui';
import { UserSearch } from './UserSearch';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '../ui/Skeleton';
import type { Conversation } from '@/services/chat.service';
import { formatRelativeTime } from '@/lib/utils/dateUtils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  selectedConversationId?: string;
  onSelectConversation?: (conversation: Conversation) => void;
  onConversationCreated?: (conversation: Conversation) => void;
  isLoading?: boolean;
}

export function Sidebar({
  isOpen,
  onClose,
  conversations = [],
  selectedConversationId,
  onSelectConversation,
  onConversationCreated,
  isLoading = false,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserSearch, setShowUserSearch] = useState(false);
  const { user } = useAuth();

  // Extrair dados de exibição da conversa
  const getDisplayData = (conv: Conversation) => {
    const other = conv.participants?.find((p) => p.id !== user?.id);
    return {
      name: other?.name || other?.username || 'Conversa',
      username: other?.username || '',
      avatar: other?.avatar || undefined,
      isOnline: other?.isOnline || false,
    };
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const display = getDisplayData(conv);
    return (
      display.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      display.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <>
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-40',
          'w-80 bg-white dark:bg-dark-card',
          'border-r border-gray-200 dark:border-gray-700',
          'flex flex-col transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
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

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                {conversations.length === 0
                  ? 'Nenhuma conversa ainda. Inicie uma nova!'
                  : 'Nenhuma conversa encontrada'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredConversations.map((conversation) => {
                const display = getDisplayData(conversation);
                const lastMsg = conversation.lastMessage;
                const timeStr = lastMsg?.createdAt
                  ? formatRelativeTime(new Date(lastMsg.createdAt))
                  : '';

                return (
                  <button
                    key={conversation.id}
                    onClick={() => onSelectConversation?.(conversation)}
                    className={cn(
                      'w-full p-4 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left',
                      selectedConversationId === conversation.id &&
                        'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-500'
                    )}
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar src={display.avatar} alt={display.name} size="md" />
                      {display.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-dark-card rounded-full" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {display.name}
                        </h3>
                        {timeStr && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                            {timeStr}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {lastMsg?.content || 'Sem mensagens'}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="primary" size="sm">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

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

      {showUserSearch && (
        <UserSearch
          onClose={() => setShowUserSearch(false)}
          onConversationCreated={(conv) => {
            onConversationCreated?.(conv);
            setShowUserSearch(false);
          }}
        />
      )}
    </>
  );
}
