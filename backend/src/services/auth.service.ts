import bcrypt from 'bcrypt';
import prisma from '../config/database';
import { AppError } from '../middlewares/errorHandler';
import { RegisterInput, LoginInput } from '../validators/auth.validator';
import { jwtService } from '../utils/jwt';
import { config } from '../config';
import { twoFactorService } from './twoFactor.service';
import elasticsearchService from './elasticsearch.service';
import { UserDocument } from '../types/elasticsearch.types';
import logger from '../utils/logger';

export class AuthService {
    async register(data: RegisterInput) {
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email: data.email }, { username: data.username }],
            },
        });

        if (existingUser) {
            if (existingUser.email === data.email) {
                throw new AppError('Email already exists', 400);
            }
            throw new AppError('Username already exists', 400);
        }

        const hashedPassword = await bcrypt.hash(data.password, config.security.bcryptRounds);

        const user = await prisma.user.create({
            data: {
                email: data.email,
                username: data.username,
                password: hashedPassword,
                name: data.name,
            },
            select: {
                id: true,
                email: true,
                username: true,
                name: true,
                avatar: true,
                createdAt: true,
            },
        });

        // Indexar usuário no Elasticsearch
        const userDoc: UserDocument = {
            id: user.id,
            email: user.email,
            username: user.username,
            name: user.name,
            avatar: user.avatar,
            isOnline: false,
            createdAt: user.createdAt,
        };
        elasticsearchService.indexUser(userDoc).catch((err: any) => {
            logger.error('Erro ao indexar usuário no ES:', err);
        });

        return user;
    }

    async login(data: LoginInput) {
        const user = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (!user || !user.password) {
            throw new AppError('Invalid email or password', 401);
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.password);

        if (!isPasswordValid) {
            throw new AppError('Invalid email or password', 401);
        }

        if (user.twoFactorEnabled) {
            return {
                requires2FA: true,
                userId: user.id,
                message: '2FA verification required',
            };
        }

        // Generate tokens
        const tokenPayload = {
            userId: user.id,
            email: user.email,
            username: user.username,
        };

        const accessToken = jwtService.generateAccessToken(tokenPayload);
        const refreshToken = jwtService.generateRefreshToken(tokenPayload);

        // Save refresh token in database
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt,
            },
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                name: user.name,
                avatar: user.avatar,
            },
            accessToken,
            refreshToken,
        };
    }

    async verify2FAAndLogin(userId: string, token: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new AppError('User not found', 404);
        }

        if (!user.twoFactorEnabled || !user.twoFactorSecret) {
            throw new AppError('2FA is not enabled for this user', 400);
        }

        const isValid = twoFactorService.verify2FAToken(user.twoFactorSecret, token);

        if (!isValid) {
            throw new AppError('Invalid 2FA token', 401);
        }

        const tokenPayload = {
            userId: user.id,
            email: user.email,
            username: user.username,
        };

        const accessToken = jwtService.generateAccessToken(tokenPayload);
        const refreshToken = jwtService.generateRefreshToken(tokenPayload);

        // Save refresh token in database
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt,
            },
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                name: user.name,
                avatar: user.avatar,
            },
            accessToken,
            refreshToken,
        };
    }

    async refreshAccessToken(refreshToken: string) {
        try {
            jwtService.verifyRefreshToken(refreshToken);
        } catch {
            throw new AppError('Invalid or expired refresh token', 401);
        }

        const storedToken = await prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });

        if (!storedToken) {
            throw new AppError('Refresh token not found', 401);
        }

        if (storedToken.expiresAt < new Date()) {
            await prisma.refreshToken.delete({ where: { id: storedToken.id } });
            throw new AppError('Refresh token expired', 401);
        }

        const tokenPayload = {
            userId: storedToken.user.id,
            email: storedToken.user.email,
            username: storedToken.user.username,
        };

        const accessToken = jwtService.generateAccessToken(tokenPayload);

        return { accessToken };
    }

    async logout(refreshToken: string) {
        await prisma.refreshToken.deleteMany({
            where: { token: refreshToken },
        });

        return { message: 'Logged out successfully' };
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
                createdAt: true,
            },
        });

        if (!user) {
            throw new AppError('User not found', 404);
        }

        return user;
    }
}

export const authService = new AuthService();
