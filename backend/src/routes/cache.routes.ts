import { Router } from 'express';
import { cacheController } from '../controllers/cache.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// GET /api/cache/online-users - Obter usuários online
router.get('/online-users', cacheController.getOnlineUsers);

// GET /api/cache/health - Verificar saúde do cache
router.get('/health', cacheController.getCacheHealth);

// DELETE /api/cache/flush - Limpar todo o cache
router.delete('/flush', cacheController.flushCache);

export default router;
