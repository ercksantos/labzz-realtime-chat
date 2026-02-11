import { UserService } from '../../services/user.service';
import prisma from '../../config/database';

jest.mock('../../config/database');
jest.mock('../../services/elasticsearch.service');

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

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            const result = await userService.getUserById('1');

            expect(result).toBeDefined();
            expect(result?.email).toBe('test@example.com');
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: '1' },
                select: expect.any(Object),
            });
        });

        it('deve retornar null se usuário não existe', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            const result = await userService.getUserById('999');

            expect(result).toBeNull();
        });
    });

    describe('updateUser', () => {
        it('deve atualizar dados do usuário', async () => {
            const mockUser = {
                id: '1',
                email: 'test@example.com',
                username: 'updateduser',
                name: 'Updated Name',
                avatar: 'new-avatar.jpg',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

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
            (prisma.user.delete as jest.Mock).mockResolvedValue({ id: '1' });

            await userService.deleteUser('1');

            expect(prisma.user.delete).toHaveBeenCalledWith({
                where: { id: '1' },
            });
        });
    });
});
