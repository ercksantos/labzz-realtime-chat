# � Backend - Labzz Realtime Chat

Backend completo da aplicação de chat em tempo real, desenvolvido com **Node.js**, **TypeScript**, **PostgreSQL**, **Redis**, **Elasticsearch**, **Socket.IO** e **BullMQ**.

Sistema de chat empresarial com autenticação avançada (JWT + OAuth2 + 2FA), comunicação em tempo real via WebSocket, sistema de cache distribuído, busca avançada de mensagens, processamento assíncrono de tarefas e monitoramento completo com Prometheus.

---

## 📋 Índice

- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Setup](#-setup)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [API Documentation](#-api-documentation)
- [Testes](#-testes)
- [Monitoramento](#-monitoramento)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Status dos Módulos](#-status-dos-módulos)
- [Documentação Adicional](#-documentação-adicional)

---

## ✨ Funcionalidades

### 🔐 Autenticação e Segurança
- ✅ Registro e login com JWT (Access Token + Refresh Token)
- ✅ Autenticação de dois fatores (2FA/TOTP) com QR Code
- ✅ OAuth2 (Google, GitHub, Facebook)
- ✅ Rate limiting por IP e por usuário
- ✅ Proteção CSRF com tokens
- ✅ Helmet para headers de segurança
- ✅ Criptografia de dados sensíveis
- ✅ Validação de dados com Zod

### 💬 Chat em Tempo Real
- ✅ Mensagens em tempo real via Socket.IO
- ✅ Conversas 1:1 e grupos
- ✅ Status de presença (online/offline)
- ✅ Indicador de digitação (typing indicators)
- ✅ Histórico de mensagens com paginação
- ✅ Autenticação WebSocket com JWT

### 🔍 Busca e Cache
- ✅ Busca avançada de mensagens com Elasticsearch
- ✅ Busca de usuários por nome, email, username
- ✅ Cache distribuído com Redis
- ✅ Cache de usuários, conversas e contagens
- ✅ Invalidação automática de cache

### ⚡ Processamento Assíncrono
- ✅ Filas BullMQ para tarefas assíncronas
- ✅ Envio de emails em background
- ✅ Notificações push assíncronas
- ✅ Workers com retry automático
- ✅ Dashboard Bull Board para monitoramento

### 📊 Monitoramento e Observabilidade
- ✅ Métricas Prometheus (HTTP, WebSocket, DB, Cache, Queue)
- ✅ Logs estruturados com Winston
- ✅ Health check endpoint (/health)
- ✅ Endpoint de métricas (/metrics)
- ✅ Dashboard Swagger UI (/api-docs)

### 🧪 Qualidade de Código
- ✅ 52 testes automatizados (100% passing)
- ✅ Cobertura > 80%
- ✅ Testes unitários e de integração
- ✅ CI/CD com linting e type checking
- ✅ ESLint + Prettier

---

## 🛠️ Tecnologias

### Core
- **Node.js 18+** - Runtime JavaScript
- **TypeScript 5+** - Superset tipado do JavaScript
- **Express.js** - Framework web minimalista e rápido
- **Prisma ORM** - Type-safe database client

### Database & Cache
- **PostgreSQL** - Banco de dados relacional principal
- **Redis** - Cache distribuído e sessões
- **Elasticsearch** - Motor de busca full-text

### Real-time & Messaging
- **Socket.IO** - Comunicação bidirecional em tempo real
- **BullMQ** - Sistema de filas com Redis

### Security & Auth
- **JWT (jsonwebtoken)** - Tokens de autenticação
- **bcrypt** - Hash seguro de senhas
- **speakeasy** - 2FA/TOTP
- **qrcode** - Geração de QR codes para 2FA
- **Helmet** - Security headers
- **express-rate-limit** - Rate limiting

### Validation & Docs
- **Zod** - Schema validation com TypeScript
- **Swagger (OpenAPI 3.0)** - Documentação interativa da API
- **Postman Collection** - Collection completa para testes

### Monitoring & Logging
- **Winston** - Logging estruturado
- **prom-client** - Cliente Prometheus para métricas
- **Bull Board** - UI para monitorar filas BullMQ

### Testing
- **Jest** - Framework de testes
- **Supertest** - Testes de API HTTP
- **ts-jest** - Suporte TypeScript para Jest

---

## 🏗️ Arquitetura

```
┌─────────────────┐
│   Client Apps   │ (Web/Mobile)
└────────┬────────┘
         │
    ┌────▼─────────────────────────────────────┐
    │         Express API Server               │
    │  ┌────────────┬──────────────────────┐   │
    │  │ REST API   │   WebSocket (Socket.IO)│  │
    │  └────────────┴──────────────────────┘   │
    │  ┌──────────────────────────────────┐    │
    │  │     Middlewares Layer            │    │
    │  │ Auth│Rate Limit│CSRF│Metrics│Log │    │
    │  └──────────────────────────────────┘    │
    └────┬─────────┬──────────┬────────────┬───┘
         │         │          │            │
    ┌────▼───┐ ┌──▼────┐ ┌───▼──────┐ ┌───▼─────┐
    │Postgres│ │ Redis │ │Elasticsearch│ │ BullMQ │
    │   DB   │ │ Cache │ │   Search  │ │ Queues │
    └────────┘ └───────┘ └───────────┘ └─────────┘
         │         │          │            │
    ┌────▼─────────▼──────────▼────────────▼───┐
    │        Prisma ORM / Clients              │
    └───────────────────────────────────────────┘
```

### Estrutura de Diretórios

```
backend/
├── src/
│   ├── config/              # Configurações centralizadas
│   │   ├── database.ts      # Prisma client
│   │   ├── redis.ts         # Redis client
│   │   ├── elasticsearch.ts # Elasticsearch client
│   │   ├── socket.ts        # Socket.IO server
│   │   ├── swagger.ts       # OpenAPI spec
│   │   ├── metrics.ts       # Prometheus metrics
│   │   └── index.ts         # Exportações
│   │
│   ├── controllers/         # Controladores REST
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── chat.controller.ts
│   │   ├── search.controller.ts
│   │   ├── cache.controller.ts
│   │   ├── queue.controller.ts
│   │   ├── oauth.controller.ts
│   │   └── twoFactor.controller.ts
│   │
│   ├── services/            # Lógica de negócio
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── chat.service.ts
│   │   ├── elasticsearch.service.ts
│   │   ├── cache.service.ts
│   │   ├── oauth.service.ts
│   │   ├── twoFactor.service.ts
│   │   ├── email.service.ts
│   │   └── notification.service.ts
│   │
│   ├── middlewares/         # Middlewares Express
│   │   ├── auth.middleware.ts
│   │   ├── rateLimiter.ts
│   │   ├── csrf.middleware.ts
│   │   ├── security.ts
│   │   ├── errorHandler.ts
│   │   ├── requestLogger.ts
│   │   └── metrics.middleware.ts
│   │
│   ├── routes/              # Definição de rotas
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── chat.routes.ts
│   │   ├── search.routes.ts
│   │   ├── cache.routes.ts
│   │   ├── queue.routes.ts
│   │   ├── oauth.routes.ts
│   │   ├── twoFactor.routes.ts
│   │   └── index.ts
│   │
│   ├── websocket/           # Handlers WebSocket
│   │   ├── auth.middleware.ts
│   │   ├── chat.handlers.ts
│   │   └── presence.handlers.ts
│   │
│   ├── queue/               # BullMQ workers
│   │   ├── queues.ts
│   │   ├── workers.ts
│   │   ├── emailWorker.ts
│   │   └── notificationWorker.ts
│   │
│   ├── validators/          # Schemas Zod
│   │   ├── auth.validator.ts
│   │   ├── user.validator.ts
│   │   ├── chat.validator.ts
│   │   └── search.validator.ts
│   │
│   ├── utils/               # Utilitários
│   │   ├── jwt.ts
│   │   ├── encryption.ts
│   │   ├── logger.ts
│   │   └── validation.ts
│   │
│   ├── types/               # Tipos TypeScript
│   │   └── elasticsearch.types.ts
│   │
│   ├── scripts/             # Scripts de setup
│   │   ├── indexUsers.ts
│   │   └── indexMessages.ts
│   │
│   ├── __tests__/           # Testes automatizados
│   │   ├── setup.ts
│   │   ├── unit/            # Testes unitários
│   │   └── integration/     # Testes de integração
│   │
│   └── server.ts            # Entry point
│
├── prisma/
│   ├── schema.prisma        # Schema do banco de dados
│   └── migrations/          # Histórico de migrations
│
├── docs/                    # Documentação técnica
│   ├── AUTH_ADVANCED.md
│   ├── CACHE_REDIS.md
│   ├── CHAT_API.md
│   ├── QUEUE_ASYNC.md
│   ├── SEARCH_API.md
│   ├── SECURITY.md
│   ├── TESTING.md
│   └── WEBSOCKET_EVENTS.md
│
├── logs/                    # Logs da aplicação
├── Labzz-Chat-API.postman_collection.json
├── jest.config.js
├── tsconfig.json
├── nodemon.json
└── package.json
```

---

## 🚀 Setup

### Pré-requisitos

- **Node.js 18+**
- **npm ou yarn**
- **Docker e Docker Compose** (para PostgreSQL, Redis, Elasticsearch)

### Instalação

1. **Clone o repositório:**
```bash
git clone <repo-url>
cd labzz-realtime-chat/backend
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env
# Edite o .env com suas configurações
```

4. **Inicie os serviços do Docker** (na raiz do projeto):
```bash
cd ..
docker-compose up -d
cd backend
```

Serviços disponibilizados:
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- Elasticsearch: `localhost:9200`

5. **Execute as migrations do Prisma:**
```bash
npx prisma migrate dev
```

6. **Gere o Prisma Client:**
```bash
npx prisma generate
```

7. **(Opcional) Indexe dados no Elasticsearch:**
```bash
npm run index:users
npm run index:messages
```

### Rodando o Projeto

**Desenvolvimento (com hot reload):**
```bash
npm run dev
```

**Build de produção:**
```bash
npm run build
npm start
```

O servidor estará disponível em: `http://localhost:4000`

---

## 📜 Scripts Disponíveis

### Desenvolvimento
- `npm run dev` - Inicia servidor em modo desenvolvimento com Nodemon
- `npm run build` - Compila TypeScript para JavaScript (build de produção)
- `npm start` - Inicia servidor em produção (requer build)

### Testes
- `npm test` - Roda todos os testes (52 testes)
- `npm run test:watch` - Roda testes em watch mode
- `npm run test:coverage` - Gera relatório de cobertura de código

### Qualidade de Código
- `npm run lint` - Verifica código com ESLint
- `npm run lint:fix` - Corrige problemas automaticamente
- `npm run format` - Formata código com Prettier

### Database
- `npx prisma migrate dev` - Cria e aplica migrations
- `npx prisma generate` - Gera Prisma Client
- `npx prisma studio` - Abre Prisma Studio (GUI para o banco)

### Elasticsearch
- `npm run index:users` - Indexa usuários no Elasticsearch
- `npm run index:messages` - Indexa mensagens no Elasticsearch

---

## 📖 API Documentation

### Swagger UI (Interactive)
Acesse a documentação interativa da API:

🔗 **http://localhost:4000/api-docs**

Documentação completa com:
- Todos os endpoints REST
- Schemas de request/response
- Autenticação Bearer Token
- Try it out (testar diretamente no browser)

### Postman Collection
Importe a collection completa para testes:

📄 **`Labzz-Chat-API.postman_collection.json`**

Features:
- 15 requisições pré-configuradas
- Auto-extração de tokens (accessToken, refreshToken, userId)
- Variáveis de ambiente
- Testes automatizados

### Endpoints Principais

#### Authentication
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Login com email/senha
- `POST /api/auth/refresh` - Renovar access token
- `POST /api/auth/logout` - Logout (invalidar tokens)
- `GET /api/auth/me` - Obter usuário autenticado
- `GET /api/auth/csrf-token` - Obter token CSRF
- `POST /api/auth/verify-2fa` - Verificar código 2FA

#### Two-Factor Authentication
- `POST /api/2fa/setup` - Configurar 2FA (gera QR code)
- `POST /api/2fa/verify` - Verificar e ativar 2FA
- `POST /api/2fa/disable` - Desativar 2FA

#### OAuth2
- `GET /api/oauth/google` - Iniciar autenticação Google
- `GET /api/oauth/google/callback` - Callback Google
- `GET /api/oauth/github` - Iniciar autenticação GitHub
- `GET /api/oauth/github/callback` - Callback GitHub
- `GET /api/oauth/facebook` - Iniciar autenticação Facebook
- `GET /api/oauth/facebook/callback` - Callback Facebook

#### Users
- `GET /api/users` - Listar usuários (com paginação)
- `GET /api/users/:id` - Obter usuário por ID
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Deletar usuário

#### Chat
- `GET /api/chat/conversations` - Listar conversas do usuário
- `GET /api/chat/conversations/:id/messages` - Histórico de mensagens
- `POST /api/chat/messages` - Enviar mensagem (fallback REST)

#### Search
- `GET /api/search/messages?q={query}` - Buscar mensagens
- `GET /api/search/users?q={query}` - Buscar usuários

#### Cache
- `GET /api/cache/stats` - Estatísticas do cache Redis
- `DELETE /api/cache/clear` - Limpar todo o cache

#### Queue
- `GET /api/queue/stats` - Estatísticas das filas BullMQ
- `GET /api/queue/ui` - Acessar Bull Board UI

#### Health & Metrics
- `GET /health` - Health check (status dos serviços)
- `GET /metrics` - Métricas Prometheus

### WebSocket Events

#### Client → Server
- `chat:join` - Entrar em uma conversa
- `chat:leave` - Sair de uma conversa
- `chat:message` - Enviar mensagem
- `chat:typing:start` - Começar a digitar
- `chat:typing:stop` - Parar de digitar

#### Server → Client
- `chat:message` - Nova mensagem recebida
- `chat:typing` - Alguém está digitando
- `presence:update` - Atualização de status online/offline

---

## 🧪 Testes

### Executando Testes

```bash
# Todos os testes (52 testes, 7 suites)
npm test

# Watch mode (re-executa ao salvar)
npm run test:watch

# Cobertura de código
npm run test:coverage
```

### Estrutura de Testes

```
src/__tests__/
├── setup.ts                          # Configuração global
├── unit/                             # Testes unitários
│   ├── auth.service.test.ts         # 5 testes
│   ├── user.service.test.ts         # 4 testes
│   ├── chat.service.test.ts
│   └── ...
└── integration/                      # Testes de integração
    ├── auth.controller.test.ts      # 6 testes
    ├── user.controller.test.ts
    └── ...
```

### Cobertura Atual

- **Statements:** > 80%
- **Branches:** > 75%
- **Functions:** > 80%
- **Lines:** > 80%

**Status:** ✅ **52/52 testes passando (100%)**

---

## 📊 Monitoramento

### Health Check

Endpoint: `GET /health`

Resposta exemplo:
```json
{
  "status": "healthy",
  "timestamp": "2025-02-10T22:30:00Z",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "elasticsearch": "healthy"
  }
}
```

### Métricas Prometheus

Endpoint: `GET /metrics`

**Métricas coletadas:**

#### HTTP
- `labzz_chat_http_requests_total` - Total de requisições HTTP (por método, rota, status)
- `labzz_chat_http_request_duration_seconds` - Duração das requisições (histogram)

#### WebSocket
- `labzz_chat_websocket_connections_active` - Conexões WebSocket ativas (gauge)
- `labzz_chat_websocket_messages_total` - Total de mensagens WebSocket enviadas

#### Database
- `labzz_chat_database_queries_total` - Total de queries executadas
- `labzz_chat_database_query_duration_seconds` - Duração das queries

#### Cache (Redis)
- `labzz_chat_cache_hits_total` - Total de cache hits
- `labzz_chat_cache_misses_total` - Total de cache misses

#### Queue (BullMQ)
- `labzz_chat_queue_jobs_total` - Total de jobs processados (por queue, status)
- `labzz_chat_queue_job_duration_seconds` - Duração do processamento de jobs

#### System
- `labzz_chat_users_online` - Usuários online (gauge)
- `labzz_chat_messages_total` - Total de mensagens enviadas (counter)

#### Node.js (default metrics)
- CPU usage
- Memory usage (heap, RSS)
- Event loop lag
- GC statistics

### Logs

Logs estruturados com Winston em formato JSON.

**Níveis:**
- `error` - Erros críticos
- `warn` - Avisos
- `info` - Informações gerais
- `http` - Requisições HTTP
- `debug` - Debugging

**Localização:** `backend/logs/`

---

## 🔐 Variáveis de Ambiente

### Database
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/labzz_chat
```

### Server
```env
PORT=4000
NODE_ENV=development
```

### JWT
```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### Redis
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### Elasticsearch
```env
ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_USERNAME=
ELASTICSEARCH_PASSWORD=
```

### OAuth2 (Google)
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:4000/api/oauth/google/callback
```

### OAuth2 (GitHub)
```env
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:4000/api/oauth/github/callback
```

### OAuth2 (Facebook)
```env
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_CALLBACK_URL=http://localhost:4000/api/oauth/facebook/callback
```

### Email (SMTP)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@labzz.chat
```

### Security
```env
ENCRYPTION_KEY=your-32-character-encryption-key
CSRF_SECRET=your-csrf-secret-key
```

### CORS
```env
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

**⚠️ Importante:** Sempre use valores seguros em produção. Nunca commite secrets no Git.

---

## ✅ Status dos Módulos

### MÓDULO 1: Setup e Estrutura Inicial ✅
- ✅ Configuração Node.js + TypeScript
- ✅ Estrutura de pastas organizada
- ✅ ESLint + Prettier
- ✅ Variáveis de ambiente (.env)
- ✅ Prisma ORM

### MÓDULO 2: Servidor e Middlewares Básicos ✅
- ✅ Express.js configurado
- ✅ Middlewares de segurança (Helmet, CORS)
- ✅ Rate limiting
- ✅ Logging com Winston
- ✅ Error handling global

### MÓDULO 3: Autenticação JWT ✅
- ✅ Registro de usuários
- ✅ Login com JWT (Access + Refresh Token)
- ✅ Middleware de autenticação
- ✅ Refresh token endpoint
- ✅ Logout

### MÓDULO 4: Gerenciamento de Usuários ✅
- ✅ CRUD de usuários
- ✅ Perfis de usuário
- ✅ Validação com Zod
- ✅ Paginação e filtros

### MÓDULO 5: Chat em Tempo Real (WebSocket) ✅
- ✅ Socket.IO configurado
- ✅ Autenticação WebSocket
- ✅ Envio/recebimento de mensagens
- ✅ Conversas 1:1 e grupos
- ✅ Typing indicators
- ✅ Status de presença

### MÓDULO 6: Segurança Avançada ✅
- ✅ Proteção CSRF
- ✅ Rate limiting por usuário
- ✅ Criptografia de dados sensíveis
- ✅ Sanitização de inputs
- ✅ Headers de segurança (Helmet)

### MÓDULO 7: Autenticação Avançada ✅
- ✅ 2FA/TOTP com QR Code
- ✅ OAuth2 (Google, GitHub, Facebook)
- ✅ Múltiplos provedores de autenticação

### MÓDULO 8: Cache com Redis ✅
- ✅ Cliente Redis configurado
- ✅ Cache de usuários
- ✅ Cache de conversas
- ✅ Invalidação de cache
- ✅ Estatísticas de cache

### MÓDULO 9: Busca com Elasticsearch ✅
- ✅ Cliente Elasticsearch
- ✅ Indexação de usuários
- ✅ Indexação de mensagens
- ✅ Busca full-text
- ✅ Filtros e paginação

### MÓDULO 10: Filas BullMQ ✅
- ✅ Configuração BullMQ
- ✅ Fila de emails
- ✅ Fila de notificações
- ✅ Workers com retry
- ✅ Bull Board UI

### MÓDULO 11: Testes ✅
- ✅ Jest + Supertest
- ✅ Testes unitários (auth, user, chat)
- ✅ Testes de integração (controllers)
- ✅ Cobertura > 80%
- ✅ 52/52 testes passando

### MÓDULO 12: Documentação e Observabilidade ✅
- ✅ Swagger/OpenAPI 3.0
- ✅ Postman Collection
- ✅ Health check endpoint
- ✅ Métricas Prometheus
- ✅ README backend completo

---

## 📚 Documentação Adicional

### Documentação Técnica (docs/)
- [AUTH_ADVANCED.md](./docs/AUTH_ADVANCED.md) - 2FA, OAuth2, segurança avançada
- [CACHE_REDIS.md](./docs/CACHE_REDIS.md) - Estratégias de cache com Redis
- [CHAT_API.md](./docs/CHAT_API.md) - API REST e WebSocket do chat
- [QUEUE_ASYNC.md](./docs/QUEUE_ASYNC.md) - Sistema de filas BullMQ
- [SEARCH_API.md](./docs/SEARCH_API.md) - API de busca com Elasticsearch
- [SECURITY.md](./docs/SECURITY.md) - Práticas de segurança
- [TESTING.md](./docs/TESTING.md) - Guia de testes
- [WEBSOCKET_EVENTS.md](./docs/WEBSOCKET_EVENTS.md) - Eventos Socket.IO

### Roadmap e Arquitetura
- [BACKEND_ROADMAP.md](../BACKEND_ROADMAP.md) - Roadmap completo do backend
- [ARCHITECTURE.md](../docs/ARCHITECTURE.md) - Arquitetura do sistema

### API
- **Swagger UI:** http://localhost:4000/api-docs
- **Postman Collection:** `Labzz-Chat-API.postman_collection.json`

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📝 License

Este projeto está sob a licença MIT.

---

## 👥 Equipe

Desenvolvido com ❤️ pela equipe **Labzz**

---

## 🆘 Suporte

- 📧 Email: support@labzz.chat
- 📚 Documentação: http://localhost:4000/api-docs
- 🐛 Issues: [GitHub Issues]

---

**Status:** ✅ **Backend 100% funcional e testado**
