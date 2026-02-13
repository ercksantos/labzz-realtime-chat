import { Worker, Job } from 'bullmq';
import redisClient from '../config/redis';
import notificationService from '../services/notification.service';
import { NotificationJob } from './queues';
import logger from '../utils/logger';

// Worker para processar notificações
export const notificationWorker = new Worker<NotificationJob>(
  'notification',
  async (job: Job<NotificationJob>) => {
    logger.info(`Processando notification job ${job.id} para usuário ${job.data.userId}`);

    try {
      await notificationService.createNotification(job.data);
      logger.info(`Notification job ${job.id} processado com sucesso`);
    } catch (error) {
      logger.error(`Erro ao processar notification job ${job.id}:`, error);
      throw error; // Retry automático
    }
  },
  {
    connection: redisClient as any,
    concurrency: 10, // Processar até 10 notificações simultaneamente
  },
);

// Eventos do worker
notificationWorker.on('completed', (job) => {
  logger.info(`Notification job ${job.id} completado`);
});

notificationWorker.on('failed', (job, error) => {
  logger.error(`Notification job ${job?.id} falhou:`, error);
});

notificationWorker.on('error', (error) => {
  logger.error('Erro no notification worker:', error);
});

logger.info('✅ Notification worker inicializado');

export default notificationWorker;
