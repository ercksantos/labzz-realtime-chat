'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { chatService, type Message, type PaginatedMessages } from '@/services/chat.service';

interface UseMessagesOptions {
    conversationId: string | undefined;
    initialPage?: number;
    limit?: number;
}

export function useMessages({ conversationId, initialPage = 1, limit = 50 }: UseMessagesOptions) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [hasMore, setHasMore] = useState(true);
    const [total, setTotal] = useState(0);
    const isFetchingRef = useRef(false);

    // Load initial messages
    const loadMessages = useCallback(async () => {
        if (!conversationId || isLoading || isFetchingRef.current) return;

        isFetchingRef.current = true;
        setIsLoading(true);
        setError(null);

        try {
            const data: PaginatedMessages = await chatService.getMessages(conversationId, 1, limit);
            setMessages(data.messages);
            setTotal(data.pagination.total);
            setHasMore(data.pagination.hasMore);
            setCurrentPage(1);
        } catch (err: any) {
            console.error('useMessages: Erro ao carregar mensagens', err);
            setError(err.response?.data?.message || 'Erro ao carregar mensagens');
        } finally {
            setIsLoading(false);
            isFetchingRef.current = false;
        }
    }, [conversationId, limit, isLoading]);

    // Load more messages (pagination)
    const loadMore = useCallback(async () => {
        if (!conversationId || !hasMore || isLoadingMore || isFetchingRef.current) return;

        isFetchingRef.current = true;
        setIsLoadingMore(true);
        setError(null);

        try {
            const nextPage = currentPage + 1;
            const data: PaginatedMessages = await chatService.getMessages(conversationId, nextPage, limit);

            // Prepend older messages
            setMessages((prev) => [...data.messages, ...prev]);
            setTotal(data.pagination.total);
            setHasMore(data.pagination.hasMore);
            setCurrentPage(nextPage);
        } catch (err: any) {
            console.error('useMessages: Erro ao carregar mais mensagens', err);
            setError(err.response?.data?.message || 'Erro ao carregar mais mensagens');
        } finally {
            setIsLoadingMore(false);
            isFetchingRef.current = false;
        }
    }, [conversationId, currentPage, hasMore, isLoadingMore, limit]);

    // Add a new message to the list
    const addMessage = useCallback((message: Message) => {
        setMessages((prev) => {
            // Check for duplicates
            if (prev.some((msg) => msg.id === message.id)) {
                return prev;
            }
            return [...prev, message];
        });
        setTotal((prev) => prev + 1);
    }, []);

    // Update a message
    const updateMessage = useCallback((messageId: string, updates: Partial<Message>) => {
        setMessages((prev) =>
            prev.map((msg) => (msg.id === messageId ? { ...msg, ...updates } : msg))
        );
    }, []);

    // Remove a message
    const removeMessage = useCallback((messageId: string) => {
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
        setTotal((prev) => Math.max(0, prev - 1));
    }, []);

    // Replace temporary message with real one
    const replaceTemporaryMessage = useCallback((tempId: string, newMessage: Message) => {
        setMessages((prev) =>
            prev.map((msg) => (msg.id === tempId ? newMessage : msg))
        );
    }, []);

    // Clear all messages
    const clearMessages = useCallback(() => {
        setMessages([]);
        setTotal(0);
        setCurrentPage(initialPage);
        setHasMore(true);
        setError(null);
    }, [initialPage]);

    // Load messages when conversation changes
    useEffect(() => {
        if (conversationId) {
            clearMessages();
            loadMessages();
        }
    }, [conversationId]); // Only run when conversationId changes

    return {
        messages,
        isLoading,
        isLoadingMore,
        error,
        hasMore,
        total,
        currentPage,
        loadMessages,
        loadMore,
        addMessage,
        updateMessage,
        removeMessage,
        replaceTemporaryMessage,
        clearMessages,
    };
}
