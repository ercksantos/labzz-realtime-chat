import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
} from '../validators/auth.validator';
import { ZodError } from 'zod';
import { AppError } from '../middlewares/errorHandler';
import logger from '../utils/logger';

export class AuthController {
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const validatedData = registerSchema.parse(req.body);
            const user = await authService.register(validatedData);

            logger.info(`New user registered: ${user.email}`);

            res.status(201).json({
                status: 'success',
                data: { user },
            });
        } catch (error) {
            if (error instanceof ZodError) {
                return next(new AppError(error.errors[0].message, 400));
            }
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const validatedData = loginSchema.parse(req.body);
            const result = await authService.login(validatedData);

            logger.info(`User logged in: ${result.user.email}`);

            res.status(200).json({
                status: 'success',
                data: result,
            });
        } catch (error) {
            if (error instanceof ZodError) {
                return next(new AppError(error.errors[0].message, 400));
            }
            next(error);
        }
    }

    async refreshToken(req: Request, res: Response, next: NextFunction) {
        try {
            const validatedData = refreshTokenSchema.parse(req.body);
            const result = await authService.refreshAccessToken(validatedData.refreshToken);

            res.status(200).json({
                status: 'success',
                data: result,
            });
        } catch (error) {
            if (error instanceof ZodError) {
                return next(new AppError(error.errors[0].message, 400));
            }
            next(error);
        }
    }

    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const validatedData = refreshTokenSchema.parse(req.body);
            const result = await authService.logout(validatedData.refreshToken);

            logger.info('User logged out');

            res.status(200).json({
                status: 'success',
                data: result,
            });
        } catch (error) {
            if (error instanceof ZodError) {
                return next(new AppError(error.errors[0].message, 400));
            }
            next(error);
        }
    }

    async getMe(req: Request, res: Response, next: NextFunction) {
        try {
            // @ts-expect-error - userId is set by auth middleware
            const userId = req.userId;
            const user = await authService.getUserById(userId);

            res.status(200).json({
                status: 'success',
                data: { user },
            });
        } catch (error) {
            next(error);
        }
    }
}

export const authController = new AuthController();
