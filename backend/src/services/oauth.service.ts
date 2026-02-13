import axios from 'axios';
import prisma from '../config/database';
import { config } from '../config';
import { AppError } from '../middlewares/errorHandler';
import { jwtService } from '../utils/jwt';

interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

interface GitHubUserInfo {
  id: number;
  login: string;
  email: string | null;
  name: string | null;
  avatar_url?: string;
}

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
}

export class OAuthService {
  async getGoogleAuthUrl(): Promise<string> {
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = {
      redirect_uri: config.oauth.google.callbackUrl,
      client_id: config.oauth.google.clientId,
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ].join(' '),
    };

    const qs = new URLSearchParams(options);
    return `${rootUrl}?${qs.toString()}`;
  }

  async authenticateWithGoogle(code: string) {
    const { data } = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: config.oauth.google.clientId,
      client_secret: config.oauth.google.clientSecret,
      redirect_uri: config.oauth.google.callbackUrl,
      grant_type: 'authorization_code',
    });

    const { access_token } = data;

    const { data: userInfo } = await axios.get<GoogleUserInfo>(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: { Authorization: `Bearer ${access_token}` },
      },
    );

    return this.handleOAuthUser(
      'google',
      userInfo.id,
      userInfo.email,
      userInfo.name,
      userInfo.picture,
    );
  }

  async getGitHubAuthUrl(): Promise<string> {
    const rootUrl = 'https://github.com/login/oauth/authorize';
    const options = {
      client_id: config.oauth.github.clientId,
      redirect_uri: config.oauth.github.callbackUrl,
      scope: 'user:email',
    };

    const qs = new URLSearchParams(options);
    return `${rootUrl}?${qs.toString()}`;
  }

  async authenticateWithGitHub(code: string) {
    const { data } = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: config.oauth.github.clientId,
        client_secret: config.oauth.github.clientSecret,
        code,
        redirect_uri: config.oauth.github.callbackUrl,
      },
      {
        headers: { Accept: 'application/json' },
      },
    );

    const { access_token } = data;

    const { data: userInfo } = await axios.get<GitHubUserInfo>('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: 'application/json',
      },
    });

    // GitHub pode não retornar email público, então buscar da API
    let email = userInfo.email;
    if (!email) {
      const { data: emails } = await axios.get<GitHubEmail[]>(
        'https://api.github.com/user/emails',
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            Accept: 'application/json',
          },
        },
      );
      const primaryEmail = emails.find((e) => e.primary && e.verified);
      email = primaryEmail?.email || emails[0]?.email;
    }

    if (!email) {
      throw new AppError('Could not retrieve email from GitHub', 400);
    }

    return this.handleOAuthUser(
      'github',
      userInfo.id.toString(),
      email,
      userInfo.name || userInfo.login,
      userInfo.avatar_url,
    );
  }

  // Gerencia criação/login de usuários OAuth (Google/GitHub)
  private async handleOAuthUser(
    provider: string,
    providerId: string,
    email: string,
    name: string,
    avatar?: string,
  ) {
    let user = await prisma.user.findFirst({
      where: {
        provider,
        providerId,
      },
    });

    if (!user) {
      user = await prisma.user.findUnique({
        where: { email },
      });

      if (user) {
        // Vincula OAuth a conta existente com mesmo email
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            provider,
            providerId,
            avatar: avatar || user.avatar,
          },
        });
      } else {
        // Gera username único a partir do email
        let username = email
          .split('@')[0]
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, '');

        let usernameExists = await prisma.user.findUnique({
          where: { username },
        });
        let counter = 1;
        while (usernameExists) {
          username = `${email
            .split('@')[0]
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, '')}_${counter}`;
          usernameExists = await prisma.user.findUnique({
            where: { username },
          });
          counter++;
        }

        user = await prisma.user.create({
          data: {
            email,
            username,
            name,
            avatar,
            provider,
            providerId,
            password: null,
          },
        });
      }
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      username: user.username,
    };

    const accessToken = jwtService.generateAccessToken(tokenPayload);
    const refreshToken = jwtService.generateRefreshToken(tokenPayload);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        avatar: user.avatar,
      },
      accessToken,
      refreshToken,
    };
  }
}

export const oauthService = new OAuthService();
