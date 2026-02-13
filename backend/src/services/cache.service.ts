import redisClient from '../config/redis';
import logger from '../utils/logger';

export class CacheService {
  // TTL padrão em segundos
  private readonly DEFAULT_TTL = 3600; // 1 hora
  private readonly SESSION_TTL = 604800; // 7 dias
  private readonly CONVERSATION_TTL = 1800; // 30 minutos
  private readonly USER_ONLINE_TTL = 300; // 5 minutos

  // Prefixos para organizar chaves no Redis
  private readonly PREFIXES = {
    session: 'session:',
    conversation: 'conversation:',
    userConversations: 'user:conversations:',
    userOnline: 'user:online:',
    onlineUsers: 'online:users',
  };

  // ============ MÉTODOS GENÉRICOS ============

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redisClient.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error(`Erro ao buscar cache ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = this.DEFAULT_TTL): Promise<void> {
    try {
      await redisClient.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      logger.error(`Erro ao salvar cache ${key}:`, error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await redisClient.del(key);
    } catch (error) {
      logger.error(`Erro ao deletar cache ${key}:`, error);
    }
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } catch (error) {
      logger.error(`Erro ao deletar padrão ${pattern}:`, error);
    }
  }

  // ============ CACHE DE SESSÕES ============

  async setSession(userId: string, sessionData: any): Promise<void> {
    const key = `${this.PREFIXES.session}${userId}`;
    await this.set(key, sessionData, this.SESSION_TTL);
  }

  async getSession<T>(userId: string): Promise<T | null> {
    const key = `${this.PREFIXES.session}${userId}`;
    return this.get<T>(key);
  }

  async deleteSession(userId: string): Promise<void> {
    const key = `${this.PREFIXES.session}${userId}`;
    await this.del(key);
  }

  // ============ CACHE DE CONVERSAS ============

  async setConversation(conversationId: string, conversationData: any): Promise<void> {
    const key = `${this.PREFIXES.conversation}${conversationId}`;
    await this.set(key, conversationData, this.CONVERSATION_TTL);
  }

  async getConversation<T>(conversationId: string): Promise<T | null> {
    const key = `${this.PREFIXES.conversation}${conversationId}`;
    return this.get<T>(key);
  }

  async deleteConversation(conversationId: string): Promise<void> {
    const key = `${this.PREFIXES.conversation}${conversationId}`;
    await this.del(key);
  }

  // Cache de conversas do usuário
  async setUserConversations(userId: string, conversations: any[]): Promise<void> {
    const key = `${this.PREFIXES.userConversations}${userId}`;
    await this.set(key, conversations, this.CONVERSATION_TTL);
  }

  async getUserConversations<T>(userId: string): Promise<T[] | null> {
    const key = `${this.PREFIXES.userConversations}${userId}`;
    return this.get<T[]>(key);
  }

  async deleteUserConversations(userId: string): Promise<void> {
    const key = `${this.PREFIXES.userConversations}${userId}`;
    await this.del(key);
  }

  // Invalidar cache de todos os participantes de uma conversa
  async invalidateConversationCache(
    conversationId: string,
    participantIds: string[],
  ): Promise<void> {
    await this.deleteConversation(conversationId);

    // Invalidar cache de conversas de cada participante
    for (const userId of participantIds) {
      await this.deleteUserConversations(userId);
    }
  }

  // ============ CACHE DE USUÁRIOS ONLINE ============

  async setUserOnline(userId: string, userData: any): Promise<void> {
    try {
      const key = `${this.PREFIXES.userOnline}${userId}`;
      await this.set(key, userData, this.USER_ONLINE_TTL);

      // Adicionar ao set de usuários online
      await redisClient.sadd(this.PREFIXES.onlineUsers, userId);
    } catch (error) {
      logger.error(`Erro ao marcar usuário ${userId} como online:`, error);
    }
  }

  async setUserOffline(userId: string): Promise<void> {
    try {
      const key = `${this.PREFIXES.userOnline}${userId}`;
      await this.del(key);

      // Remover do set de usuários online
      await redisClient.srem(this.PREFIXES.onlineUsers, userId);
    } catch (error) {
      logger.error(`Erro ao marcar usuário ${userId} como offline:`, error);
    }
  }

  async isUserOnline(userId: string): Promise<boolean> {
    try {
      return (await redisClient.sismember(this.PREFIXES.onlineUsers, userId)) === 1;
    } catch (error) {
      logger.error(`Erro ao verificar se usuário ${userId} está online:`, error);
      return false;
    }
  }

  async getOnlineUsers(): Promise<string[]> {
    try {
      return await redisClient.smembers(this.PREFIXES.onlineUsers);
    } catch (error) {
      logger.error('Erro ao buscar usuários online:', error);
      return [];
    }
  }

  async getOnlineUsersCount(): Promise<number> {
    try {
      return await redisClient.scard(this.PREFIXES.onlineUsers);
    } catch (error) {
      logger.error('Erro ao contar usuários online:', error);
      return 0;
    }
  }

  // ============ ESTRATÉGIA DE INVALIDAÇÃO ============

  // Invalidar caches relacionados a um usuário
  async invalidateUserCache(userId: string): Promise<void> {
    await this.deleteSession(userId);
    await this.deleteUserConversations(userId);
    await this.delPattern(`${this.PREFIXES.userOnline}${userId}*`);
  }

  // Limpar todo o cache (use com cuidado)
  async flushAll(): Promise<void> {
    try {
      await redisClient.flushall();
      logger.warn('⚠️  Todo o cache Redis foi limpo');
    } catch (error) {
      logger.error('Erro ao limpar cache:', error);
    }
  }

  // Verificar saúde do cache
  async healthCheck(): Promise<{ connected: boolean; memory?: string }> {
    try {
      await redisClient.ping();
      const info = await redisClient.info('memory');
      const usedMemory = info.match(/used_memory_human:(.+)/)?.[1]?.trim();

      return {
        connected: true,
        memory: usedMemory,
      };
    } catch (error) {
      return {
        connected: false,
      };
    }
  }
}

export default new CacheService();
