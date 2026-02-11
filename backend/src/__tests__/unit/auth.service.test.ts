import bcrypt from 'bcrypt';
import { AuthService } from '../../services/auth.service';
import prisma from '../../config/database';

jest.mock('../../config/database');
jest.mock('bcrypt');
jest.mock('../../services/email.service');

// Mock do módulo jwt diretamente
jest.mock('../../utils/jwt', () => ({
    generateAccessToken: jest.fn(() => 'access-token'),
    generateRefreshToken: jest.fn(() => 'refresh-token'),
    verifyAccessToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
}));

describe('AuthService', () => {
    let authService: AuthService;

    beforeEach(() => {
        authService = new AuthService();
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('deve registrar um novo usuário com sucesso', async () => {
            const mockUser = {
                id: '1',
                email: 'test@example.com',
                username: 'testuser',
                name: 'Test User',
                password: 'hashedPassword',
                avatar: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                twoFactorSecret: null,
                twoFactorEnabled: false,
                googleId: null,
                githubId: null,
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
            (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
            (prisma.refreshToken.create as jest.Mock).mockResolvedValue({});

            const result = await authService.register({
                email: 'test@example.com',
                username: 'testuser',
                name: 'Test User',
                password: 'password123',
            });

            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('accessToken', 'access-token');
            expect(result).toHaveProperty('refreshToken', 'refresh-token');
            expect(result.user.email).toBe('test@example.com');
            expect(prisma.user.create).toHaveBeenCalled();
        });

        it('deve lançar erro se email já existe', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: '1' });

            await expect(
                authService.register({
                    email: 'test@example.com',
                    username: 'testuser',
                    name: 'Test User',
                    password: 'password123',
                })
            ).rejects.toThrow('Email já está em uso');
        });
    });

    describe('login', () => {
        it('deve fazer login com credenciais válidas', async () => {
            const mockUser = {
                id: '1',
                email: 'test@example.com',
                username: 'testuser',
                name: 'Test User',
                password: 'hashedPassword',
                avatar: null,
                twoFactorEnabled: false,
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (prisma.refreshToken.create as jest.Mock).mockResolvedValue({});

            const result = await authService.login({
                email: 'test@example.com',
                password: 'password123',
            });

            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
            expect(result.user.email).toBe('test@example.com');
        });

        it('deve lançar erro com credenciais inválidas', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                id: '1',
                password: 'hashedPassword',
            });
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(
                authService.login({
                    email: 'test@example.com',
                    password: 'wrongpassword',
                })
            ).rejects.toThrow('Credenciais inválidas');
        });

        it('deve lançar erro se usuário não existe', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(
                authService.login({
                    email: 'nonexistent@example.com',
                    password: 'password123',
                })
            ).rejects.toThrow('Credenciais inválidas');
        });
    });
});
