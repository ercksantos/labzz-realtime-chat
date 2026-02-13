import { Queue, QueueOptions } from 'bullmq';
import redisClient from '../config/redis';
import { checkRedisConnection } from '../config/redis';
import logger from '../utils/logger';

// Configuração base do BullMQ
const queueConfig: QueueOptions = {
  connection: redisClient as any,
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

// Filas (inicializadas sob demanda)
let emailQueue: Queue<EmailJob> | null = null;
let notificationQueue: Queue<NotificationJob> | null = null;
let queuesInitialized = false;

export const initializeQueues = async (): Promise<boolean> => {
  const redisOk = await checkRedisConnection();
  if (!redisOk) {
    logger.warn('⚠️  Filas BullMQ não inicializadas (Redis indisponível)');
    return false;
  }

  emailQueue = new Queue<EmailJob>('email', queueConfig);
  notificationQueue = new Queue<NotificationJob>('notification', queueConfig);

  emailQueue.on('error', (error) => {
    logger.error('Erro na fila de emails:', error.message);
  });

  notificationQueue.on('error', (error) => {
    logger.error('Erro na fila de notificações:', error.message);
  });

  queuesInitialized = true;
  logger.info('✅ Filas BullMQ configuradas');
  return true;
};

export const getEmailQueue = () => emailQueue;
export const getNotificationQueue = () => notificationQueue;
export const areQueuesInitialized = () => queuesInitialized;

// Estatísticas das filas
export const getQueueStats = async () => {
  if (!emailQueue || !notificationQueue) {
    return { email: null, notification: null, status: 'queues_not_initialized' };
  }

  const [emailStats, notificationStats] = await Promise.all([
    emailQueue.getJobCounts('waiting', 'active', 'completed', 'failed'),
    notificationQueue.getJobCounts('waiting', 'active', 'completed', 'failed'),
  ]);

  return {
    email: emailStats,
    notification: notificationStats,
  };
};

export { emailQueue, notificationQueue };

export default {
  initializeQueues,
  getEmailQueue,
  getNotificationQueue,
  getQueueStats,
  areQueuesInitialized,
};
