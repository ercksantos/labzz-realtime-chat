import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { UserService } from '../../services/user.service';
import prisma from '../../config/database';
import elasticsearchService from '../../services/elasticsearch.service';

jest.mock('../../config/database');
jest.mock('../../services/elasticsearch.service', () => ({
    __esModule: true,
    default: {
        indexUser: (jest.fn() as any).mockResolvedValue({}),
        deleteUser: (jest.fn() as any).mockResolvedValue({}),
        searchUsers: (jest.fn() as any).mockResolvedValue({ hits: [], total: 0 }),
    },
}));

describe('UserService', () => {
    let userService: UserService;

    beforeEach(() => {
        userService = new UserService();
        jest.clearAllMocks();
    });

    describe('getUserById', () => {
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

            const result = await userService.getUserById('1');

            expect(result).toBeDefined();
            expect(result?.email).toBe('test@example.com');
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: '1' },
                select: expect.any(Object),
            });
        });

        it('deve retornar null se usuário não existe', async () => {
            (prisma.user.findUnique as any).mockResolvedValue(null);

            await expect(userService.getUserById('999')).rejects.toThrow('User not found');
        });
    });

    describe('updateUser', () => {
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
                avatar: 'new-avatar.jpg',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // Primeira chamada: verificar se usuário existe (por id)
            // Segunda chamada: verificar se username já existe
            (prisma.user.findUnique as any)
                .mockResolvedValueOnce(existingUser)
                .mockResolvedValueOnce(null);
            (prisma.user.update as any).mockResolvedValue(mockUser);

            const result = await userService.updateUser('1', {
                username: 'updateduser',
                name: 'Updated Name',
                avatar: 'new-avatar.jpg',
            });

            expect(result.username).toBe('updateduser');
            expect(result.name).toBe('Updated Name');
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: '1' },
                data: expect.objectContaining({
                    username: 'updateduser',
                }),
                select: expect.any(Object),
            });
        });
    });

    describe('deleteUser', () => {
        it('deve deletar usuário com sucesso', async () => {
            (prisma.user.findUnique as any).mockResolvedValue({ id: '1' });
            (prisma.user.delete as any).mockResolvedValue({ id: '1' });

            await userService.deleteUser('1');

            expect(prisma.user.delete).toHaveBeenCalledWith({
                where: { id: '1' },
            });
        });
    });
});
