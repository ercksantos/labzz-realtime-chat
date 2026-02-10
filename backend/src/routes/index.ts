import { Router } from 'express';
import authRoutes from './auth.routes';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);

// API info
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
