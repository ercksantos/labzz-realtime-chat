import { Request, Response, NextFunction } from 'express';
import { oauthService } from '../services/oauth.service';
import { config } from '../config';
import logger from '../utils/logger';

export class OAuthController {
    async googleAuth(_req: Request, res: Response, next: NextFunction) {
        try {
            const url = await oauthService.getGoogleAuthUrl();
            res.redirect(url);
        } catch (error) {
            next(error);
        }
    }

    async googleCallback(req: Request, res: Response, _next: NextFunction) {
        try {
            const { code } = req.query;

            if (!code || typeof code !== 'string') {
                return res.redirect(`${config.frontend.url}/login?error=oauth_failed`);
            }

            const result = await oauthService.authenticateWithGoogle(code);

            logger.info(`User logged in via Google OAuth: ${result.user.email}`);

            const redirectUrl = `${config.frontend.url}/auth/callback?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`;
            res.redirect(redirectUrl);
        } catch (error) {
            logger.error('Google OAuth error:', error);
            res.redirect(`${config.frontend.url}/login?error=oauth_failed`);
        }
    }

    async githubAuth(_req: Request, res: Response, next: NextFunction) {
        try {
            const url = await oauthService.getGitHubAuthUrl();
            res.redirect(url);
        } catch (error) {
            next(error);
        }
    }

    async githubCallback(req: Request, res: Response, _next: NextFunction) {
        try {
            const { code } = req.query;

            if (!code || typeof code !== 'string') {
                return res.redirect(`${config.frontend.url}/login?error=oauth_failed`);
            }

            const result = await oauthService.authenticateWithGitHub(code);

            logger.info(`User logged in via GitHub OAuth: ${result.user.email}`);

            const redirectUrl = `${config.frontend.url}/auth/callback?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`;
            res.redirect(redirectUrl);
        } catch (error) {
            logger.error('GitHub OAuth error:', error);
            res.redirect(`${config.frontend.url}/login?error=oauth_failed`);
        }
    }
}

export const oauthController = new OAuthController();
