import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { ChatService } from '../../services/chat.service';
import prisma from '../../config/database';

jest.mock('../../config/database');
jest.mock('../../services/cache.service');

describe('ChatService', () => {
  let chatService: ChatService;

  beforeEach(() => {
    chatService = new ChatService();
    jest.clearAllMocks();
  });

  describe('getUserConversations', () => {
    it('deve retornar conversas do usuário', async () => {
      const mockConversations = [
        {
          id: 'conv-1',
          name: null,
          isGroup: false,
          createdAt: new Date(),
          lastMessageAt: new Date(),
        },
      ];

      (prisma.conversation.findMany as any).mockResolvedValue(mockConversations);

      const result = await chatService.getUserConversations('user-1');

      expect(result).toBeDefined();
      expect(prisma.conversation.findMany).toHaveBeenCalled();
    });
  });
});
