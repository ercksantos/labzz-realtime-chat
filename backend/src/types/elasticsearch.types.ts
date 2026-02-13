// Tipos para documentos indexados no Elasticsearch

export interface MessageDocument {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderUsername: string;
  conversationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDocument {
  id: string;
  email: string;
  username: string;
  name: string;
  avatar: string | null;
  isOnline: boolean;
  createdAt: Date;
}

export interface SearchResult<T> {
  total: number;
  hits: Array<{
    id: string;
    score: number;
    source: T;
  }>;
}

export interface SearchMessagesParams {
  query: string;
  conversationId?: string;
  senderId?: string;
  from?: number;
  size?: number;
  sortBy?: 'relevance' | 'date';
}

export interface SearchUsersParams {
  query: string;
  from?: number;
  size?: number;
}
