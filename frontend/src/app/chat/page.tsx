'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChatLayout } from '@/components/chat/ChatLayout';
import { ChatArea } from '@/components/chat/ChatArea';
import { chatService, type Conversation } from '@/services/chat.service';

export default function ChatPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);

    const loadConversations = useCallback(async () => {
        try {
            setIsLoadingConversations(true);
            const data = await chatService.getConversations();
            setConversations(data);
        } catch (err) {
            console.error('ChatPage: Erro ao carregar conversas', err);
        } finally {
            setIsLoadingConversations(false);
        }
    }, []);

    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    const handleSelectConversation = useCallback((conversation: Conversation) => {
        setSelectedConversation(conversation);
    }, []);

    const handleConversationCreated = useCallback((conversation: Conversation) => {
        setConversations((prev) => [conversation, ...prev]);
        setSelectedConversation(conversation);
    }, []);

    // Extrair nome e avatar do outro participante (conversa direta)
    const getConversationDisplay = (conv: Conversation) => {
        if (!conv) return { name: '', avatar: undefined, isOnline: false };
        const otherParticipant = conv.participants?.find((p) => p.id !== selectedConversation?.participants?.[0]?.id);
        return {
            name: otherParticipant?.name || conv.participants?.[0]?.name || 'Conversa',
            avatar: otherParticipant?.avatar || undefined,
            isOnline: otherParticipant?.isOnline || false,
        };
    };

    const display = selectedConversation ? getConversationDisplay(selectedConversation) : null;

    return (
        <ChatLayout
            conversations={conversations}
            selectedConversationId={selectedConversation?.id}
            onSelectConversation={handleSelectConversation}
            onConversationCreated={handleConversationCreated}
            isLoadingConversations={isLoadingConversations}
        >
            {selectedConversation ? (
                <ChatArea
                    conversationId={selectedConversation.id}
                    conversationName={display?.name}
                    conversationAvatar={display?.avatar}
                    isOnline={display?.isOnline}
                />
            ) : (
                <div className="flex flex-col items-center justify-center h-full bg-gray-50 dark:bg-dark-bg">
                    <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                        <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Selecione uma conversa
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
                        Escolha uma conversa na barra lateral ou inicie uma nova conversa.
                    </p>
                </div>
            )}
        </ChatLayout>
    );
}
