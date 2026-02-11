'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Message, MessageProps } from './Message';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { MessageSearch } from './MessageSearch';
import { Avatar, Loading } from '../ui';
import { cn } from '@/lib/utils/cn';
import { groupMessagesByDate } from '@/lib/utils/dateUtils';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';
import { useMessages } from '@/hooks/useMessages';
import { useNotifications } from '@/hooks/useNotifications';
import type { Message as APIMessage } from '@/services/chat.service';

interface ChatAreaProps {
    conversationId?: string;
    conversationName?: string;
    conversationAvatar?: string;
    isOnline?: boolean;
}

export function ChatArea({
    conversationId,
    conversationName = 'João Silva',
    conversationAvatar,
    isOnline = true,
}: ChatAreaProps) {
    const [isTyping, setIsTyping] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const loadMoreTriggerRef = useRef<HTMLDivElement>(null);
    const [showMessageSearch, setShowMessageSearch] = useState(false);

    const { socket, isConnected, emit, on, off } = useSocket();
    const { user } = useAuth();

    // Enable notifications
    useNotifications();

    // Use the messages hook for pagination
    const {
        messages: apiMessages,
        isLoading,
        isLoadingMore,
        hasMore,
        loadMore,
        addMessage: addApiMessage,
        replaceTemporaryMessage,
    } = useMessages({ conversationId });

    // Convert API messages to MessageProps format
    const messages: MessageProps[] = apiMessages.map((msg: APIMessage) => ({
        id: msg.id,
        content: msg.content,
        senderId: msg.senderId,
        senderName: msg.sender.name,
        senderUsername: msg.sender.username,
        senderAvatar: msg.sender.avatar || undefined,
        createdAt: new Date(msg.createdAt),
        isOwn: msg.senderId === user?.id,
        status: 'read' as const,
    }));

    // Auto-scroll to bottom on new messages
    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    useEffect(() => {
        if (shouldAutoScroll) {
            scrollToBottom();
        }
    }, [messages, shouldAutoScroll]);

    // Intersection Observer for infinite scroll (load more on scroll to top)
    useEffect(() => {
        if (!loadMoreTriggerRef.current || !hasMore || isLoadingMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
                    console.log('ChatArea: Carregando mais mensagens (scroll to top)');
                    loadMore();
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(loadMoreTriggerRef.current);

        return () => {
            observer.disconnect();
        };
    }, [hasMore, isLoadingMore, loadMore]);

    // Socket: Join/leave conversation
    useEffect(() => {
        if (!conversationId || !isConnected) return;

        console.log('ChatArea: Entrando na conversa', conversationId);
        emit('conversation:join', { conversationId });

        return () => {
            console.log('ChatArea: Saindo da conversa', conversationId);
            emit('conversation:leave', { conversationId });
        };
    }, [conversationId, isConnected, emit]);

    // Socket: Listen for incoming messages
    useEffect(() => {
        if (!isConnected) return;

        const handleNewMessage = (data: any) => {
            console.log('ChatArea: Nova mensagem recebida', data);

            const apiMessage: APIMessage = {
                id: data.id || data.messageId,
                conversationId: conversationId || '',
                senderId: data.senderId || data.userId,
                content: data.content || data.message,
                createdAt: data.createdAt || new Date().toISOString(),
                updatedAt: data.updatedAt || new Date().toISOString(),
                sender: {
                    id: data.senderId || data.userId,
                    username: data.senderUsername || data.user?.username || 'user',
                    name: data.senderName || data.user?.name || 'Usuário',
                    avatar: data.senderAvatar || data.user?.avatar || null,
                },
            };

            // Add to messages list
            addApiMessage(apiMessage);

            // If it's our message and had a temporary ID, replace it
            if (data.tempId && data.senderId === user?.id) {
                replaceTemporaryMessage(data.tempId, apiMessage);
            }
        };

        const handleTypingStart = (data: any) => {
            console.log('ChatArea: Usuário digitando', data);
            if (data.userId !== user?.id) {
                setIsTyping(true);

                // Clear existing timeout
                if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                }

                // Set new timeout to hide typing indicator
                typingTimeoutRef.current = setTimeout(() => {
                    setIsTyping(false);
                }, 3000);
            }
        };

        const handleTypingStop = (data: any) => {
            console.log('ChatArea: Usuário parou de digitando', data);
            if (data.userId !== user?.id) {
                setIsTyping(false);
                if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                }
            }
        };

        // Register socket listeners
        on('message:new', handleNewMessage);
        on('typing:start', handleTypingStart);
        on('typing:stop', handleTypingStop);

        return () => {
            // Cleanup listeners
            off('message:new', handleNewMessage);
            off('typing:start', handleTypingStart);
            off('typing:stop', handleTypingStop);

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [isConnected, user, on, off, addApiMessage, replaceTemporaryMessage, conversationId]);

    // Check if user is near bottom to enable/disable auto-scroll
    const handleScroll = () => {
        if (!messagesContainerRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        setShouldAutoScroll(isNearBottom);
    };

    const handleSendMessage = async (content: string) => {
        if (!content.trim() || isSending || !conversationId) return;

        setIsSending(true);

        // Create temporary message for optimistic update
        const tempId = `temp-${Date.now()}`;
        const tempMessage: APIMessage = {
            id: tempId,
            conversationId,
            senderId: user?.id || '',
            content,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            sender: {
                id: user?.id || '',
                username: user?.username || 'voce',
                name: user?.name || 'Você',
                avatar: user?.avatar || null,
            },
        };

        // Add temporary message immediately
        addApiMessage(tempMessage);

        // Send via WebSocket if connected
        if (isConnected && socket) {
            console.log('ChatArea: Enviando mensagem via socket', { conversationId, content });

            emit('message:send', {
                conversationId,
                content,
                tempId, // Para identificar a mensagem temporária
            });

            setIsSending(false);
        } else {
            console.warn('ChatArea: Socket não conectado, mensagem não enviada');
            setIsSending(false);
        }
    };

    const handleTyping = useCallback(() => {
        if (!conversationId || !isConnected) return;

        console.log('ChatArea: Emitindo evento de digitação');
        emit('typing:start', { conversationId });

        // Stop typing after 2 seconds of inactivity
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            emit('typing:stop', { conversationId });
        }, 2000);
    }, [conversationId, isConnected, emit]);

    // Group messages by date
    const groupedMessages = groupMessagesByDate(messages);

    // Display connection status (for debugging)
    useEffect(() => {
        console.log('ChatArea: Socket conectado?', isConnected);
    }, [isConnected]);

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-dark-bg">
            {/* Chat Header */}
            <div className="bg-white dark:bg-dark-card border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Avatar src={conversationAvatar} alt={conversationName} size="md" />
                            {isOnline && (
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-dark-card rounded-full" />
                            )}
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-900 dark:text-white">
                                {conversationName}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {isOnline ? 'Online' : 'Offline'}
                                {!isConnected && (
                                    <span className="ml-2 text-red-500">
                                        • Desconectado
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowMessageSearch(true)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="Buscar mensagens"
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
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </button>

                        <button
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="Mais opções"
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
                                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
            >
                {/* Loading initial messages */}
                {isLoading && messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <Loading size="lg" />
                        <p className="mt-4 text-gray-600 dark:text-gray-400">
                            Carregando mensagens...
                        </p>
                    </div>
                ) : groupedMessages.size === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                            <svg
                                className="w-10 h-10 text-gray-400 dark:text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                            </svg>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                            Nenhuma mensagem ainda. Envie a primeira!
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Load more trigger (at the top) */}
                        {hasMore && (
                            <div ref={loadMoreTriggerRef} className="flex justify-center py-4">
                                {isLoadingMore && (
                                    <div className="flex items-center gap-2">
                                        <Loading size="sm" />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Carregando mais mensagens...
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Messages grouped by date */}
                        {Array.from(groupedMessages.entries()).map(([date, msgs]) => (
                            <div key={date}>
                                {/* Date Separator */}
                                <div className="flex items-center justify-center my-6">
                                    <div className="bg-gray-200 dark:bg-gray-700 px-4 py-1 rounded-full">
                                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                            {date}
                                        </span>
                                    </div>
                                </div>

                                {/* Messages */}
                                {msgs.map((message) => (
                                    <Message key={message.id} {...message} />
                                ))}
                            </div>
                        ))}
                    </>
                )}

                {/* Typing Indicator */}
                {isTyping && <TypingIndicator userName={conversationName} />}

                {/* Scroll anchor */}
                <div ref={messagesEndRef} />
            </div>

            {/* Scroll to Bottom Button */}
            {!shouldAutoScroll && (
                <div className="absolute bottom-24 right-8">
                    <button
                        onClick={() => {
                            setShouldAutoScroll(true);
                            scrollToBottom();
                        }}
                        className="p-3 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-full shadow-lg hover:shadow-xl transition-all"
                        title="Rolar para o final"
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
                                d="M19 14l-7 7m0 0l-7-7m7 7V3"
                            />
                        </svg>
                    </button>
                </div>
            )}

            {/* Message Input */}
            <MessageInput
                onSendMessage={handleSendMessage}
                onTyping={handleTyping}
                disabled={isSending}
            />

            {/* Message Search Modal */}
            {showMessageSearch && (
                <MessageSearch
                    conversationId={conversationId}
                    onClose={() => setShowMessageSearch(false)}
                    onSelectMessage={(message) => {
                        console.log('ChatArea: Mensagem selecionada na busca', message);
                        // TODO: Scroll to selected message
                        setShowMessageSearch(false);
                    }}
                />
            )}
        </div>
    );
}
