import { Server as HTTPServer } from 'http';
import { Server } from 'socket.io';
import { config } from './index';
import logger from '../utils/logger';
import { socketAuthMiddleware, AuthenticatedSocket } from '../websocket/auth.middleware';
import { registerChatHandlers } from '../websocket/chat.handlers';
import { registerPresenceHandlers } from '../websocket/presence.handlers';

export const initializeSocket = (httpServer: HTTPServer): Server => {
    const io = new Server(httpServer, {
        cors: {
            origin: config.frontend.url,
            credentials: true,
        },
    });

    // Aplicar middleware de autenticação
    io.use(socketAuthMiddleware);

    io.on('connection', (socket: AuthenticatedSocket) => {
        logger.info(`Client connected: ${socket.id} (User: ${socket.userId})`);

        // Registrar handlers de chat
        registerChatHandlers(io, socket);

        // Registrar handlers de presença
        registerPresenceHandlers(io, socket);

        socket.on('disconnect', () => {
            logger.info(`Client disconnected: ${socket.id} (User: ${socket.userId})`);
        });
    });

    logger.info('Socket.io initialized with authentication');
    return io;
};
