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
  isGroup: boolean;
  name?: string;
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

// Formato recebido do backend (participants aninhados)
interface BackendConversation {
  id: string;
  isGroup: boolean;
  name?: string;
  participants: Array<{
    userId: string;
    user: {
      id: string;
      username: string;
      name: string;
      avatar: string | null;
      isOnline: boolean;
    };
  }>;
  messages?: Array<{
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
    sender: { id: string; username: string; name: string };
  }>;
  createdAt: string;
  updatedAt: string;
}

// Normalizar resposta do backend
function normalizeConversation(raw: BackendConversation): Conversation {
  return {
    id: raw.id,
    isGroup: raw.isGroup,
    name: raw.name,
    participants: raw.participants.map((p) => p.user),
    lastMessage: raw.messages?.[0]
      ? {
          id: raw.messages[0].id,
          content: raw.messages[0].content,
          senderId: raw.messages[0].senderId,
          createdAt: raw.messages[0].createdAt,
        }
      : undefined,
    unreadCount: 0,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export interface PaginatedMessages {
  messages: Message[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages?: number;
    hasMore?: boolean;
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
  // Buscar conversas do usuário
  async getConversations() {
    const response = await apiClient.get<{
      status: string;
      data: { conversations: BackendConversation[] };
    }>('/chat/conversations');
    return response.data.data.conversations.map(normalizeConversation);
  },

  // Buscar conversa por ID
  async getConversation(conversationId: string) {
    const response = await apiClient.get<{
      status: string;
      data: { conversation: BackendConversation };
    }>(`/chat/conversations/${conversationId}`);
    return normalizeConversation(response.data.data.conversation);
  },

  // Buscar mensagens com paginação
  async getMessages(
    conversationId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<PaginatedMessages> {
    const response = await apiClient.get<{ status: string; data: PaginatedMessages }>(
      `/chat/conversations/${conversationId}/messages`,
      {
        params: { page, limit },
      }
    );
    return response.data.data;
  },

  // Enviar mensagem
  async sendMessage(conversationId: string, content: string) {
    const response = await apiClient.post<{ status: string; data: { message: Message } }>(
      `/chat/conversations/${conversationId}/messages`,
      { content }
    );
    return response.data.data.message;
  },

  // Marcar como lidas
  async markAsRead(conversationId: string) {
    const response = await apiClient.post<{ status: string }>(
      `/chat/conversations/${conversationId}/read`
    );
    return response.data;
  },

  // Buscar mensagens
  async searchMessages(params: SearchMessagesParams) {
    const response = await apiClient.get<{
      status: string;
      data: { messages: Message[]; total: number };
    }>('/search/messages', { params });
    return response.data.data;
  },

  // Buscar usuários (via PostgreSQL - /users endpoint)
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
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      };
    }>('/users', { params: { search: params.query, page: params.page, limit: params.limit } });
    return {
      users: response.data.data.users,
      total: response.data.data.pagination.total,
    };
  },

  // Criar nova conversa
  async createConversation(participantIds: string[]) {
    const response = await apiClient.post<{
      status: string;
      data: { conversation: BackendConversation };
    }>('/chat/conversations', { participantIds });
    return normalizeConversation(response.data.data.conversation);
  },

  // Excluir conversa
  async deleteConversation(conversationId: string) {
    const response = await apiClient.delete<{ status: string }>(
      `/chat/conversations/${conversationId}`
    );
    return response.data;
  },
};
