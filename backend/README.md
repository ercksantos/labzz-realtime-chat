# 🔧 Backend - Labzz Chat

Backend da aplicação de chat em tempo real desenvolvido com Node.js, TypeScript e PostgreSQL.

## 🚀 Setup

### Pré-requisitos
- Node.js 18+
- Docker e Docker Compose (para PostgreSQL, Redis, Elasticsearch)

### Instalação

1. **Instale as dependências:**
```bash
npm install
```

2. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env
# Edite o .env com suas configurações
```

3. **Inicie os serviços do Docker** (na raiz do projeto):
```bash
cd ..
docker-compose up -d
cd backend
```

4. **Execute as migrations do Prisma:**
```bash
npx prisma migrate dev
```

5. **Gere o Prisma Client:**
```bash
npx prisma generate
```

### Rodando o Projeto

**Desenvolvimento:**
```bash
npm run dev
```

**Build:**
```bash
npm run build
npm start
```

## 📁 Estrutura

```
backend/
├── src/
│   ├── config/          # Configurações (database, redis, etc)
│   ├── controllers/     # Controladores REST
│   ├── middlewares/     # Middlewares (auth, error, etc)
│   ├── models/          # Models/Schemas
│   ├── routes/          # Rotas da API
│   ├── services/        # Lógica de negócio
│   ├── utils/           # Funções utilitárias
│   ├── types/           # Tipos TypeScript
│   ├── validators/      # Validações Zod
│   ├── websocket/       # Socket.io handlers
│   ├── queue/           # Filas BullMQ
│   ├── __tests__/       # Testes
│   └── server.ts        # Entry point
├── prisma/
│   └── schema.prisma    # Schema do banco
└── package.json
```

## 🛠️ Scripts Disponíveis

- `npm run dev` - Inicia servidor em modo desenvolvimento
- `npm run build` - Compila TypeScript para JavaScript
- `npm start` - Inicia servidor em produção
- `npm test` - Roda testes
- `npm run test:watch` - Roda testes em watch mode
- `npm run test:coverage` - Gera relatório de cobertura
- `npm run lint` - Verifica código com ESLint
- `npm run lint:fix` - Corrige problemas automaticamente
- `npm run format` - Formata código com Prettier

## 📦 Tecnologias

- **Node.js** - Runtime JavaScript
- **TypeScript** - Superset tipado do JavaScript
- **Prisma** - ORM para PostgreSQL
- **Express** - Framework web (próxima etapa)
- **Socket.io** - WebSocket para tempo real (próxima etapa)
- **Redis** - Cache e sessões (próxima etapa)
- **Elasticsearch** - Motor de busca (próxima etapa)

## 🧪 Testes

```bash
# Rodar todos os testes
npm test

# Watch mode
npm run test:watch

# Cobertura
npm run test:coverage
```

## 🔐 Variáveis de Ambiente

Veja [.env.example](./.env.example) para lista completa de variáveis.

Principais:
- `PORT` - Porta do servidor (padrão: 4000)
- `DATABASE_URL` - URL de conexão PostgreSQL
- `JWT_SECRET` - Secret para tokens JWT
- `REDIS_HOST` - Host do Redis
- `ELASTICSEARCH_NODE` - URL do Elasticsearch

## 📝 Status

**MÓDULO 1: Setup e Estrutura** ✅
- [x] Node.js + TypeScript
- [x] Estrutura de pastas
- [x] ESLint + Prettier
- [x] Variáveis de ambiente
- [x] Prisma ORM

**MÓDULO 2: Servidor e Middlewares** 🔄
- [ ] Express/Fastify
- [ ] Middlewares de segurança
- [ ] Rate limiting
- [ ] Logging
- [ ] Tratamento de erros

## 📚 Documentação

- [Roadmap Backend](../BACKEND_ROADMAP.md)
- [Arquitetura](../docs/ARCHITECTURE.md)
- Swagger/OpenAPI (em breve)

---

Desenvolvido com ❤️ pela equipe Labzz
