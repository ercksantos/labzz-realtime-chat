import 'dotenv/config';
import express, { Application } from 'express';
import { createServer } from 'http';
import swaggerUi from 'swagger-ui-express';
import { config } from './config';
import { swaggerSpec } from './config/swagger';
import { initializeSocket } from './config/socket';
import {
    checkElasticsearchConnection,
    // initializeElasticsearchIndices, // Temporariamente comentado devido a incompatibilidade de versão
} from './config/elasticsearch';
import { checkRedisConnection } from './config/redis';
import cacheService from './services/cache.service';
import './queue/workers'; // Inicializar workers BullMQ
import {
    helmetMiddleware,
    corsMiddleware,
    mongoSanitizeMiddleware,
    xssMiddleware,
    sanitizeInputs,
    httpsRedirect,
} from './middlewares/security';
import { generalLimiter } from './middlewares/rateLimiter';
import { requestLogger } from './middlewares/requestLogger';
import { metricsMiddleware } from './middlewares/metrics.middleware';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import logger from './utils/logger';
import register from './config/metrics';
import apiRoutes from './routes';

const app: Application = express();
const httpServer = createServer(app);
const io = initializeSocket(httpServer);

// Disponibilizar io globalmente para uso nos controllers
app.set('io', io);

const PORT = config.port;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middlewares de segurança
app.use(httpsRedirect);
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(mongoSanitizeMiddleware);
app.use(xssMiddleware);
app.use(sanitizeInputs);
app.use(requestLogger);
app.use(metricsMiddleware); // Coletar métricas HTTP
app.use(generalLimiter);

app.get('/health', async (_req, res) => {
    const redisHealth = await cacheService.healthCheck();
    const esConnected = await checkElasticsearchConnection();

    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.nodeEnv,
        services: {
            database: 'connected',
            redis: redisHealth.connected ? 'connected' : 'disconnected',
            elasticsearch: esConnected ? 'connected' : 'disconnected',
        },
        cache: {
            memory: redisHealth.memory,
        },
    });
});

// Métricas Prometheus
app.get('/metrics', async (_req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Labzz Chat API',
}));

app.use('/api', apiRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

// Inicializar serviços antes de iniciar o servidor
const initializeServices = async () => {
    // Verificar e inicializar Redis
    const redisConnected = await checkRedisConnection();
    if (!redisConnected) {
        logger.warn('⚠️  Servidor iniciará sem Redis (cache desabilitado)');
    }

    // Verificar e inicializar Elasticsearch
    const esConnected = await checkElasticsearchConnection();
    if (esConnected) {
        // TODO: Corrigir compatibilidade de versão do Elasticsearch
        // await initializeElasticsearchIndices();
        logger.info('⚠️  Elasticsearch conectado mas índices não inicializados (aguardando correção de versão)');
    } else {
        logger.warn('⚠️  Servidor iniciará sem Elasticsearch');
    }
};

initializeServices().then(() => {
    httpServer.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`);
        logger.info(`Environment: ${config.nodeEnv}`);
        logger.info(`Health check: http://localhost:${PORT}/health`);
        logger.info(`WebSocket server ready`);
    });
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason: Error) => {
    logger.error('Unhandled Rejection:', reason);
    throw reason;
});

process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

export default app;
