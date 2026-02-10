import { Router } from 'express';
import { oauthController } from '../controllers/oauth.controller';

const router = Router();

router.get('/google', oauthController.googleAuth.bind(oauthController));
router.get('/google/callback', oauthController.googleCallback.bind(oauthController));
router.get('/github', oauthController.githubAuth.bind(oauthController));
router.get('/github/callback', oauthController.githubCallback.bind(oauthController));

export default router;
