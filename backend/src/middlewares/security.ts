import helmet from 'helmet';
import cors from 'cors';
// @ts-ignore
import mongoSanitize from 'express-mongo-sanitize';
// @ts-ignore
import xss from 'xss-clean';
import { Request, Response, NextFunction } from 'express';
import validator from 'validator';
import { config } from '../config';

export const helmetMiddleware = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'", 'ws:', 'wss:'],
        },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
    },
});

export const corsMiddleware = cors({
    origin: (origin, callback) => {
        // Permitir requisições sem origin (ex: Postman, curl)
        if (!origin) return callback(null, true);

        // Permitir múltiplas origens do frontend
        const allowedOrigins = [
            config.frontend.url,
            'http://localhost:3000',
            'http://localhost:3001',
        ];

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
});

// Sanitização contra NoSQL injection
export const mongoSanitizeMiddleware = mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ key }: any) => {
        console.warn(`[Security] NoSQL injection attempt detected: ${key}`);
    },
});

// Proteção XSS
export const xssMiddleware = xss();

// Middleware para sanitizar strings individuais
export const sanitizeString = (str: string): string => {
    return validator.escape(validator.trim(str));
};

// Middleware para sanitizar recursivamente objetos
export const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
        return sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }

    if (obj !== null && typeof obj === 'object') {
        const sanitized: any = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                sanitized[key] = sanitizeObject(obj[key]);
            }
        }
        return sanitized;
    }

    return obj;
};

// Middleware para sanitizar body, query e params
export const sanitizeInputs = (req: Request, _res: Response, next: NextFunction) => {
    if (req.body) {
        req.body = sanitizeObject(req.body);
    }

    if (req.query) {
        req.query = sanitizeObject(req.query);
    }

    if (req.params) {
        req.params = sanitizeObject(req.params);
    }

    next();
};

// Middleware para forçar HTTPS em produção
export const httpsRedirect = (req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV === 'production' && !req.secure && req.get('x-forwarded-proto') !== 'https') {
        return res.redirect(301, `https://${req.get('host')}${req.url}`);
    }
    next();
};
