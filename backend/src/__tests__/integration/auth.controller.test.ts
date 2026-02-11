import request from 'supertest';
import express, { Application } from 'express';
import authRoutes from '../../routes/auth.routes';
import { errorHandler } from '../../middlewares/errorHandler';
import prisma from '../../config/database';
import bcrypt from 'bcrypt';

jest.mock('../../config/database');
jest.mock('bcrypt');
jest.mock('../../utils/jwt');

describe('Auth API Integration Tests', () => {
    let app: Application;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use('/api/auth', authRoutes);
        app.use(errorHandler);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/auth/register', () => {
        it('deve registrar novo usuário com sucesso', async () => {
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
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
            (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
            (prisma.refreshToken.create as jest.Mock).mockResolvedValue({});

            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@example.com',
                    username: 'testuser',
                    name: 'Test User',
                    password: 'StrongP@ss123',
                });

            expect(response.status).toBe(201);
            expect(response.body.status).toBe('success');
            expect(response.body.data).toHaveProperty('user');
            expect(response.body.data).toHaveProperty('accessToken');
        });

        it('deve retornar erro 400 para dados inválidos', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'invalid-email',
                    username: 'ab', // muito curto
                    password: 'weak',
                });

            expect(response.status).toBe(400);
        });

        it('deve retornar erro 400 se email já existe', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: '1' });

            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'existing@example.com',
                    username: 'testuser',
                    name: 'Test User',
                    password: 'StrongP@ss123',
                });

            expect(response.status).toBe(400);
        });
    });

    describe('POST /api/auth/login', () => {
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

            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                });

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('success');
            expect(response.body.data).toHaveProperty('accessToken');
        });

        it('deve retornar erro 401 com credenciais inválidas', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                id: '1',
                password: 'hashedPassword',
            });
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword',
                });

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/auth/csrf-token', () => {
        it('deve retornar token CSRF', async () => {
            const response = await request(app).get('/api/auth/csrf-token');

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('success');
            expect(response.body.data).toHaveProperty('csrfToken');
            expect(typeof response.body.data.csrfToken).toBe('string');
        });
    });
});
