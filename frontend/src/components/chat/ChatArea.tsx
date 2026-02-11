'use client';

import { useEffect, useRef, useState } from 'react';
import { Message, MessageProps } from './Message';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { Avatar, Badge } from '../ui';
import { cn } from '@/lib/utils/cn';
import { groupMessagesByDate } from '@/lib/utils/dateUtils';

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
    const [messages, setMessages] = useState<MessageProps[]>(mockMessages);
    const [isTyping, setIsTyping] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

    // Auto-scroll to bottom on new messages
    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    useEffect(() => {
        if (shouldAutoScroll) {
            scrollToBottom();
        }
    }, [messages, shouldAutoScroll]);

    // Check if user is near bottom to enable/disable auto-scroll
    const handleScroll = () => {
        if (!messagesContainerRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        setShouldAutoScroll(isNearBottom);
    };

    const handleSendMessage = async (content: string) => {
        if (!content.trim() || isSending) return;

        setIsSending(true);

        // Optimistic update - add message immediately
        const newMessage: MessageProps = {
            id: `temp-${Date.now()}`,
            content,
            senderId: '1',
            senderName: 'Você',
            senderUsername: 'voce',
            senderAvatar: undefined,
            createdAt: new Date(),
            isOwn: true,
            status: 'sending',
        };

        setMessages((prev) => [...prev, newMessage]);

        // Simulate API call
        setTimeout(() => {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === newMessage.id ? { ...msg, status: 'sent' as const } : msg
                )
            );
            setIsSending(false);
        }, 1000);

        // TODO: Replace with actual API call
        // await sendMessage(conversationId, content);
    };

    const handleTyping = () => {
        // TODO: Emit typing event via WebSocket
        // socket.emit('typing', { conversationId });
    };

    // Group messages by date
    const groupedMessages = groupMessagesByDate(messages);

    // Simulate typing indicator (for demo)
    useEffect(() => {
        const timeout = setTimeout(() => {
            setIsTyping(false);
        }, 3000);

        return () => clearTimeout(timeout);
    }, [isTyping]);

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
