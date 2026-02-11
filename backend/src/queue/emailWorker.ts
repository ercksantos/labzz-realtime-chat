import { Worker, Job } from 'bullmq';
import redisClient from '../config/redis';
import emailService from '../services/email.service';
import { EmailJob } from './queues';
import logger from '../utils/logger';

// Worker para processar emails
export const emailWorker = new Worker<EmailJob>(
    'email',
    async (job: Job<EmailJob>) => {
        logger.info(`Processando email job ${job.id}: ${job.data.subject}`);

        try {
            await emailService.sendEmail(job.data);
            logger.info(`Email job ${job.id} processado com sucesso`);
        } catch (error) {
            logger.error(`Erro ao processar email job ${job.id}:`, error);
            throw error; // Retry automático
        }
    },
    {
        connection: redisClient,
        concurrency: 5, // Processar até 5 emails simultaneamente
        limiter: {
            max: 10, // Máximo de 10 emails
            duration: 1000, // Por segundo (rate limiting)
        },
    }
);

// Eventos do worker
emailWorker.on('completed', (job) => {
    logger.info(`Email job ${job.id} completado`);
});

emailWorker.on('failed', (job, error) => {
    logger.error(`Email job ${job?.id} falhou:`, error);
});

emailWorker.on('error', (error) => {
    logger.error('Erro no email worker:', error);
});

logger.info('✅ Email worker inicializado');

export default emailWorker;
