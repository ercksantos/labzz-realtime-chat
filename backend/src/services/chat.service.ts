import prisma from '../config/database';
import { AppError } from '../middlewares/errorHandler';
import { CreateConversationInput } from '../validators/chat.validator';

export class ChatService {
    async createConversation(userId: string, data: CreateConversationInput) {
        // Adicionar o usuário atual à lista de participantes se não estiver
        const participantIds = [...new Set([userId, ...data.participantIds])];

        // Verificar se todos os participantes existem
        const users = await prisma.user.findMany({
            where: { id: { in: participantIds } },
        });

        if (users.length !== participantIds.length) {
            throw new AppError('One or more participants not found', 404);
        }

        // Para conversas diretas (não-grupo), verificar se já existe conversa entre os usuários
        if (!data.isGroup && participantIds.length === 2) {
            const existingConversation = await prisma.conversation.findFirst({
                where: {
                    isGroup: false,
                    participants: {
                        every: {
                            userId: { in: participantIds },
                        },
                    },
                },
                include: {
                    participants: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    username: true,
                                    name: true,
                                    avatar: true,
                                    isOnline: true,
                                },
                            },
                        },
                    },
                },
            });

            if (existingConversation && existingConversation.participants.length === 2) {
                return existingConversation;
            }
        }

        // Criar nova conversa
        const conversation = await prisma.conversation.create({
            data: {
                isGroup: data.isGroup || false,
                name: data.name,
                participants: {
                    create: participantIds.map((id) => ({
                        userId: id,
                    })),
                },
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                name: true,
                                avatar: true,
                                isOnline: true,
                            },
                        },
                    },
                },
            },
        });

        return conversation;
    }

    async getUserConversations(userId: string) {
        const conversations = await prisma.conversation.findMany({
            where: {
                participants: {
                    some: {
                        userId,
                    },
                },
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                name: true,
                                avatar: true,
                                isOnline: true,
                                lastSeen: true,
                            },
                        },
                    },
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    include: {
                        sender: {
                            select: {
                                id: true,
                                username: true,
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: { updatedAt: 'desc' },
        });

        return conversations;
    }

    async getConversationMessages(
        conversationId: string,
        userId: string,
        page: number = 1,
        limit: number = 50,
    ) {
        // Verificar se o usuário é participante da conversa
        const participant = await prisma.conversationParticipant.findFirst({
            where: {
                conversationId,
                userId,
            },
        });

        if (!participant) {
            throw new AppError('You are not a participant of this conversation', 403);
        }

        const skip = (page - 1) * limit;

        const [messages, total] = await Promise.all([
            prisma.message.findMany({
                where: { conversationId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    sender: {
                        select: {
                            id: true,
                            username: true,
                            name: true,
                            avatar: true,
                        },
                    },
                },
            }),
            prisma.message.count({ where: { conversationId } }),
        ]);

        // Inverter para ordem crescente (mensagens mais antigas primeiro)
        messages.reverse();

        return {
            messages,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async deleteConversation(conversationId: string, userId: string) {
        // Verificar se o usuário é participante
        const participant = await prisma.conversationParticipant.findFirst({
            where: {
                conversationId,
                userId,
            },
        });

        if (!participant) {
            throw new AppError('You are not a participant of this conversation', 403);
        }

        // Deletar a conversa (cascade deleta mensagens e participantes)
        await prisma.conversation.delete({
            where: { id: conversationId },
        });

        return { message: 'Conversation deleted successfully' };
    }
}

export const chatService = new ChatService();
