import rateLimit from 'express-rate-limit';
import { config } from '../config';

const isDev = config.nodeEnv === 'development';

export const generalLimiter = rateLimit({
  windowMs: config.security.rateLimitWindowMs,
  max: isDev ? 1000 : config.security.rateLimitMax,
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 100 : 5,
  message: {
    status: 'error',
    message: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

export const createLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    status: 'error',
    message: 'Too many creation requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
