import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { updateUserSchema, listUsersQuerySchema } from '../validators/user.validator';
import { ZodError } from 'zod';
import { AppError } from '../middlewares/errorHandler';
import logger from '../utils/logger';

export class UserController {
    async listUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const query = listUsersQuerySchema.parse(req.query);
            const result = await userService.listUsers(query.page, query.limit, query.search);

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

    async getUserById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const user = await userService.getUserById(id);

            res.status(200).json({
                status: 'success',
                data: { user },
            });
        } catch (error) {
            next(error);
        }
    }

    async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            // @ts-expect-error - userId is set by auth middleware
            const authenticatedUserId = req.userId;
            const { id } = req.params;

            if (authenticatedUserId !== id) {
                throw new AppError('You can only update your own profile', 403);
            }

            const validatedData = updateUserSchema.parse(req.body);
            const user = await userService.updateUser(id, validatedData);

            logger.info(`User profile updated: ${user.email}`);

            res.status(200).json({
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

    async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            // @ts-expect-error - userId is set by auth middleware
            const authenticatedUserId = req.userId;
            const { id } = req.params;

            if (authenticatedUserId !== id) {
                throw new AppError('You can only delete your own account', 403);
            }

            const result = await userService.deleteUser(id);

            logger.info(`User account deleted: ${id}`);

            res.status(200).json({
                status: 'success',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const userController = new UserController();
