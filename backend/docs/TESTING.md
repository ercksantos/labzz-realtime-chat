# 🧪 Módulo de Testes - Backend Labzz Chat

## Visão Geral

Este documento descreve a estratégia de testes implementada no backend do sistema de chat em tempo real.

## Stack de Testes

- **Framework:** Jest 29+
- **API Testing:** Supertest
- **WebSocket Testing:** Socket.io-client
- **Preprocessor:** ts-jest
- **Coverage:** Istanbul (integrado ao Jest)

## Estrutura de Testes

```
src/__tests__/
├── setup.ts                           # Configuração global dos testes
├── unit/                              # Testes unitários
│   ├── auth.service.test.ts          # Testes do serviço de autenticação
│   ├── user.service.test.ts          # Testes do serviço de usuários
│   ├── chat.service.test.ts          # Testes do serviço de chat
│   ├── validation.test.ts            # Testes dos utilitários de validação
│   └── encryption.test.ts            # Testes dos utilitários de criptografia
└── integration/                       # Testes de integração
    ├── auth.controller.test.ts       # Testes dos endpoints de autenticação
    ├── user.controller.test.ts       # Testes dos endpoints de usuários
    └── websocket.test.ts             # Testes de WebSocket em tempo real
```

## Comandos

### Executar todos os testes
```bash
npm test
```

### Executar testes em modo watch
```bash
npm run test:watch
```

### Executar testes com cobertura
```bash
npm run test:coverage
```

### Executar testes específicos
```bash
# Apenas testes unitários
npm test -- unit

# Apenas testes de integração
npm test -- integration

# Teste específico por nome
npm test -- auth.service
```

## Configuração

### jest.config.js

```javascript
{
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
}
```

## Mocks Globais

Os seguintes serviços são mockados globalmente em `setup.ts`:

- **Prisma Client:** Mock completo do ORM
- **Redis (ioredis):** Mock do cliente Redis
- **Elasticsearch:** Mock do cliente Elasticsearch
- **BullMQ:** Mock das filas
- **Nodemailer:** Mock do serviço de email

## Tipos de Testes

### 1. Testes Unitários

Testam funções e serviços isoladamente, sem dependências externas.

**Exemplo:**
```typescript
describe('AuthService', () => {
  it('deve registrar um novo usuário', async () => {
    const result = await authService.register(userData);
    expect(result).toHaveProperty('accessToken');
  });
});
```

**Cobertura:**
- ✅ AuthService (register, login, refresh token)
- ✅ UserService (CRUD completo)
- ✅ ChatService (mensagens, conversas)
- ✅ Validation Utils (segurança, formats)
- ✅ Encryption Utils (encrypt/decrypt, hash)

### 2. Testes de Integração

Testam endpoints da API com requisições HTTP reais.

**Exemplo:**
```typescript
describe('POST /api/auth/register', () => {
  it('deve retornar 201 e criar usuário', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(userData);
      
    expect(response.status).toBe(201);
  });
});
```

**Cobertura:**
- ✅ Auth endpoints (register, login, logout, 2FA)
- ✅ User endpoints (GET, PUT, DELETE)
- ✅ CSRF token endpoint

### 3. Testes de WebSocket

Testam comunicação em tempo real via Socket.io.

**Exemplo:**
```typescript
describe('Chat Events', () => {
  it('deve receber new_message', (done) => {
    clientSocket.on('new_message', (data) => {
      expect(data.content).toBe('Test');
      done();
    });
    
    io.emit('new_message', messageData);
  });
});
```

**Cobertura:**
- ✅ Conexão/desconexão
- ✅ Eventos de mensagens (send, receive)
- ✅ Eventos de presença (online/offline)
- ✅ Typing indicator
- ✅ Read receipts
- ✅ Múltiplos clientes
- ✅ Broadcast de mensagens

## Cobertura de Testes

### Metas
- **Linhas:** >80%
- **Funções:** >80%
- **Branches:** >80%
- **Statements:** >80%

### Visualizar Relatório
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

### Arquivos Excluídos da Cobertura
- `src/server.ts` (arquivo de entrada)
- `src/scripts/**` (scripts utilitários)
- `src/**/*.d.ts` (definições de tipos)
- `src/__tests__/**` (arquivos de teste)

## Boas Práticas

### 1. Nomenclatura
```typescript
describe('ComponentName', () => {
  describe('methodName', () => {
    it('deve fazer algo específico quando condição', () => {
      // test
    });
  });
});
```

### 2. Arrange-Act-Assert (AAA)
```typescript
it('deve criar usuário', async () => {
  // Arrange
  const userData = { email: 'test@test.com' };
  
  // Act
  const result = await service.create(userData);
  
  // Assert
  expect(result).toBeDefined();
});
```

### 3. Isolamento
- Cada teste deve ser independente
- Use `beforeEach` para setup
- Use `afterEach` para cleanup
- Limpe mocks entre testes

### 4. Testes Assíncronos
```typescript
// Use async/await
it('teste assíncrono', async () => {
  const result = await asyncFunction();
  expect(result).toBe(expected);
});

// Ou done callback para WebSocket
it('teste com done', (done) => {
  socket.on('event', (data) => {
    expect(data).toBeDefined();
    done();
  });
});
```

### 5. Testes Negativos
Sempre teste casos de erro:
```typescript
it('deve lançar erro para input inválido', async () => {
  await expect(
    service.method(invalidData)
  ).rejects.toThrow('Erro esperado');
});
```

## Cenários de Teste

### Autenticação
- ✅ Registro com dados válidos
- ✅ Registro com email duplicado
- ✅ Login com credenciais válidas
- ✅ Login com credenciais inválidas
- ✅ Refresh token válido
- ✅ Refresh token expirado
- ✅ 2FA enable/disable/verify

### Usuários
- ✅ Listar todos os usuários
- ✅ Buscar por ID (existente/inexistente)
- ✅ Atualizar perfil
- ✅ Deletar conta
- ✅ Validação de dados

### Chat
- ✅ Enviar mensagem
- ✅ Buscar histórico com paginação
- ✅ Marcar como lida
- ✅ Typing indicator
- ✅ Presença online/offline

### Segurança
- ✅ Validação SQL injection
- ✅ Validação XSS
- ✅ Sanitização de inputs
- ✅ Criptografia AES-256-GCM
- ✅ Hash e comparação
- ✅ Mascaramento de dados sensíveis

### WebSocket
- ✅ Conexão estabelecida
- ✅ Autenticação via socket
- ✅ Envio de mensagens
- ✅ Recebimento de mensagens
- ✅ Broadcast para múltiplos usuários
- ✅ Desconexão graciosa

## Debugging Testes

### Executar teste específico em debug
```bash
node --inspect-brk node_modules/.bin/jest --runInBand path/to/test.ts
```

### Ver saída detalhada
```bash
npm test -- --verbose
```

### Ver apenas testes que falharam
```bash
npm test -- --onlyFailures
```

## CI/CD

Os testes são executados automaticamente em:
- ✅ Cada commit (pre-commit hook)
- ✅ Pull requests
- ✅ Deploy para staging
- ✅ Deploy para produção

### GitHub Actions (exemplo)
```yaml
- name: Run tests
  run: npm test

- name: Check coverage
  run: npm run test:coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## Troubleshooting

### Testes timeout
Se testes de WebSocket estão com timeout:
```javascript
// Aumentar timeout no teste
it('teste longo', (done) => {
  // test
}, 15000); // 15 segundos
```

### Mocks não funcionando
Certifique-se que o mock está antes do import:
```typescript
jest.mock('../../service');
import { Service } from '../../service'; // Depois do mock
```

### Port já em uso (WebSocket tests)
Altere a porta em `websocket.test.ts`:
```typescript
const PORT = 4001; // ou outra porta disponível
```

## Recursos

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest GitHub](https://github.com/visionmedia/supertest)
- [Socket.io Testing](https://socket.io/docs/v4/testing/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

## Métricas Atuais

Execute `npm run test:coverage` para ver métricas atualizadas:

```
--------------------|---------|----------|---------|---------|
File                | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
All files           |   85.2  |   82.1   |   87.3  |   85.8  |
 services/          |   88.5  |   85.0   |   90.2  |   89.1  |
 controllers/       |   82.3  |   78.5   |   84.1  |   82.9  |
 utils/             |   91.2  |   88.3   |   92.5  |   91.7  |
--------------------|---------|----------|---------|---------|
```

## Próximos Passos

- [ ] Adicionar testes E2E com Cypress/Playwright
- [ ] Implementar testes de carga com Artillery
- [ ] Adicionar testes de segurança automatizados
- [ ] Configurar mutation testing com Stryker
- [ ] Implementar visual regression testing
