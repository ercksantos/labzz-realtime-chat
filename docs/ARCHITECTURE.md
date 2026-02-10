# 🏗️ Arquitetura do Sistema - Labzz Chat

## 📋 Visão Geral

O **Labzz Chat** é um sistema de chat em tempo real construído com arquitetura **cliente-servidor** moderna, escalável e segura. A aplicação utiliza WebSocket para comunicação bidirecional instantânea, permitindo troca de mensagens em tempo real entre múltiplos usuários conectados simultaneamente.

## 🎯 Principais Características

- **Real-time**: Comunicação instantânea via WebSocket (Socket.io)
- **Escalável**: Arquitetura preparada para crescimento horizontal
- **Segura**: Múltiplas camadas de segurança e autenticação
- **Performática**: Cache em Redis e indexação Elasticsearch
- **Resiliente**: Filas de processamento assíncrono com BullMQ
- **Observável**: Logging estruturado e métricas de performance

---

## 🧩 Componentes da Arquitetura

### 1. Frontend (Next.js)

**Tecnologias:**
- Next.js 14+ com App Router
- TypeScript
- Tailwind CSS
- Socket.io Client
- Zustand (gerenciamento de estado)

**Responsabilidades:**
- Interface do usuário responsiva e acessível
- Comunicação WebSocket em tempo real
- Autenticação e gerenciamento de sessão
- Otimização de performance (code splitting, lazy loading)
- Gerenciamento de estado local e global

**Estrutura:**
```
frontend/
├── src/
│   ├── app/              # Pages (App Router)
│   ├── components/       # Componentes React
│   ├── lib/              # Bibliotecas e configurações
│   ├── hooks/            # Custom hooks
│   ├── services/         # Serviços de API
│   ├── stores/           # Stores Zustand
│   └── utils/            # Funções utilitárias
```

---

### 2. Backend (Node.js + TypeScript)

**Tecnologias:**
- Node.js 18+
- TypeScript
- Express/Fastify
- Socket.io (servidor WebSocket)
- Prisma/TypeORM (ORM)

**Responsabilidades:**
- API REST para operações CRUD
- WebSocket server para comunicação em tempo real
- Autenticação e autorização (JWT + OAuth2 + 2FA)
- Validação e sanitização de dados
- Lógica de negócio
- Integração com serviços externos

**Estrutura:**
```
backend/
├── src/
│   ├── controllers/      # Controladores da API
│   ├── routes/           # Definição de rotas
│   ├── services/         # Lógica de negócio
│   ├── models/           # Modelos de dados
│   ├── middlewares/      # Middlewares customizados
│   ├── websocket/        # Lógica WebSocket
│   ├── validators/       # Validadores Zod
│   ├── queues/           # Workers BullMQ
│   └── utils/            # Utilitários
```

---

### 3. Banco de Dados (PostgreSQL)

**Responsabilidades:**
- Persistência de dados estruturados
- Integridade referencial
- Transações ACID
- Suporte a queries complexas

**Principais Tabelas:**
- `users` - Dados dos usuários
- `messages` - Mensagens trocadas
- `conversations` - Conversas/canais
- `conversation_participants` - Participantes das conversas
- `user_sessions` - Sessões ativas
- `oauth_connections` - Conexões OAuth

---

### 4. Cache (Redis)

**Responsabilidades:**
- Cache de dados frequentemente acessados
- Gerenciamento de sessões
- Rate limiting
- Pub/Sub para comunicação entre instâncias
- Armazenamento de dados temporários (ex: códigos 2FA)

**Casos de Uso:**
- Sessões de usuários autenticados
- Lista de usuários online
- Cache de perfis de usuário
- Controle de taxa (rate limiting)
- Fila de jobs (BullMQ)

---

### 5. Motor de Busca (Elasticsearch)

**Responsabilidades:**
- Indexação de mensagens
- Busca full-text
- Busca de usuários
- Análise e autocomplete

**Índices:**
- `messages` - Todas as mensagens enviadas
- `users` - Dados de usuários para busca

---

### 6. Fila de Processamento (BullMQ + Redis)

**Responsabilidades:**
- Processamento assíncrono de tarefas
- Retry automático em caso de falha
- Agendamento de jobs
- Background processing

**Jobs:**
- Envio de emails
- Processamento de uploads
- Indexação no Elasticsearch
- Geração de relatórios
- Limpeza de dados antigos

---

## 🔄 Fluxo de Dados

### Fluxo de Autenticação

```
1. Usuário acessa /login (Frontend)
2. Frontend envia credenciais para POST /auth/login (Backend)
3. Backend valida credenciais no PostgreSQL
4. Backend gera JWT e armazena sessão no Redis
5. Backend retorna JWT para Frontend
6. Frontend armazena JWT e redireciona para /chat
```

### Fluxo de Envio de Mensagem

```
1. Usuário digita mensagem no chat (Frontend)
2. Frontend emite evento 'send_message' via WebSocket
3. Backend recebe evento no Socket.io
4. Backend valida mensagem e autenticação
5. Backend salva mensagem no PostgreSQL
6. Backend enfileira job de indexação (BullMQ)
7. Backend emite 'new_message' para destinatário(s) via WebSocket
8. Worker processa job e indexa mensagem no Elasticsearch
9. Frontend recebe 'new_message' e atualiza UI
```

### Fluxo de Busca de Mensagens

```
1. Usuário digita termo de busca (Frontend)
2. Frontend envia GET /messages/search?q=termo (Backend)
3. Backend consulta Elasticsearch
4. Elasticsearch retorna resultados relevantes
5. Backend formata e retorna resultados
6. Frontend exibe resultados na UI
```

---

## 🔐 Segurança

### Camadas de Segurança

**1. Autenticação Multi-fator**
- JWT com access token (curta duração) e refresh token
- OAuth2 (Google, GitHub)
- 2FA com TOTP (Google Authenticator)

**2. Autorização**
- Role-based access control (RBAC)
- Políticas de permissão por recurso
- Validação de ownership

**3. Proteções contra Ataques**
- **SQL Injection**: Uso de ORM (Prisma/TypeORM)
- **XSS**: Sanitização de inputs com bibliotecas especializadas
- **CSRF**: Tokens CSRF em operações sensíveis
- **DDoS**: Rate limiting por IP/usuário
- **Brute Force**: Rate limiting em endpoints de login

**4. Comunicação Segura**
- HTTPS obrigatório em produção
- WebSocket sobre TLS (WSS)
- Headers de segurança (Helmet)

**5. Dados Sensíveis**
- Senhas hasheadas com bcrypt
- Dados sensíveis criptografados no banco
- Secrets em variáveis de ambiente

---

## 📊 Escalabilidade

### Estratégias de Escalabilidade

**1. Escalabilidade Horizontal**
- Múltiplas instâncias do backend atrás de load balancer
- Redis Pub/Sub para sincronização entre instâncias
- Sticky sessions para WebSocket

**2. Cache Inteligente**
- Cache de queries frequentes no Redis
- Cache de respostas HTTP
- Cache de sessões

**3. Database Optimization**
- Índices otimizados
- Connection pooling
- Read replicas (futuro)

**4. CDN e Assets**
- Assets estáticos servidos via CDN
- Compressão de imagens
- Code splitting no frontend

---

## 🚀 Deploy e Infraestrutura

### Arquitetura de Deploy

```
┌─────────────────────────────────────────────────────────┐
│                        INTERNET                          │
└───────────────────────┬─────────────────────────────────┘
                        │
            ┌───────────▼──────────┐
            │    Load Balancer     │
            │      (Nginx)         │
            └───────────┬──────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────▼──────┐ ┌─────▼──────┐ ┌─────▼──────┐
│   Frontend   │ │  Backend   │ │  Backend   │
│  (Vercel)    │ │  Instance1 │ │  Instance2 │
└──────────────┘ └─────┬──────┘ └─────┬──────┘
                       │               │
        ┌──────────────┼───────────────┘
        │              │
┌───────▼──────┐ ┌────▼─────┐ ┌──────────────┐
│  PostgreSQL  │ │  Redis   │ │ Elasticsearch│
│  (Supabase)  │ │ (Cloud)  │ │   (Cloud)    │
└──────────────┘ └──────────┘ └──────────────┘
```

### Ambientes

**Desenvolvimento:**
- Docker Compose local
- Hot reload habilitado
- Dados de teste

**Staging:**
- Réplica do ambiente de produção
- Testes finais antes do deploy

**Produção:**
- Frontend: Vercel/Netlify
- Backend: Railway/Render/AWS
- Database: Supabase/Railway
- Cache: Redis Cloud
- Search: Elastic Cloud

---

## 📈 Monitoramento e Observabilidade

### Logging

**Backend:**
- Winston/Pino para logs estruturados
- Níveis: error, warn, info, debug
- Formato JSON para análise

**Frontend:**
- Sentry para error tracking
- Analytics de uso

### Métricas

- Latência de requisições
- Taxa de erros
- Usuários ativos
- Mensagens por segundo
- Performance do WebSocket

### Health Checks

- `/health` - Status geral da API
- `/health/db` - Conexão com PostgreSQL
- `/health/redis` - Conexão com Redis
- `/health/elasticsearch` - Conexão com Elasticsearch

---

## 🧪 Testes

### Estratégia de Testes

**Backend:**
- **Unitários**: Lógica de negócio isolada (Jest)
- **Integração**: Endpoints da API (Supertest)
- **E2E**: Fluxos completos (Playwright)

**Frontend:**
- **Unitários**: Funções utilitárias (Jest)
- **Componentes**: Renderização e interação (React Testing Library)
- **E2E**: Fluxos de usuário (Playwright/Cypress)

**Meta de Cobertura:** >80%

---

## 🔮 Melhorias Futuras

### Fase 2 (Opcional)
- [ ] Chat em grupo e canais
- [ ] Chamadas de voz/vídeo (WebRTC)
- [ ] Compartilhamento de tela
- [ ] Reações e threads
- [ ] Integração com LLM (ChatGPT)

### Fase 3 (Longo Prazo)
- [ ] App mobile React Native
- [ ] Desktop app (Electron)
- [ ] Webhooks para integrações
- [ ] API pública com rate limiting
- [ ] Marketplace de plugins

---

## 📚 Referências

### Documentação Oficial
- [Next.js](https://nextjs.org/docs)
- [Socket.io](https://socket.io/docs/v4/)
- [Prisma](https://www.prisma.io/docs)
- [PostgreSQL](https://www.postgresql.org/docs/)
- [Redis](https://redis.io/docs/)
- [Elasticsearch](https://www.elastic.co/guide/index.html)

### Padrões e Boas Práticas
- [Clean Code](https://github.com/ryanmcdermott/clean-code-javascript)
- [REST API Best Practices](https://restfulapi.net/)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [Security Best Practices](https://owasp.org/www-project-top-ten/)

---

## 📝 Notas Finais

Esta arquitetura foi projetada para ser:
- ✅ **Escalável** - Cresce conforme a demanda
- ✅ **Manutenível** - Código limpo e bem organizado
- ✅ **Segura** - Múltiplas camadas de proteção
- ✅ **Performática** - Otimizações em todos os níveis
- ✅ **Observável** - Logs e métricas para debugging

A documentação será atualizada conforme o projeto evolui.

---

**Última atualização:** Fevereiro 2026  
**Versão:** 1.0.0  
**Autor:** Time Labzz
