import { Server } from 'socket.io';
import { AuthenticatedSocket } from './auth.middleware';
import prisma from '../config/database';
import logger from '../utils/logger';
import elasticsearchService from '../services/elasticsearch.service';
import { MessageDocument } from '../types/elasticsearch.types';
import cacheService from '../services/cache.service';
import notificationService from '../services/notification.service';

export const registerChatHandlers = (io: Server, socket: AuthenticatedSocket) => {
  // Evento: enviar mensagem
  socket.on('send_message', async (data: { conversationId: string; content: string }) => {
    try {
      const { conversationId, content } = data;

      if (!content || content.trim() === '') {
        socket.emit('error', { message: 'Message content cannot be empty' });
        return;
      }

      // Verificar se o usuário é participante da conversa
      const participant = await prisma.conversationParticipant.findFirst({
        where: {
          conversationId,
          userId: socket.userId,
        },
      });

      if (!participant) {
        socket.emit('error', { message: 'You are not a participant of this conversation' });
        return;
      }

      // Criar mensagem no banco
      const message = await prisma.message.create({
        data: {
          content,
          conversationId,
          senderId: socket.userId!,
        },
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
      });

      // Indexar mensagem no Elasticsearch
      const messageDoc: MessageDocument = {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        senderName: message.sender.name,
        senderUsername: message.sender.username,
        conversationId: message.conversationId,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
      };
      elasticsearchService.indexMessage(messageDoc).catch((err: any) => {
        logger.error('Erro ao indexar mensagem no ES:', err);
      });

      // Atualizar timestamp da conversa
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      // Obter todos os participantes da conversa
      const participants = await prisma.conversationParticipant.findMany({
        where: { conversationId },
        select: { userId: true },
      });

      // Invalidar cache de conversas de todos os participantes
      const participantIds = participants.map((p) => p.userId);
      await cacheService.invalidateConversationCache(conversationId, participantIds);

      // Emitir mensagem para todos os participantes (incluindo o remetente)
      participants.forEach((p: { userId: string }) => {
        io.to(`user:${p.userId}`).emit('new_message', message);
      });

      // Enviar notificações para participantes offline
      for (const participant of participants) {
        if (participant.userId !== socket.userId) {
          const isOnline = await cacheService.isUserOnline(participant.userId);

          if (!isOnline) {
            // Buscar informações do destinatário
            const recipient = await prisma.user.findUnique({
              where: { id: participant.userId },
              select: { email: true, name: true },
            });

            if (recipient) {
              // Enviar notificação
              notificationService
                .notifyNewMessage(
                  participant.userId,
                  message.sender.name,
                  message.content,
                  conversationId,
                )
                .catch((err: any) => {
                  logger.error('Erro ao enviar notificação:', err);
                });
            }
          }
        }
      }

      logger.info(`Message sent: ${message.id} in conversation ${conversationId}`);
    } catch (error) {
      logger.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Evento: marcar mensagens como lidas
  socket.on('mark_as_read', async (data: { conversationId: string }) => {
    try {
      const { conversationId } = data;

      await prisma.message.updateMany({
        where: {
          conversationId,
          senderId: { not: socket.userId },
          isRead: false,
        },
        data: { isRead: true },
      });

      socket.emit('messages_marked_read', { conversationId });
      logger.info(`Messages marked as read in conversation ${conversationId}`);
    } catch (error) {
      logger.error('Error marking messages as read:', error);
      socket.emit('error', { message: 'Failed to mark messages as read' });
    }
  });

  // Evento: digitando (typing indicator)
  socket.on('typing_start', (data: { conversationId: string }) => {
    try {
      const { conversationId } = data;
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        userId: socket.userId,
        username: socket.username,
        conversationId,
      });
    } catch (error) {
      logger.error('Error in typing_start:', error);
    }
  });

  socket.on('typing_stop', (data: { conversationId: string }) => {
    try {
      const { conversationId } = data;
      socket.to(`conversation:${conversationId}`).emit('user_stopped_typing', {
        userId: socket.userId,
        conversationId,
      });
    } catch (error) {
      logger.error('Error in typing_stop:', error);
    }
  });

  // Evento: entrar em uma conversa (para receber mensagens em tempo real)
  socket.on('join_conversation', async (data: { conversationId: string }) => {
    try {
      const { conversationId } = data;

      // Verificar se o usuário é participante
      const participant = await prisma.conversationParticipant.findFirst({
        where: {
          conversationId,
          userId: socket.userId,
        },
      });

      if (!participant) {
        socket.emit('error', { message: 'You are not a participant of this conversation' });
        return;
      }

      socket.join(`conversation:${conversationId}`);
      logger.info(`User ${socket.userId} joined conversation ${conversationId}`);
    } catch (error) {
      logger.error('Error joining conversation:', error);
      socket.emit('error', { message: 'Failed to join conversation' });
    }
  });

  // Evento: sair de uma conversa
  socket.on('leave_conversation', (data: { conversationId: string }) => {
    try {
      const { conversationId } = data;
      socket.leave(`conversation:${conversationId}`);
      logger.info(`User ${socket.userId} left conversation ${conversationId}`);
    } catch (error) {
      logger.error('Error leaving conversation:', error);
    }
  });
};
