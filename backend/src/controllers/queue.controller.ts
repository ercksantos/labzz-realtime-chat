import { Request, Response, NextFunction } from 'express';
import { getQueueStats } from '../queue/queues';
import logger from '../utils/logger';

export class QueueController {
  // Obter estatísticas das filas
  async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await getQueueStats();

      res.status(200).json({
        status: 'success',
        data: stats,
      });
    } catch (error) {
      logger.error('Error getting queue stats:', error);
      next(error);
    }
  }
}

export const queueController = new QueueController();
