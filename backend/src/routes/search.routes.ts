import { Router } from 'express';
import { searchController } from '../controllers/search.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Todas as rotas de busca requerem autenticação
router.use(authMiddleware);

// GET /api/search/messages?query=texto&conversationId=uuid&sortBy=date&page=1&limit=20
router.get('/messages', searchController.searchMessages);

// GET /api/search/users?query=nome&page=1&limit=20
router.get('/users', searchController.searchUsers);

export default router;
