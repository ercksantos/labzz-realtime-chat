import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';

interface TokenPayload {
    userId: string;
    email: string;
    username: string;
}

export class JwtService {
    generateAccessToken(payload: TokenPayload): string {
        const secret = config.jwt.secret;
        if (!secret) {
            throw new Error('JWT_SECRET is not defined');
        }
        const options: SignOptions = {
            expiresIn: config.jwt.expiresIn as SignOptions['expiresIn'],
        };
        return jwt.sign(payload, secret, options);
    }

    generateRefreshToken(payload: TokenPayload): string {
        const secret = config.jwt.refreshSecret;
        if (!secret) {
            throw new Error('JWT_REFRESH_SECRET is not defined');
        }
        const options: SignOptions = {
            expiresIn: config.jwt.refreshExpiresIn as SignOptions['expiresIn'],
        };
        return jwt.sign(payload, secret, options);
    }

    verifyAccessToken(token: string): TokenPayload {
        const secret = config.jwt.secret;
        if (!secret) {
            throw new Error('JWT_SECRET is not defined');
        }
        try {
            return jwt.verify(token, secret) as TokenPayload;
        } catch (error) {
            throw new Error('Invalid or expired access token');
        }
    }

    verifyRefreshToken(token: string): TokenPayload {
        const secret = config.jwt.refreshSecret;
        if (!secret) {
            throw new Error('JWT_REFRESH_SECRET is not defined');
        }
        try {
            return jwt.verify(token, secret) as TokenPayload;
        } catch (error) {
            throw new Error('Invalid or expired refresh token');
        }
    }

    decodeToken(token: string): TokenPayload | null {
        try {
            return jwt.decode(token) as TokenPayload;
        } catch {
            return null;
        }
    }
}

export const jwtService = new JwtService();
