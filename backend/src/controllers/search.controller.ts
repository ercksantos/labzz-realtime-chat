import { Request, Response, NextFunction } from 'express';
import elasticsearchService from '../services/elasticsearch.service';
import { AppError } from '../middlewares/errorHandler';
import logger from '../utils/logger';

export class SearchController {
  // Buscar mensagens
  async searchMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        query,
        conversationId,
        senderId,
        page = 1,
        limit = 20,
        sortBy = 'relevance',
      } = req.query;

      if (!query || typeof query !== 'string') {
        throw new AppError('Query parameter is required', 400);
      }

      const from = (Number(page) - 1) * Number(limit);
      const size = Number(limit);

      const results = await elasticsearchService.searchMessages({
        query,
        conversationId: conversationId as string,
        senderId: senderId as string,
        from,
        size,
        sortBy: sortBy as 'relevance' | 'date',
      });

      res.status(200).json({
        status: 'success',
        data: {
          results: results.hits.map((hit: any) => hit.source),
          total: results.total,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(results.total / size),
          },
        },
      });
    } catch (error) {
      logger.error('Error searching messages:', error);
      next(error);
    }
  }

  // Buscar usuários
  async searchUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { query, page = 1, limit = 20 } = req.query;

      if (!query || typeof query !== 'string') {
        throw new AppError('Query parameter is required', 400);
      }

      const from = (Number(page) - 1) * Number(limit);
      const size = Number(limit);

      const results = await elasticsearchService.searchUsers({
        query,
        from,
        size,
      });

      res.status(200).json({
        status: 'success',
        data: {
          results: results.hits.map((hit: any) => hit.source),
          total: results.total,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(results.total / size),
          },
        },
      });
    } catch (error) {
      logger.error('Error searching users:', error);
      next(error);
    }
  }
}

export const searchController = new SearchController();
