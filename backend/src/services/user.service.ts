import prisma from '../config/database';
import bcrypt from 'bcrypt';
import { AppError } from '../middlewares/errorHandler';
import { UpdateUserInput } from '../validators/user.validator';
import { config } from '../config';
import elasticsearchService from './elasticsearch.service';
import logger from '../utils/logger';

export class UserService {
    async listUsers(page: number = 1, limit: number = 10, search?: string) {
        const skip = (page - 1) * limit;

        const where = search
            ? {
                OR: [
                    { username: { contains: search, mode: 'insensitive' as const } },
                    { name: { contains: search, mode: 'insensitive' as const } },
                    { email: { contains: search, mode: 'insensitive' as const } },
                ],
            }
            : {};

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                select: {
                    id: true,
                    email: true,
                    username: true,
                    name: true,
                    avatar: true,
                    isOnline: true,
                    lastSeen: true,
                    createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.user.count({ where }),
        ]);

        return {
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getUserById(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                username: true,
                name: true,
                avatar: true,
                isOnline: true,
                lastSeen: true,
                provider: true,
                twoFactorEnabled: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            throw new AppError('User not found', 404);
        }

        return user;
    }

    async updateUser(userId: string, data: UpdateUserInput) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new AppError('User not found', 404);
        }

        if (data.username && data.username !== user.username) {
            const existingUser = await prisma.user.findUnique({
                where: { username: data.username },
            });

            if (existingUser) {
                throw new AppError('Username already exists', 400);
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                email: true,
                username: true,
                name: true,
                avatar: true,
                isOnline: true,
                lastSeen: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        // Atualizar usuário no Elasticsearch
        elasticsearchService
            .indexUser({
                id: updatedUser.id,
                email: updatedUser.email,
                username: updatedUser.username,
                name: updatedUser.name,
                avatar: updatedUser.avatar,
                isOnline: updatedUser.isOnline,
                createdAt: updatedUser.createdAt,
            })
            .catch((err: any) => {
                logger.error('Erro ao atualizar usuário no ES:', err);
            });

        return updatedUser;
    }

    async deleteUser(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new AppError('User not found', 404);
        }

        await prisma.user.delete({
            where: { id: userId },
        });

        return { message: 'User deleted successfully' };
    }

    async changePassword(userId: string, currentPassword: string, newPassword: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || !user.password) {
            throw new AppError('User not found', 404);
        }

        const isCurrentValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentValid) {
            throw new AppError('Current password is incorrect', 400);
        }

        const hashedPassword = await bcrypt.hash(newPassword, config.security.bcryptRounds);
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        logger.info(`Password changed for user: ${userId}`);
        return { message: 'Password changed successfully' };
    }
}

export const userService = new UserService();
