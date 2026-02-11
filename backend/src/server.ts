import 'dotenv/config';
import express, { Application } from 'express';
import { createServer } from 'http';
import { config } from './config';
import { initializeSocket } from './config/socket';
import {
    checkElasticsearchConnection,
    initializeElasticsearchIndices,
} from './config/elasticsearch';
import { helmetMiddleware, corsMiddleware } from './middlewares/security';
import { generalLimiter } from './middlewares/rateLimiter';
import { requestLogger } from './middlewares/requestLogger';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import logger from './utils/logger';
import apiRoutes from './routes';

const app: Application = express();
const httpServer = createServer(app);
const io = initializeSocket(httpServer);

// Disponibilizar io globalmente para uso nos controllers
app.set('io', io);

const PORT = config.port;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(requestLogger);
app.use(generalLimiter);

app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.nodeEnv,
        database: 'connected',
    });
});

app.use('/api', apiRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

// Inicializar serviços antes de iniciar o servidor
const initializeServices = async () => {
    // Verificar e inicializar Elasticsearch
    const esConnected = await checkElasticsearchConnection();
    if (esConnected) {
        await initializeElasticsearchIndices();
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
