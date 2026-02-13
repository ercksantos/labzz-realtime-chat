import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import prisma from '../config/database';
import { AppError } from '../middlewares/errorHandler';

export class TwoFactorService {
  async generateSecret(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, twoFactorEnabled: true },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.twoFactorEnabled) {
      throw new AppError('2FA is already enabled for this user', 400);
    }

    const secret = speakeasy.generateSecret({
      name: `Labzz Chat (${user.email})`,
      length: 32,
    });

    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url!);

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
    };
  }

  async enable2FA(userId: string, secret: string, token: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.twoFactorEnabled) {
      throw new AppError('2FA is already enabled', 400);
    }

    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2,
    });

    if (!verified) {
      throw new AppError('Invalid 2FA token', 400);
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: secret,
        twoFactorEnabled: true,
      },
    });

    return { message: '2FA enabled successfully' };
  }

  async disable2FA(userId: string, token: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new AppError('2FA is not enabled', 400);
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 2,
    });

    if (!verified) {
      throw new AppError('Invalid 2FA token', 400);
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: null,
        twoFactorEnabled: false,
      },
    });

    return { message: '2FA disabled successfully' };
  }

  verify2FAToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2,
    });
  }
}

export const twoFactorService = new TwoFactorService();
