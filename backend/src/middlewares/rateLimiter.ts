import rateLimit from 'express-rate-limit';
import { config } from '../config';

// Rate limiter geral para toda a API
export const generalLimiter = rateLimit({
    windowMs: config.security.rateLimitWindowMs,
    max: config.security.rateLimitMax,
    message: {
        status: 'error',
        message: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter específico para rotas de autenticação
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 tentativas
    message: {
        status: 'error',
        message: 'Too many authentication attempts, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Não conta requisições bem-sucedidas
});

// Rate limiter para criação de recursos
export const createLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 10, // 10 requisições
    message: {
        status: 'error',
        message: 'Too many creation requests, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
