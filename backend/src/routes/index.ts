import { Router } from 'express';
import authRoutes from './auth.routes';
import twoFactorRoutes from './twoFactor.routes';
import oauthRoutes from './oauth.routes';
import userRoutes from './user.routes';
import chatRoutes from './chat.routes';
import searchRoutes from './search.routes';
import cacheRoutes from './cache.routes';
import queueRoutes from './queue.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/2fa', twoFactorRoutes);
router.use('/oauth', oauthRoutes);
router.use('/users', userRoutes);
router.use('/chat', chatRoutes);
router.use('/search', searchRoutes);
router.use('/cache', cacheRoutes);
router.use('/queue', queueRoutes);

router.get('/', (_req, res) => {
    res.json({
        message: 'Labzz Chat API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            chat: '/api/chat',
            search: '/api/search',
            cache: '/api/cache',
            queue: '/api/queue',
            health: '/health',
        },
    });
});

export default router;
