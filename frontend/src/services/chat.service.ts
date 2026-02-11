import { apiClient } from '@/lib/api/client';

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    sender: {
        id: string;
        username: string;
        name: string;
        avatar: string | null;
    };
}

export interface Conversation {
    id: string;
    participants: Array<{
        id: string;
        username: string;
        name: string;
        avatar: string | null;
        isOnline: boolean;
    }>;
    lastMessage?: {
        id: string;
        content: string;
        senderId: string;
        createdAt: string;
    };
    unreadCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface PaginatedMessages {
    messages: Message[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        hasMore: boolean;
    };
}

export interface SearchMessagesParams {
    conversationId?: string;
    query: string;
    page?: number;
    limit?: number;
}

export interface SearchUsersParams {
    query: string;
    page?: number;
    limit?: number;
}

export const chatService = {
    // Get all conversations for current user
    async getConversations() {
        const response = await apiClient.get<{ status: string; data: { conversations: Conversation[] } }>(
            '/chat/conversations'
        );
        return response.data.data.conversations;
    },

    // Get conversation by ID
    async getConversation(conversationId: string) {
        const response = await apiClient.get<{ status: string; data: { conversation: Conversation } }>(
            `/chat/conversations/${conversationId}`
        );
        return response.data.data.conversation;
    },

    // Get messages for a conversation with pagination
    async getMessages(conversationId: string, page: number = 1, limit: number = 50): Promise<PaginatedMessages> {
        const response = await apiClient.get<{ status: string; data: PaginatedMessages }>(
            `/chat/conversations/${conversationId}/messages`,
            {
                params: { page, limit },
            }
        );
        return response.data.data;
    },

    // Send a new message
    async sendMessage(conversationId: string, content: string) {
        const response = await apiClient.post<{ status: string; data: { message: Message } }>(
            `/chat/conversations/${conversationId}/messages`,
            { content }
        );
        return response.data.data.message;
    },

    // Mark messages as read
    async markAsRead(conversationId: string) {
        const response = await apiClient.post<{ status: string }>(
            `/chat/conversations/${conversationId}/read`
        );
        return response.data;
    },

    // Search messages
    async searchMessages(params: SearchMessagesParams) {
        const response = await apiClient.get<{ status: string; data: { messages: Message[]; total: number } }>(
            '/chat/search/messages',
            { params }
        );
        return response.data.data;
    },

    // Search users
    async searchUsers(params: SearchUsersParams) {
        const response = await apiClient.get<{
            status: string;
            data: {
                users: Array<{
                    id: string;
                    username: string;
                    name: string;
                    avatar: string | null;
                    isOnline: boolean;
                }>;
                total: number;
            };
        }>('/chat/search/users', { params });
        return response.data.data;
    },

    // Create a new conversation
    async createConversation(participantIds: string[]) {
        const response = await apiClient.post<{ status: string; data: { conversation: Conversation } }>(
            '/chat/conversations',
            { participantIds }
        );
        return response.data.data.conversation;
    },

    // Delete a conversation
    async deleteConversation(conversationId: string) {
        const response = await apiClient.delete<{ status: string }>(
            `/chat/conversations/${conversationId}`
        );
        return response.data;
    },
};
