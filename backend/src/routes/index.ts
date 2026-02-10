import { Router } from 'express';
import authRoutes from './auth.routes';
import twoFactorRoutes from './twoFactor.routes';
import oauthRoutes from './oauth.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/2fa', twoFactorRoutes);
router.use('/oauth', oauthRoutes);

router.get('/', (_req, res) => {
    res.json({
        message: 'Labzz Chat API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            health: '/health',
        },
    });
});

export default router;
