import 'dotenv/config';
import express, { Application } from 'express';
import { config } from './config';
import { helmetMiddleware, corsMiddleware } from './middlewares/security';
import { generalLimiter } from './middlewares/rateLimiter';
import { requestLogger } from './middlewares/requestLogger';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import logger from './utils/logger';

const app: Application = express();
const PORT = config.port;

// Middlewares de parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middlewares de segurança
app.use(helmetMiddleware);
app.use(corsMiddleware);

// Request logging
app.use(requestLogger);

// Rate limiting
app.use(generalLimiter);

// Health check endpoint
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.nodeEnv,
        database: 'connected',
    });
});

// API routes
app.get('/api', (_req, res) => {
    res.json({
        message: 'Labzz Chat API',
        version: '1.0.0',
        documentation: '/api-docs',
    });
});

// 404 handler
app.use(notFoundHandler);

// Error handler (deve ser o último middleware)
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Environment: ${config.nodeEnv}`);
    logger.info(`Health check: http://localhost:${PORT}/health`);
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
