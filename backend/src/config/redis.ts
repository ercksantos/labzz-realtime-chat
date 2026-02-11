import Redis from 'ioredis';
import logger from '../utils/logger';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

// Cliente Redis singleton
const redisClient = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
    retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    maxRetriesPerRequest: 3,
});

// Eventos de conexão
redisClient.on('connect', () => {
    logger.info('Redis conectado');
});

redisClient.on('error', (error) => {
    logger.error('Erro no Redis:', error);
});

redisClient.on('ready', () => {
    logger.info('Redis pronto para uso');
});

// Verificar conexão
export const checkRedisConnection = async (): Promise<boolean> => {
    try {
        await redisClient.ping();
        return true;
    } catch (error) {
        logger.error('Erro ao conectar no Redis:', error);
        return false;
    }
};

export default redisClient;
