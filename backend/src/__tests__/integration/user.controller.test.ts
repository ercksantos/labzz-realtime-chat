import { describe, it, expect, jest, beforeAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import express, { Application } from 'express';
import userRoutes from '../../routes/user.routes';
import { errorHandler } from '../../middlewares/errorHandler';
import prisma from '../../config/database';

jest.mock('../../config/database');
jest.mock('../../middlewares/auth.middleware', () => ({
  authMiddleware: (req: any, _res: any, next: any) => {
    req.userId = '1';
    req.userEmail = 'test@example.com';
    req.username = 'testuser';
    next();
  },
}));

// Mock de outros middlewares de segurança que podem interferir
jest.mock('../../middlewares/csrf.middleware', () => ({
  csrfProtection: (_req: any, _res: any, next: any) => next(),
}));

describe('User API Integration Tests', () => {
  let app: Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/users', userRoutes);
    app.use(errorHandler);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users', () => {
    it('deve retornar lista de usuários', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'user1@example.com',
          username: 'user1',
          name: 'User One',
          avatar: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          email: 'user2@example.com',
          username: 'user2',
          name: 'User Two',
          avatar: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.user.findMany as any).mockResolvedValue(mockUsers);
      (prisma.user.count as any).mockResolvedValue(2);

      const response = await request(app).get('/api/users');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.users).toBeInstanceOf(Array);
      expect(response.body.data.users).toHaveLength(2);
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.pagination.total).toBe(2);
    });
  });

  describe('GET /api/users/:id', () => {
    it('deve retornar usuário pelo ID', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        name: 'Test User',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);

      const response = await request(app).get('/api/users/1');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user.email).toBe('test@example.com');
    });

    it('deve retornar 404 se usuário não existe', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);

      const response = await request(app).get('/api/users/999');

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('deve atualizar dados do usuário', async () => {
      const existingUser = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
      };

      const mockUser = {
        id: '1',
        email: 'test@example.com',
        username: 'updateduser',
        name: 'Updated Name',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Primeira chamada: verificar se usuário existe (por id)
      // Segunda chamada: verificar se username já existe
      (prisma.user.findUnique as any)
        .mockResolvedValueOnce(existingUser)
        .mockResolvedValueOnce(null);
      (prisma.user.update as any).mockResolvedValue(mockUser);

      const response = await request(app).put('/api/users/1').send({
        username: 'updateduser',
        name: 'Updated Name',
      });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user.username).toBe('updateduser');
    });

    it('deve retornar erro 400 para dados inválidos', async () => {
      const response = await request(app).put('/api/users/1').send({
        username: 'ab', // muito curto
      });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('deve deletar usuário', async () => {
      (prisma.user.findUnique as any).mockResolvedValue({ id: '1' });
      (prisma.user.delete as any).mockResolvedValue({ id: '1' });

      const response = await request(app).delete('/api/users/1');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });
  });
});
