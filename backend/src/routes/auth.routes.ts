import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { authLimiter } from '../middlewares/rateLimiter';

const router = Router();

// Public routes
router.post('/register', authLimiter, authController.register.bind(authController));
router.post('/login', authLimiter, authController.login.bind(authController));
router.post('/refresh', authController.refreshToken.bind(authController));
router.post('/logout', authController.logout.bind(authController));

// Protected routes
router.get('/me', authMiddleware, authController.getMe.bind(authController));

export default router;
