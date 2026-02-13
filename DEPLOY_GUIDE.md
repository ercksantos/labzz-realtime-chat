# 🚀 Guia Completo de Deploy - Labzz Chat

## 📋 Visão Geral

Este guia detalha como fazer o deploy completo do sistema Labzz Chat de forma **100% gratuita**, incluindo backend, frontend, banco de dados, cache, WebSocket, OAuth2 e 2FA.

### Arquitetura de Deploy

| Componente | Plataforma | Tier |
|---|---|---|
| **Frontend (Next.js)** | Vercel | Free |
| **Backend (Node.js + Socket.io)** | Render | Free |
| **PostgreSQL** | Supabase | Free (500MB) |
| **Redis** | Upstash | Free (10K cmd/dia) |
| **Elasticsearch** | Desabilitado (opcional: Bonsai 125MB free) |

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│   Vercel     │◄─────►│   Render     │◄─────►│  Supabase   │
│  (Frontend)  │  API  │  (Backend)   │  SQL  │ (PostgreSQL) │
│  Next.js     │  WS   │  Express     │       └─────────────┘
└─────────────┘       │  Socket.io   │       ┌─────────────┐
                      │              │◄─────►│  Upstash     │
                      └──────────────┘ Redis │  (Redis)     │
                                             └─────────────┘
```

---

## 📦 PRÉ-REQUISITOS

1. **Conta GitHub** com o repositório do projeto
2. **Conta Vercel** — [vercel.com](https://vercel.com) (login com GitHub)
3. **Conta Render** — [render.com](https://render.com) (login com GitHub)
4. **Conta Supabase** — [supabase.com](https://supabase.com)
5. **Conta Upstash** — [upstash.com](https://upstash.com)
6. (Opcional) **Google Cloud Console** — para OAuth2 Google
7. (Opcional) **GitHub Developer Settings** — para OAuth2 GitHub

---

## 🗄️ ETAPA 1: Subir o Repositório no GitHub

```bash
cd /caminho/para/labzz-realtime-chat

# Inicializar Git (se ainda não tiver)
git init

# Adicionar todos os arquivos
git add .

# Commit inicial
git commit -m "feat: labzz-chat v1.0 - sistema completo de chat em tempo real"

# Criar repositório no GitHub (via browser ou gh cli)
# https://github.com/new → Nome: labzz-realtime-chat → Create

# Conectar e enviar
git remote add origin https://github.com/SEU_USUARIO/labzz-realtime-chat.git
git branch -M main
git push -u origin main
```

---

## 🐘 ETAPA 2: PostgreSQL — Supabase

### 2.1 Criar Projeto
1. Acesse [supabase.com](https://supabase.com) e faça login
2. Clique em **"New Project"**
3. Configure:
   - **Name**: `labzz-chat`
   - **Database Password**: anote esta senha (ex: `SuaSenh@Forte123!`)
   - **Region**: selecione a mais próxima (ex: `South America (São Paulo)`)
4. Clique em **"Create new project"** e aguarde (~2 min)

### 2.2 Obter Connection String
1. Vá em **Settings → Database**
2. Em **Connection string**, selecione **URI**
3. Copie a URI e substitua `[YOUR-PASSWORD]` pela senha que definiu:

**Transaction Mode (pooler — porta 6543)** — para o backend no Render:
```
postgresql://postgres.XXXX:SuaSenh@Forte123!@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Direct URL (porta 5432)** — para migrations:
```
postgresql://postgres.XXXX:SuaSenh@Forte123!@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
```

### 2.3 Aplicar Migrations
No terminal local:
```bash
cd backend

# Defina as variáveis de ambiente temporariamente
# DATABASE_URL = transaction mode (pooler, porta 6543) com ?pgbouncer=true
export DATABASE_URL="postgresql://postgres.XXXX:SuaSenh@Forte123!@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
# DIRECT_URL = session mode (porta 5432, sem pgbouncer) — usado pelo Prisma para migrations
export DIRECT_URL="postgresql://postgres.XXXX:SuaSenh@Forte123!@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"

# Aplicar migrations
npx prisma migrate deploy

# Verificar se funcionou
npx prisma studio
```

> **⚠️ IMPORTANTE**: 
> - `DATABASE_URL` deve usar porta **6543** + `?pgbouncer=true` (transaction mode, desabilita prepared statements)
> - `DIRECT_URL` deve usar porta **5432** (session mode, para migrations e intro speção)
> - Sem `?pgbouncer=true`, o erro `prepared statement "sXX" does not exist` vai acontecer!

---

## 🔴 ETAPA 3: Redis — Upstash

### 3.1 Criar Database
1. Acesse [console.upstash.com](https://console.upstash.com)
2. Clique em **"Create Database"**
3. Configure:
   - **Name**: `labzz-chat-redis`
   - **Region**: selecione a mais próxima (ex: `South America`)
   - **TLS**: habilitado (padrão)
4. Clique em **"Create"**

### 3.2 Obter Credenciais
Na página do database criado, anote:
- **Endpoint**: `refined-slug-12345.upstash.io`
- **Port**: `6379`
- **Password**: `AX...longo...==`

> **Nota sobre TLS**: O Upstash usa TLS. No código do backend, a conexão Redis já funciona com `host` + `port` + `password`. Se der erro de TLS, configure a URL como: `rediss://:PASSWORD@HOST:PORT`

---

## ⚙️ ETAPA 4: Backend — Render

### 4.1 Preparar o Backend para Produção

Antes do deploy, verifique que o `tsconfig.json` do backend tem `outDir`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "src/__tests__"]
}
```

### 4.2 Criar Web Service no Render
1. Acesse [dashboard.render.com](https://dashboard.render.com)
2. Clique em **"New +"** → **"Web Service"**
3. Conecte seu repositório GitHub
4. Configure:
   - **Name**: `labzz-chat-backend`
   - **Region**: `Oregon (US West)` ou `Frankfurt (EU Central)`
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**:
     ```
     npm install --include=dev && npx prisma generate && npx tsc
     ```
   - **Start Command**:
     ```
     node dist/server.js
     ```
   - **Instance Type**: **Free**

### 4.3 Configurar Environment Variables

No painel do Render, vá em **Environment** e adicione:

| Variável | Valor | Descrição |
|---|---|---|
| `NODE_ENV` | `production` | Ambiente |
| `PORT` | `4000` | Porta do servidor |
| `DATABASE_URL` | `postgresql://postgres.XXXX:SENHA@...supabase.com:6543/postgres?pgbouncer=true` | Supabase URI (pooler + pgbouncer) |
| `DIRECT_URL` | `postgresql://postgres.XXXX:SENHA@...supabase.com:5432/postgres` | Supabase URI (session mode, para migrations) |
| `JWT_SECRET` | _(gere com `openssl rand -hex 32`)_ | Segredo JWT (64 chars) |
| `JWT_REFRESH_SECRET` | _(gere com `openssl rand -hex 32`)_ | Segredo refresh token |
| `JWT_EXPIRES_IN` | `15m` | Expiração do access token |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Expiração do refresh token |
| `REDIS_HOST` | `refined-slug-12345.upstash.io` | Host Upstash |
| `REDIS_PORT` | `6379` | Porta Redis |
| `REDIS_PASSWORD` | `AX...==` | Senha Upstash |
| `FRONTEND_URL` | `https://labzz-chat.vercel.app` | URL do frontend (atualizar após deploy Vercel) |
| `RATE_LIMIT_MAX` | `100` | Rate limit geral |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Janela do rate limit (15 min) |

#### Para gerar secrets seguros:
```bash
# No terminal local
openssl rand -hex 32
# Exemplo output: a1b2c3d4e5f6...64 caracteres hex
```

### 4.4 Deploy
1. Clique em **"Create Web Service"**
2. Aguarde o build (~3-5 min)
3. Verifique os logs no Render
4. Teste: `https://labzz-chat-backend.onrender.com/health`

> **⚠️ Free Tier do Render**: O serviço "dorme" após 15 min de inatividade. O primeiro acesso pode demorar ~30s (cold start). Veja a seção "Manter Ativo" abaixo.

---

## 🌐 ETAPA 5: Frontend — Vercel

### 5.1 Importar Projeto
1. Acesse [vercel.com](https://vercel.com) e faça login com GitHub
2. Clique em **"Add New..." → "Project"**
3. Selecione o repositório `labzz-realtime-chat`
4. Configure:
   - **Framework Preset**: `Next.js` (auto-detectado)
   - **Root Directory**: `frontend`
   - **Build Command**: deixe padrão (`next build`)
   - **Output Directory**: deixe padrão (`.next`)

### 5.2 Configurar Environment Variables

| Variável | Valor |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://labzz-chat-backend.onrender.com/api` |
| `NEXT_PUBLIC_WS_URL` | `https://labzz-chat-backend.onrender.com` |
| `NEXT_PUBLIC_APP_URL` | `https://labzz-chat.vercel.app` |
| `NEXT_PUBLIC_APP_NAME` | `Labzz Chat` |

> **Nota**: Após o deploy, a Vercel gerará uma URL como `labzz-realtime-chat.vercel.app`. Volte ao Render e atualize `FRONTEND_URL` com essa URL exata.

### 5.3 Deploy
1. Clique em **"Deploy"**
2. Aguarde o build (~1-2 min)
3. Acesse a URL gerada pela Vercel

### 5.4 Atualizar CORS no Backend
Após saber a URL exata da Vercel:
1. Volte ao **Render → Environment**
2. Atualize `FRONTEND_URL` com a URL real da Vercel
3. O Render fará redeploy automático

---

## 🔐 ETAPA 6: OAuth2 (Opcional)

### 6.1 Google OAuth2

1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Crie um novo projeto ou selecione existente
3. Vá em **APIs & Services → Credentials**
4. Clique em **"Create Credentials" → "OAuth 2.0 Client IDs"**
5. Configure:
   - **Application type**: Web application
   - **Name**: `Labzz Chat`
   - **Authorized JavaScript origins**:
     ```
     https://labzz-chat.vercel.app
     ```
   - **Authorized redirect URIs**:
     ```
     https://labzz-chat-backend.onrender.com/api/oauth/google/callback
     ```
6. Copie **Client ID** e **Client Secret**
7. Adicione ao Render:

| Variável | Valor |
|---|---|
| `GOOGLE_CLIENT_ID` | `123...apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-...` |
| `GOOGLE_CALLBACK_URL` | `https://labzz-chat-backend.onrender.com/api/oauth/google/callback` |

8. Adicione ao frontend (Vercel):

| Variável | Valor |
|---|---|
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | `123...apps.googleusercontent.com` |

### 6.2 GitHub OAuth2

1. Acesse [github.com/settings/developers](https://github.com/settings/developers)
2. Clique em **"New OAuth App"**
3. Configure:
   - **Application name**: `Labzz Chat`
   - **Homepage URL**: `https://labzz-chat.vercel.app`
   - **Authorization callback URL**:
     ```
     https://labzz-chat-backend.onrender.com/api/oauth/github/callback
     ```
4. Copie **Client ID** e gere **Client Secret**
5. Adicione ao Render:

| Variável | Valor |
|---|---|
| `GITHUB_CLIENT_ID` | `Iv1.abc123...` |
| `GITHUB_CLIENT_SECRET` | `secret...` |
| `GITHUB_CALLBACK_URL` | `https://labzz-chat-backend.onrender.com/api/oauth/github/callback` |

6. Adicione ao frontend (Vercel):

| Variável | Valor |
|---|---|
| `NEXT_PUBLIC_GITHUB_CLIENT_ID` | `Iv1.abc123...` |

---

## 🔑 ETAPA 7: 2FA (Two-Factor Authentication)

O 2FA funciona **automaticamente** sem serviço externo. Usa a biblioteca `speakeasy` para gerar segredos TOTP e `qrcode` para gerar QR codes.

**Fluxo:**
1. Usuário acessa Configurações → Segurança → Ativar 2FA
2. Backend gera segredo TOTP + QR code
3. Usuário escaneia com Google Authenticator / Authy
4. Confirma com código de 6 dígitos
5. Nas próximas logins, será pedido o código 2FA

**Não precisa configurar nada extra!** ✅

---

## ⏰ ETAPA 8: Manter Backend Ativo (Anti-Sleep)

O Render free tier "dorme" o serviço após 15 min sem requisições. Para manter ativo:

### Opção A: Cron-Job.org (Recomendado)
1. Acesse [cron-job.org](https://cron-job.org) e crie conta
2. Crie um novo cron job:
   - **URL**: `https://labzz-chat-backend.onrender.com/health`
   - **Schedule**: A cada 14 minutos
   - **Method**: GET
3. Ative o cron job

### Opção B: UptimeRobot
1. Acesse [uptimerobot.com](https://uptimerobot.com) e crie conta
2. Adicione monitor:
   - **Monitor Type**: HTTP(s)
   - **URL**: `https://labzz-chat-backend.onrender.com/health`
   - **Monitoring Interval**: 5 min
3. Isso também monitora se o serviço está saudável

---

## ✅ ETAPA 9: Verificação Final

### Checklist de Deploy

Após completar todos os passos, verifique:

- [ ] **Backend Health**: `https://SEU_BACKEND.onrender.com/health` retorna `{"status":"ok"}`
- [ ] **Frontend**: `https://SEU_FRONTEND.vercel.app` carrega a página de login
- [ ] **Registro**: Criar novo usuário funciona
- [ ] **Login**: Login com usuário criado funciona
- [ ] **Chat**: Enviar e receber mensagens em tempo real
- [ ] **WebSocket**: Indicador "Online" aparece quando outro usuário conecta
- [ ] **Busca de usuários**: Encontrar outros usuários para iniciar conversa
- [ ] **Logout**: Logout limpa sessão corretamente
- [ ] **2FA**: Ativar e usar 2FA funciona (se testando)
- [ ] **OAuth2**: Login social funciona (se configurado)
- [ ] **Responsivo**: Interface funciona no mobile
- [ ] **Modo escuro**: Alternância de tema funciona
- [ ] **i18n**: Troca de idioma funciona
- [ ] **PWA**: Manifest e service worker carregam

### URLs do Sistema

Após o deploy, atualize esta seção:

| Componente | URL |
|---|---|
| Frontend | `https://labzz-chat.vercel.app` |
| Backend API | `https://labzz-chat-backend.onrender.com/api` |
| WebSocket | `https://labzz-chat-backend.onrender.com` |
| Health Check | `https://labzz-chat-backend.onrender.com/health` |
| Swagger API Docs | `https://labzz-chat-backend.onrender.com/api-docs` |
| Métricas | `https://labzz-chat-backend.onrender.com/metrics` |

---

## 🔧 SOLUÇÃO DE PROBLEMAS

### Backend não inicia no Render
- Verifique os logs no painel do Render
- Certifique-se de que `DATABASE_URL` está correta
- Verifique se as migrations foram aplicadas: `npx prisma migrate deploy`
- Confirme que `tsconfig.json` tem `outDir: "./dist"`

### Elasticsearch "não conectado" (Normal)
- **Elasticsearch é opcional** e foi desabilitado no free tier por padrão
- O sistema funciona normalmente sem ele
- A funcionalidade de busca avançada ficará desabilitada (busca básica ainda funciona)
- Para habilitar: configure `ELASTICSEARCH_NODE` apontando para Bonsai (125MB free) ou outro provedor

### Erro de CORS
- Verifique se `FRONTEND_URL` no Render bate com a URL da Vercel (sem `/` no final)
- O backend usa `config.frontend.url` para CORS

### WebSocket não conecta em produção
- Verifique se `NEXT_PUBLIC_WS_URL` aponta para o backend (sem `/api`)
- O Render suporta WebSocket nativamente no free tier
- O socket.io usa `polling` como fallback se `websocket` falhar

### Redis não conecta
- Upstash requer TLS. Se necessário, adicione `REDIS_TLS=true` ao backend
- Verifique host, porta e password

### Cold Start lento (~30s)
- Normal no Render free tier
- Use cron-job.org para manter ativo (ver Etapa 8)
- O frontend mostra loading enquanto aguarda

### OAuth2 redireciona para localhost
- Atualize as **Redirect URIs** no Google/GitHub console para URLs de produção
- As rotas OAuth estão em `/api/oauth/` (não `/api/auth/`)
- Verifique `GOOGLE_CALLBACK_URL` e `GITHUB_CALLBACK_URL` no Render

### 2FA QR Code não carrega
- O 2FA gera QR code como data URL (base64) — funciona independente de CDN
- Verifique se o endpoint `/api/2fa/generate` responde corretamente

---

## 💰 Custo Total

| Serviço | Custo |
|---|---|
| Vercel (frontend) | **$0/mês** |
| Render (backend) | **$0/mês** |
| Supabase (PostgreSQL) | **$0/mês** (até 500MB) |
| Upstash (Redis) | **$0/mês** (até 10K cmd/dia) |
| Cron-job.org | **$0/mês** |
| Google OAuth2 | **$0** |
| GitHub OAuth2 | **$0** |
| **TOTAL** | **$0/mês** ✅ |

---

## 📖 Referências

- [Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Upstash Docs](https://upstash.com/docs)
- [Socket.io Deployment](https://socket.io/docs/v4/behind-a-reverse-proxy/)
- [Prisma Deploy](https://www.prisma.io/docs/guides/deployment)
