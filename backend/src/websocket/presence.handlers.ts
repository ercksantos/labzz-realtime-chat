import { Server } from 'socket.io';
import { AuthenticatedSocket } from './auth.middleware';
import prisma from '../config/database';
import logger from '../utils/logger';

export const registerPresenceHandlers = (io: Server, socket: AuthenticatedSocket) => {
    // Usuário ficou online
    const setUserOnline = async () => {
        try {
            await prisma.user.update({
                where: { id: socket.userId },
                data: {
                    isOnline: true,
                    lastSeen: new Date(),
                },
            });

            // Notificar outros usuários
            io.emit('user_online', {
                userId: socket.userId,
                username: socket.username,
            });

            logger.info(`User ${socket.userId} is now online`);
        } catch (error) {
            logger.error('Error setting user online:', error);
        }
    };

    // Usuário ficou offline
    const setUserOffline = async () => {
        try {
            await prisma.user.update({
                where: { id: socket.userId },
                data: {
                    isOnline: false,
                    lastSeen: new Date(),
                },
            });

            // Notificar outros usuários
            io.emit('user_offline', {
                userId: socket.userId,
                username: socket.username,
            });

            logger.info(`User ${socket.userId} is now offline`);
        } catch (error) {
            logger.error('Error setting user offline:', error);
        }
    };

    // Entrar na sala pessoal do usuário (para receber notificações)
    socket.join(`user:${socket.userId}`);
    setUserOnline();

    // Quando o usuário desconectar
    socket.on('disconnect', () => {
        setUserOffline();
    });
};
