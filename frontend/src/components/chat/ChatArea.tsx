'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Message, MessageProps } from './Message';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { Avatar } from '../ui';
import { cn } from '@/lib/utils/cn';
import { groupMessagesByDate } from '@/lib/utils/dateUtils';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';

// Mock data - será substituído por dados reais do backend
const mockMessages: MessageProps[] = [
    {
        id: '1',
        content: 'Oi! Como você está?',
        senderId: '2',
        senderName: 'João Silva',
        senderUsername: 'joaosilva',
        senderAvatar: undefined,
        createdAt: new Date(Date.now() - 86400000), // Yesterday
        isOwn: false,
        status: 'read',
    },
    {
        id: '2',
        content: 'Estou bem, obrigado! E você?',
        senderId: '1',
        senderName: 'Você',
        senderUsername: 'voce',
        senderAvatar: undefined,
        createdAt: new Date(Date.now() - 86400000 + 60000),
        isOwn: true,
        status: 'read',
    },
    {
        id: '3',
        content: 'Também estou bem! Viu o projeto que enviei ontem?',
        senderId: '2',
        senderName: 'João Silva',
        senderUsername: 'joaosilva',
        senderAvatar: undefined,
        createdAt: new Date(Date.now() - 3600000), // 1 hour ago
        isOwn: false,
        status: 'read',
    },
    {
        id: '4',
        content: 'Vi sim! Ficou muito bom. Só preciso revisar alguns detalhes e te retorno.',
        senderId: '1',
        senderName: 'Você',
        senderUsername: 'voce',
        senderAvatar: undefined,
        createdAt: new Date(Date.now() - 3000000),
        isOwn: true,
        status: 'read',
    },
    {
        id: '5',
        content: 'Perfeito! Fico no aguardo então.',
        senderId: '2',
        senderName: 'João Silva',
        senderUsername: 'joaosilva',
        senderAvatar: undefined,
        createdAt: new Date(Date.now() - 1800000),
        isOwn: false,
        status: 'read',
    },
];

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
    const [messages, setMessages] = useState<MessageProps[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const { socket, isConnected, emit, on, off } = useSocket();
    const { user } = useAuth();

    // Auto-scroll to bottom on new messages
    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    useEffect(() => {
        if (shouldAutoScroll) {
            scrollToBottom();
        }
    }, [messages, shouldAutoScroll]);

    // Socket: Load conversation messages on mount
    useEffect(() => {
        if (!conversationId || !isConnected) return;

        console.log('ChatArea: Solicitando mensagens da conversa', conversationId);
        emit('conversation:join', { conversationId });

        // TODO: Load message history from API
        // For now, using mock data
        setMessages(mockMessages);

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

            const newMessage: MessageProps = {
                id: data.id || data.messageId,
                content: data.content || data.message,
                senderId: data.senderId || data.userId,
                senderName: data.senderName || data.user?.name || 'Usuário',
                senderUsername: data.senderUsername || data.user?.username || 'user',
                senderAvatar: data.senderAvatar || data.user?.avatar,
                createdAt: new Date(data.createdAt || Date.now()),
                isOwn: data.senderId === user?.id,
                status: 'delivered',
            };

            setMessages((prev) => {
                // Avoid duplicates
                if (prev.some((msg) => msg.id === newMessage.id)) {
                    return prev;
                }
                return [...prev, newMessage];
            });

            // Update message status to sent if it was our message
            if (newMessage.isOwn) {
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id.startsWith('temp-') && msg.content === newMessage.content
                            ? { ...msg, id: newMessage.id, status: 'sent' }
                            : msg
                    )
                );
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

        const handleMessageDelivered = (data: any) => {
            console.log('ChatArea: Mensagem entregue', data);
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === data.messageId
                        ? { ...msg, status: 'delivered' as const }
                        : msg
                )
            );
        };

        const handleMessageRead = (data: any) => {
            console.log('ChatArea: Mensagem lida', data);
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === data.messageId
                        ? { ...msg, status: 'read' as const }
                        : msg
                )
            );
        };

        // Register socket listeners
        on('message:new', handleNewMessage);
        on('typing:start', handleTypingStart);
        on('typing:stop', handleTypingStop);
        on('message:delivered', handleMessageDelivered);
        on('message:read', handleMessageRead);

        return () => {
            // Cleanup listeners
            off('message:new', handleNewMessage);
            off('typing:start', handleTypingStart);
            off('typing:stop', handleTypingStop);
            off('message:delivered', handleMessageDelivered);
            off('message:read', handleMessageRead);

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [isConnected, user, on, off]);

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

        // Optimistic update - add message immediately
        const tempId = `temp-${Date.now()}`;
        const newMessage: MessageProps = {
            id: tempId,
            content,
            senderId: user?.id || '1',
            senderName: user?.name || 'Você',
            senderUsername: user?.username || 'voce',
            senderAvatar: user?.avatar || undefined,
            createdAt: new Date(),
            isOwn: true,
            status: 'sending',
        };

        setMessages((prev) => [...prev, newMessage]);

        // Send via WebSocket if connected
        if (isConnected && socket) {
            console.log('ChatArea: Enviando mensagem via socket', { conversationId, content });

            emit('message:send', {
                conversationId,
                content,
                tempId, // Para identificar a mensagem temporária
            });

            // Message will be updated when we receive confirmation from server
            setIsSending(false);
        } else {
            console.warn('ChatArea: Socket não conectado, mensagem não enviada');

            // Simulate error
            setTimeout(() => {
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === tempId ? { ...msg, status: 'error' as const } : msg
                    )
                );
                setIsSending(false);
            }, 1000);
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
                {groupedMessages.size === 0 ? (
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
                    Array.from(groupedMessages.entries()).map(([date, msgs]) => (
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
                    ))
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
        </div>
    );
}
