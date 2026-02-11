import { Request, Response, NextFunction } from 'express';
import cacheService from '../services/cache.service';
import prisma from '../config/database';
import logger from '../utils/logger';

export class CacheController {
    // Obter usuários online
    async getOnlineUsers(_req: Request, res: Response, next: NextFunction) {
        try {
            const onlineUserIds = await cacheService.getOnlineUsers();
            const count = await cacheService.getOnlineUsersCount();

            // Buscar informações dos usuários online
            const users = await prisma.user.findMany({
                where: {
                    id: { in: onlineUserIds },
                },
                select: {
                    id: true,
                    username: true,
                    name: true,
                    avatar: true,
                    isOnline: true,
                },
            });

            res.status(200).json({
                status: 'success',
                data: {
                    users,
                    count,
                },
            });
        } catch (error) {
            logger.error('Error getting online users:', error);
            next(error);
        }
    }

    // Verificar saúde do cache
    async getCacheHealth(_req: Request, res: Response, next: NextFunction) {
        try {
            const health = await cacheService.healthCheck();

            res.status(200).json({
                status: 'success',
                data: health,
            });
        } catch (error) {
            logger.error('Error checking cache health:', error);
            next(error);
        }
    }

    // Limpar cache (apenas para admin/desenvolvimento)
    async flushCache(_req: Request, res: Response, next: NextFunction) {
        try {
            await cacheService.flushAll();

            res.status(200).json({
                status: 'success',
                message: 'Cache cleared successfully',
            });
        } catch (error) {
            logger.error('Error flushing cache:', error);
            next(error);
        }
    }
}

export const cacheController = new CacheController();
