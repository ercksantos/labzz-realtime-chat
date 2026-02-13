import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import bcrypt from 'bcrypt';
import { AuthService } from '../../services/auth.service';
import prisma from '../../config/database';

jest.mock('../../config/database');
jest.mock('bcrypt');
jest.mock('../../services/email.service', () => ({
  __esModule: true,
  default: {
    sendWelcomeEmail: (jest.fn() as any).mockResolvedValue({}),
    sendPasswordResetEmail: (jest.fn() as any).mockResolvedValue({}),
  },
}));
jest.mock('../../services/elasticsearch.service', () => ({
  __esModule: true,
  default: {
    indexUser: (jest.fn() as any).mockResolvedValue({}),
  },
}));

// Mock do módulo jwt diretamente
jest.mock('../../utils/jwt', () => ({
  jwtService: {
    generateAccessToken: jest.fn(() => 'access-token'),
    generateRefreshToken: jest.fn(() => 'refresh-token'),
    verifyAccessToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
  },
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

      (prisma.user.findFirst as any).mockResolvedValue(null);
      (bcrypt.hash as any).mockResolvedValue('hashedPassword');
      (prisma.user.create as any).mockResolvedValue(mockUser);
      (prisma.refreshToken.create as any).mockResolvedValue({});

      const result = await authService.register({
        email: 'test@example.com',
        username: 'testuser',
        name: 'Test User',
        password: 'password123',
      });

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email', 'test@example.com');
      expect(result).toHaveProperty('username', 'testuser');
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('deve lançar erro se email já existe', async () => {
      (prisma.user.findFirst as any).mockResolvedValue({
        id: '1',
        email: 'test@example.com',
      });

      await expect(
        authService.register({
          email: 'test@example.com',
          username: 'testuser',
          name: 'Test User',
          password: 'password123',
        }),
      ).rejects.toThrow('Email already exists');
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

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (bcrypt.compare as any).mockResolvedValue(true);
      (prisma.refreshToken.create as any).mockResolvedValue({});

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user?.email).toBe('test@example.com');
    });

    it('deve lançar erro com credenciais inválidas', async () => {
      (prisma.user.findUnique as any).mockResolvedValue({
        id: '1',
        password: 'hashedPassword',
      });
      (bcrypt.compare as any).mockResolvedValue(false);

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow('Invalid email or password');
    });

    it('deve lançar erro se usuário não existe', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'nonexistent@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow('Invalid email or password');
    });
  });
});
