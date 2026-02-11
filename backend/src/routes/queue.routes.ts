import { Router } from 'express';
import { queueController } from '../controllers/queue.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// GET /api/queue/stats - Obter estatísticas das filas
router.get('/stats', queueController.getStats);

export default router;
