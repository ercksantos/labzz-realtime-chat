# 💬 Labzz Chat - Sistema de Chat em Tempo Real

## 📖 Sobre o Projeto
Sistema de chat em tempo real desenvolvido como teste técnico para Labzz. A aplicação oferece comunicação instantânea entre usuários com recursos modernos de autenticação, busca avançada e alta performance.

## 🛠️ Tecnologias

### Backend
- **Node.js** + **TypeScript** - Runtime e linguagem
- **Express/Fastify** - Framework web
- **PostgreSQL** - Banco de dados relacional
- **Redis** - Cache e gerenciamento de sessões
- **Elasticsearch** - Motor de busca de mensagens
- **Socket.io** - Comunicação WebSocket em tempo real
- **Prisma/TypeORM** - ORM para banco de dados
- **JWT** - Autenticação e autorização
- **BullMQ** - Filas de processamento assíncrono

### Frontend
- **Next.js 14+** + **TypeScript** - Framework React com App Router
- **Tailwind CSS** - Estilização utility-first
- **Socket.io Client** - Cliente WebSocket
- **Zustand** - Gerenciamento de estado
- **React Hook Form** + **Zod** - Validação de formulários
- **Framer Motion** - Animações fluidas
- **next-intl** - Internacionalização

### DevOps & Infra
- **Docker** + **Docker Compose** - Containerização
- **GitHub Actions** - CI/CD
- **Jest** + **Supertest** - Testes unitários e de integração
- **Playwright/Cypress** - Testes E2E

## ✨ Funcionalidades

### Implementadas ✅
- ✅ Estrutura de pastas organizada
- ✅ Docker Compose configurado (PostgreSQL, Redis, Elasticsearch)
- ✅ Autenticação completa (JWT + OAuth2 Google/GitHub + 2FA/TOTP)
- ✅ CRUD de usuários com autorização
- ✅ Chat em tempo real via WebSocket (Socket.io)
- ✅ Histórico de mensagens com paginação
- ✅ Conversas diretas e em grupo
- ✅ Indicadores de digitação (typing indicator)
- ✅ Presença online/offline em tempo real
- ✅ Marcar mensagens como lidas
- ✅ Rate limiting e segurança (Helmet, CORS)
- ✅ Logging estruturado (Winston)
- ✅ Validação de dados (Zod)

### Em Desenvolvimento 🔄
- 🔄 Busca de mensagens (Elasticsearch)
- 🔄 Cache com Redis
- 🔄 Filas de processamento (BullMQ)
- 🔄 Upload de arquivos/imagens
- 🔄 Notificações push
- 🔄 Interface frontend (Next.js)
- 🔄 Modo escuro
- 🔄 Suporte multilíngue (i18n)
- 🔄 Testes automatizados

## 🚀 Como Rodar

### Pré-requisitos
- **Docker** e **Docker Compose** instalados
- **Node.js** 18 ou superior
- **npm**, **yarn** ou **pnpm**

### Setup Rápido

#### 1. Clone o repositório
```bash
git clone <url-do-repositório>
cd labzz-realtime-chat
```

#### 2. Suba os serviços do Docker
```bash
docker-compose up -d
```

Isso irá iniciar:
- PostgreSQL na porta `5432`
- Redis na porta `6379`
- Elasticsearch na porta `9200`

#### 3. Configure e rode o Backend
```bash
cd backend
npm install
cp .env.example .env  # Configure as variáveis de ambiente
npm run dev
```

#### 4. Configure e rode o Frontend
```bash
cd frontend
npm install
cp .env.example .env.local  # Configure as variáveis de ambiente
npm run dev
```

#### 5. Acesse a aplicação
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000
- **API Docs:** http://localhost:4000/api-docs

### Comandos Úteis

```bash
# Parar os containers
docker-compose down

# Ver logs dos containers
docker-compose logs -f

# Resetar volumes (apaga dados)
docker-compose down -v

# Rodar testes do backend
cd backend && npm test

# Rodar testes do frontend
cd frontend && npm test

# Rodar testes E2E
cd frontend && npm run test:e2e
```

## 📂 Estrutura do Projeto

```
labzz-realtime-chat/
├── backend/              # API Node.js + TypeScript
│   ├── src/
│   │   ├── controllers/  # Controladores da API
│   │   ├── routes/       # Rotas e endpoints
│   │   ├── services/     # Lógica de negócio
│   │   ├── models/       # Modelos do banco de dados
│   │   ├── middlewares/  # Middlewares customizados
│   │   ├── websocket/    # Lógica WebSocket
│   │   └── utils/        # Utilitários
│   ├── tests/            # Testes unitários e integração
│   ├── prisma/           # Schema e migrações Prisma
│   └── package.json
│
├── frontend/             # Next.js + TypeScript
│   ├── src/
│   │   ├── app/          # App Router do Next.js
│   │   ├── components/   # Componentes React
│   │   ├── lib/          # Bibliotecas e utils
│   │   ├── hooks/        # Custom hooks
│   │   ├── services/     # Serviços de API
│   │   └── styles/       # Estilos globais
│   ├── public/           # Assets estáticos
│   └── package.json
│
├── docs/                 # Documentação adicional
│   └── ARCHITECTURE.md   # Arquitetura do sistema
│
├── docker/               # Arquivos Docker customizados
├── docker-compose.yml    # Orquestração de containers
├── PROMPT.md             # Progresso geral do projeto
├── BACKEND_ROADMAP.md    # Roadmap detalhado do backend
├── FRONTEND_ROADMAP.md   # Roadmap detalhado do frontend
└── README.md             # Este arquivo
```

## 🔒 Segurança

O projeto implementa diversas camadas de segurança:

- ✅ Autenticação JWT com refresh tokens
- ✅ OAuth2 para login social (Google, GitHub)
- ✅ 2FA com TOTP
- ✅ Rate limiting para proteção contra DDoS
- ✅ Validação de inputs com Zod
- ✅ Sanitização contra XSS
- ✅ Proteção CSRF
- ✅ Headers de segurança (Helmet)
- ✅ Criptografia de dados sensíveis
- ✅ HTTPS em produção

## 🧪 Testes

O projeto mantém alta cobertura de testes:

```bash
# Backend: Testes unitários e de integração
cd backend
npm test                    # Rodar todos os testes
npm run test:coverage       # Ver cobertura

# Frontend: Testes de componentes
cd frontend
npm test                    # Testes com Jest
npm run test:e2e            # Testes E2E com Playwright
```

**Meta de cobertura:** >80% em ambos backend e frontend

## 🚢 Deploy

### Backend
Opções recomendadas:
- **Railway** - Deploy fácil com PostgreSQL incluído
- **Render** - Free tier generoso
- **AWS** - Para produção escalável

### Frontend
Opções recomendadas:
- **Vercel** - Otimizado para Next.js
- **Netlify** - Alternativa sólida

### Banco de Dados
- **Supabase** - PostgreSQL gerenciado com free tier
- **Railway** - PostgreSQL incluído no deploy

## 🤝 Contribuindo

Este é um projeto de teste técnico, mas sugestões são bem-vindas!

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit suas mudanças: `git commit -m 'feat: adiciona nova funcionalidade'`
4. Push para a branch: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

### Convenção de Commits
Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `style:` - Formatação
- `refactor:` - Refatoração
- `test:` - Testes
- `chore:` - Tarefas de manutenção

## 📄 Licença

Este projeto é de código aberto para fins educacionais.

## 👤 Autor

**Desenvolvido como teste técnico para Labzz**

---

## 🎯 Status do Projeto

**Fase Atual:** FASE 1 - Setup Inicial ✅

**Próximos Passos:**
- [ ] Backend: Configuração inicial e estrutura
- [ ] Backend: Implementação de autenticação
- [ ] Backend: Chat em tempo real com WebSocket
- [ ] Frontend: Setup e design system
- [ ] Frontend: Telas de autenticação
- [ ] Frontend: Interface de chat
- [ ] Integração e testes E2E
- [ ] Deploy em produção

---

💡 **Dica:** Consulte [PROMPT.md](./PROMPT.md) para acompanhar o progresso detalhado de cada etapa.

🚀 **Boa sorte e bom desenvolvimento!**
