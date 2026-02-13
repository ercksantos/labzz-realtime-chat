import { Router } from 'express';
import { twoFactorController } from '../controllers/twoFactor.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get(
  '/generate',
  authMiddleware,
  twoFactorController.generateSecret.bind(twoFactorController),
);
router.post('/enable', authMiddleware, twoFactorController.enable2FA.bind(twoFactorController));
router.post('/disable', authMiddleware, twoFactorController.disable2FA.bind(twoFactorController));

export default router;
