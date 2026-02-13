import { Queue, QueueOptions } from 'bullmq';
import redisClient from '../config/redis';
import logger from '../utils/logger';

// Configuração base do BullMQ
const queueConfig: QueueOptions = {
  connection: redisClient,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      age: 86400, // 24 horas
      count: 100,
    },
    removeOnFail: {
      age: 604800, // 7 dias
      count: 1000,
    },
  },
};

// Tipos de jobs para cada fila
export interface EmailJob {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

export interface NotificationJob {
  userId: string;
  type: 'message' | 'conversation' | 'system';
  title: string;
  body: string;
  data?: Record<string, any>;
}

// Filas
export const emailQueue = new Queue<EmailJob>('email', queueConfig);
export const notificationQueue = new Queue<NotificationJob>('notification', queueConfig);

// Eventos das filas
emailQueue.on('error', (error) => {
  logger.error('Erro na fila de emails:', error);
});

notificationQueue.on('error', (error) => {
  logger.error('Erro na fila de notificações:', error);
});

// Estatísticas das filas
export const getQueueStats = async () => {
  const [emailStats, notificationStats] = await Promise.all([
    emailQueue.getJobCounts('waiting', 'active', 'completed', 'failed'),
    notificationQueue.getJobCounts('waiting', 'active', 'completed', 'failed'),
  ]);

  return {
    email: emailStats,
    notification: notificationStats,
  };
};

logger.info('✅ Filas BullMQ configuradas');

export default {
  emailQueue,
  notificationQueue,
  getQueueStats,
};
