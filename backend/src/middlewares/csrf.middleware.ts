import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import logger from '../utils/logger';

// Store para tokens CSRF (em produção, usar Redis)
const csrfTokens = new Map<string, { token: string; expiresAt: number }>();

// Gerar token CSRF
export const generateCsrfToken = (): string => {
    return crypto.randomBytes(32).toString('hex');
};

// Middleware para gerar e anexar token CSRF
export const csrfTokenGenerator = (req: Request, res: Response, next: NextFunction) => {
    // Gerar token apenas para requisições GET que precisam de formulários
    if (req.method === 'GET') {
        const token = generateCsrfToken();
        const userId = (req as any).user?.id || req.ip;

        // Armazenar token com TTL de 1 hora
        csrfTokens.set(userId, {
            token,
            expiresAt: Date.now() + 60 * 60 * 1000,
        });

        // Enviar token no header ou cookie
        res.setHeader('X-CSRF-Token', token);

        // Limpar tokens expirados periodicamente
        cleanExpiredTokens();
    }

    next();
};

// Middleware para validar token CSRF
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
    // Aplicar apenas em métodos que modificam dados
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
    if (safeMethods.includes(req.method)) {
        return next();
    }

    const userId = (req as any).user?.id || req.ip;
    const tokenFromHeader = req.headers['x-csrf-token'] as string;
    const tokenFromBody = req.body?._csrf;
    const token = tokenFromHeader || tokenFromBody;

    if (!token) {
        logger.warn(`[CSRF] Token ausente para ${req.method} ${req.path} - User: ${userId}`);
        return res.status(403).json({
            status: 'error',
            message: 'CSRF token ausente',
        });
    }

    const storedTokenData = csrfTokens.get(userId);

    if (!storedTokenData) {
        logger.warn(`[CSRF] Token não encontrado para usuário ${userId}`);
        return res.status(403).json({
            status: 'error',
            message: 'CSRF token inválido ou expirado',
        });
    }

    if (storedTokenData.token !== token) {
        logger.warn(`[CSRF] Token inválido para ${req.method} ${req.path} - User: ${userId}`);
        return res.status(403).json({
            status: 'error',
            message: 'CSRF token inválido',
        });
    }

    if (Date.now() > storedTokenData.expiresAt) {
        csrfTokens.delete(userId);
        logger.warn(`[CSRF] Token expirado para ${req.method} ${req.path} - User: ${userId}`);
        return res.status(403).json({
            status: 'error',
            message: 'CSRF token expirado',
        });
    }

    // Token válido, continuar
    next();
};

// Limpar tokens expirados (executar periodicamente)
const cleanExpiredTokens = () => {
    const now = Date.now();
    for (const [userId, tokenData] of csrfTokens.entries()) {
        if (now > tokenData.expiresAt) {
            csrfTokens.delete(userId);
        }
    }
};

// Executar limpeza a cada 5 minutos
setInterval(cleanExpiredTokens, 5 * 60 * 1000);

// Endpoint para obter token CSRF (opcional, para SPAs)
export const getCsrfToken = (req: Request, res: Response) => {
    const userId = (req as any).user?.id || req.ip;
    const token = generateCsrfToken();

    csrfTokens.set(userId, {
        token,
        expiresAt: Date.now() + 60 * 60 * 1000,
    });

    res.json({
        status: 'success',
        data: { csrfToken: token },
    });
};
