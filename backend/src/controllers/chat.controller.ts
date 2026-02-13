import { Request, Response, NextFunction } from 'express';
import { chatService } from '../services/chat.service';
import { createConversationSchema, getMessagesQuerySchema } from '../validators/chat.validator';
import { ZodError } from 'zod';
import { AppError } from '../middlewares/errorHandler';
import logger from '../utils/logger';

export class ChatController {
  async createConversation(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-expect-error - userId is set by auth middleware
      const userId = req.userId;

      const validatedData = createConversationSchema.parse(req.body);
      const conversation = await chatService.createConversation(userId, validatedData);

      logger.info(`Conversation created: ${conversation.id}`);

      res.status(201).json({
        status: 'success',
        data: { conversation },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return next(new AppError(error.errors[0].message, 400));
      }
      next(error);
    }
  }

  async getUserConversations(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-expect-error - userId is set by auth middleware
      const userId = req.userId;

      const conversations = await chatService.getUserConversations(userId);

      res.status(200).json({
        status: 'success',
        data: { conversations },
      });
    } catch (error) {
      next(error);
    }
  }

  async getConversationMessages(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-expect-error - userId is set by auth middleware
      const userId = req.userId;
      const { conversationId } = req.params;

      const query = getMessagesQuerySchema.parse(req.query);

      const result = await chatService.getConversationMessages(
        conversationId,
        userId,
        query.page,
        query.limit,
      );

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

  async deleteConversation(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-expect-error - userId is set by auth middleware
      const userId = req.userId;
      const { conversationId } = req.params;

      const result = await chatService.deleteConversation(conversationId, userId);

      logger.info(`Conversation deleted: ${conversationId}`);

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const chatController = new ChatController();
