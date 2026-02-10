import { Router } from 'express';
import authRoutes from './auth.routes';
import twoFactorRoutes from './twoFactor.routes';
import oauthRoutes from './oauth.routes';
import userRoutes from './user.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/2fa', twoFactorRoutes);
router.use('/oauth', oauthRoutes);
router.use('/users', userRoutes);

router.get('/', (_req, res) => {
    res.json({
        message: 'Labzz Chat API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            health: '/health',
        },
    });
});

export default router;
