/**
 * Inicializar todos os workers
 * Deve ser chamado após verificar que o Redis está disponível
 */

import { Worker } from 'bullmq';
import redisClient from '../config/redis';
import { checkRedisConnection } from '../config/redis';
import emailService from '../services/email.service';
import notificationService from '../services/notification.service';
import { EmailJob, NotificationJob } from './queues';
import logger from '../utils/logger';

let emailWorker: Worker<EmailJob> | null = null;
let notificationWorker: Worker<NotificationJob> | null = null;

export const initializeWorkers = async (): Promise<boolean> => {
  const redisOk = await checkRedisConnection();
  if (!redisOk) {
    logger.warn('⚠️  Workers BullMQ não inicializados (Redis indisponível)');
    return false;
  }

  emailWorker = new Worker<EmailJob>(
    'email',
    async (job) => {
      logger.info(`Processando email job ${job.id}: ${job.data.subject}`);
      try {
        await emailService.sendEmail(job.data);
        logger.info(`Email job ${job.id} processado com sucesso`);
      } catch (error) {
        logger.error(`Erro ao processar email job ${job.id}:`, error);
        throw error;
      }
    },
    {
      connection: redisClient as any,
      concurrency: 5,
      limiter: { max: 10, duration: 1000 },
    },
  );

  notificationWorker = new Worker<NotificationJob>(
    'notification',
    async (job) => {
      logger.info(`Processando notification job ${job.id} para usuário ${job.data.userId}`);
      try {
        await notificationService.createNotification(job.data);
        logger.info(`Notification job ${job.id} processado com sucesso`);
      } catch (error) {
        logger.error(`Erro ao processar notification job ${job.id}:`, error);
        throw error;
      }
    },
    {
      connection: redisClient as any,
      concurrency: 10,
    },
  );

  emailWorker.on('completed', (job) => logger.info(`Email job ${job.id} completado`));
  emailWorker.on('failed', (job, error) => logger.error(`Email job ${job?.id} falhou:`, error));
  emailWorker.on('error', (error) => logger.error('Erro no email worker:', error.message));

  notificationWorker.on('completed', (job) => logger.info(`Notification job ${job.id} completado`));
  notificationWorker.on('failed', (job, error) =>
    logger.error(`Notification job ${job?.id} falhou:`, error),
  );
  notificationWorker.on('error', (error) =>
    logger.error('Erro no notification worker:', error.message),
  );

  // Graceful shutdown
  const shutdown = async () => {
    logger.info('Encerrando workers...');
    await Promise.all([emailWorker?.close(), notificationWorker?.close()]);
    logger.info('Workers encerrados');
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  logger.info('🚀 Todos os workers foram inicializados');
  return true;
};

export { emailWorker, notificationWorker };
