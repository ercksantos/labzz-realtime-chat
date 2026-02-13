export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000',

  // OAuth Configuration
  oauth: {
    google: {
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
    },
    github: {
      clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || '',
    },
    facebook: {
      appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '',
    },
  },

  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Labzz Chat',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },

  features: {
    oauth: true,
    twoFactor: true,
    darkMode: true,
    i18n: true,
  },
};

// Valida variáveis de ambiente obrigatórias em produção
if (process.env.NODE_ENV === 'production') {
  const requiredEnvVars: Record<string, string | undefined> = {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  };

  Object.entries(requiredEnvVars).forEach(([name, value]) => {
    if (!value) {
      console.warn(`Missing required environment variable: ${name}`);
    }
  });
}
