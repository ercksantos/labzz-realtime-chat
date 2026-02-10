import { Router } from 'express';
import { chatController } from '../controllers/chat.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Conversas
router.post('/conversations', chatController.createConversation.bind(chatController));
router.get('/conversations', chatController.getUserConversations.bind(chatController));
router.delete(
    '/conversations/:conversationId',
    chatController.deleteConversation.bind(chatController),
);

// Mensagens
router.get(
    '/conversations/:conversationId/messages',
    chatController.getConversationMessages.bind(chatController),
);

export default router;
