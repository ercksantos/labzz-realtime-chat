import { getNotificationQueue, NotificationJob } from '../queue/queues';
import logger from '../utils/logger';

export class NotificationService {
  // Criar notificação no banco
  async createNotification(data: NotificationJob): Promise<void> {
    try {
      // Aqui você pode salvar a notificação no banco se tiver uma tabela para isso
      // Por enquanto, vamos apenas logar
      logger.info(`Notificação criada para usuário ${data.userId}: ${data.title}`);
    } catch (error) {
      logger.error('Erro ao criar notificação:', error);
      throw error;
    }
  }

  // Adicionar job à fila de notificações
  async queueNotification(
    job: NotificationJob,
    options?: { delay?: number; priority?: number },
  ): Promise<void> {
    try {
      const queue = getNotificationQueue();
      if (!queue) {
        logger.warn('Fila de notificações indisponível, criando diretamente...');
        await this.createNotification(job);
        return;
      }

      await queue.add('send-notification', job, {
        delay: options?.delay,
        priority: options?.priority,
      });

      logger.debug(`Notificação adicionada à fila para usuário ${job.userId}`);
    } catch (error) {
      logger.error('Erro ao adicionar notificação à fila:', error);
      throw error;
    }
  }

  // Notificar sobre nova mensagem
  async notifyNewMessage(
    userId: string,
    senderName: string,
    message: string,
    conversationId: string,
  ): Promise<void> {
    await this.queueNotification({
      userId,
      type: 'message',
      title: `Nova mensagem de ${senderName}`,
      body: message.substring(0, 100), // Limitar tamanho
      data: {
        conversationId,
        senderName,
      },
    });
  }

  // Notificar sobre nova conversa
  async notifyNewConversation(
    userId: string,
    conversationName: string,
    conversationId: string,
  ): Promise<void> {
    await this.queueNotification({
      userId,
      type: 'conversation',
      title: 'Nova conversa',
      body: `Você foi adicionado a: ${conversationName}`,
      data: {
        conversationId,
      },
    });
  }

  // Notificação do sistema
  async notifySystem(userId: string, title: string, body: string): Promise<void> {
    await this.queueNotification(
      {
        userId,
        type: 'system',
        title,
        body,
      },
      { priority: 1 }, // Alta prioridade
    );
  }

  // Notificar múltiplos usuários
  async notifyMultipleUsers(
    userIds: string[],
    notification: Omit<NotificationJob, 'userId'>,
  ): Promise<void> {
    const jobs = userIds.map((userId) => ({
      userId,
      ...notification,
    }));

    await Promise.all(jobs.map((job) => this.queueNotification(job)));
  }
}

export default new NotificationService();
