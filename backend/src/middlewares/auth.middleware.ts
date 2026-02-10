import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import { jwtService } from '../utils/jwt';

export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('No token provided', 401);
        }

        const token = authHeader.substring(7); // Remove 'Bearer '

        const payload = jwtService.verifyAccessToken(token);

        // Attach user info to request
        // @ts-expect-error - Adding custom properties to Request
        req.userId = payload.userId;
        // @ts-expect-error - Adding custom properties to Request
        req.userEmail = payload.email;
        // @ts-expect-error - Adding custom properties to Request
        req.username = payload.username;

        next();
    } catch (error) {
        if (error instanceof Error) {
            next(new AppError(error.message, 401));
        } else {
            next(new AppError('Authentication failed', 401));
        }
    }
};
