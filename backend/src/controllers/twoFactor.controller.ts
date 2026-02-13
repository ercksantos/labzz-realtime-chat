import { Request, Response, NextFunction } from 'express';
import { twoFactorService } from '../services/twoFactor.service';
import { z, ZodError } from 'zod';
import { AppError } from '../middlewares/errorHandler';
import logger from '../utils/logger';

const enable2FASchema = z.object({
  secret: z.string().min(1, 'Secret is required'),
  token: z.string().length(6, 'Token must be 6 digits'),
});

const verify2FASchema = z.object({
  token: z.string().length(6, 'Token must be 6 digits'),
});

export class TwoFactorController {
  async generateSecret(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-expect-error - userId is set by auth middleware
      const userId = req.userId;
      const result = await twoFactorService.generateSecret(userId);

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async enable2FA(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = enable2FASchema.parse(req.body);
      // @ts-expect-error - userId is set by auth middleware
      const userId = req.userId;

      const result = await twoFactorService.enable2FA(
        userId,
        validatedData.secret,
        validatedData.token,
      );

      logger.info(`2FA enabled for user: ${userId}`);

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

  async disable2FA(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = verify2FASchema.parse(req.body);
      // @ts-expect-error - userId is set by auth middleware
      const userId = req.userId;

      const result = await twoFactorService.disable2FA(userId, validatedData.token);

      logger.info(`2FA disabled for user: ${userId}`);

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
}

export const twoFactorController = new TwoFactorController();
