import { Socket } from 'socket.io';
import { jwtService } from '../utils/jwt';
import logger from '../utils/logger';

export interface AuthenticatedSocket extends Socket {
    userId?: string;
    username?: string;
}

export const socketAuthMiddleware = async (
    socket: AuthenticatedSocket,
    next: (err?: Error) => void,
) => {
    try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

        if (!token) {
            return next(new Error('Authentication error: Token not provided'));
        }

        const decoded = jwtService.verifyAccessToken(token);
        socket.userId = decoded.userId;
        socket.username = decoded.username;

        logger.info(`Socket authenticated: ${socket.userId}`);
        next();
    } catch (error) {
        logger.error('Socket authentication failed:', error);
        next(new Error('Authentication error: Invalid token'));
    }
};
