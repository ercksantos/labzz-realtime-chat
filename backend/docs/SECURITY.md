# 🔒 Módulo de Segurança - Backend Labzz Chat

## Visão Geral

Este documento descreve todas as medidas de segurança implementadas no backend do sistema de chat em tempo real.

## 1. Sanitização de Inputs

### Implementação
- **Biblioteca:** `express-validator`, `validator`
- **Middleware:** `sanitizeInputs` em `middlewares/security.ts`
- **Utilitários:** `utils/validation.ts`

### O que faz
- Remove caracteres especiais perigosos de todos os inputs
- Normaliza espaços em branco
- Escapa HTML entities
- Valida formato de dados (email, URL, UUID, etc.)

### Como usar
```typescript
// Automático em todas as rotas via middleware global
app.use(sanitizeInputs);

// Validação manual
import { validateEmail, validateUsername } from '../utils/validation';

if (!validateEmail(email)) {
    throw new Error('Email inválido');
}
```

## 2. Proteção XSS (Cross-Site Scripting)

### Implementação
- **Biblioteca:** `xss-clean` (deprecated, considerar alternativas)
- **Middleware:** `xssMiddleware` em `middlewares/security.ts`
- **Helmet CSP:** Content Security Policy configurado

### O que faz
- Remove tags HTML potencialmente perigosas
- Escapa caracteres especiais que podem executar scripts
- Define políticas CSP (Content Security Policy)

### Configuração CSP
```typescript
contentSecurityPolicy: {
    directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'ws:', 'wss:'],
    },
}
```

## 3. Proteção CSRF (Cross-Site Request Forgery)

### Implementação
- **Middleware:** `csrf.middleware.ts`
- **Método:** Double-submit token pattern

### O que faz
- Gera tokens únicos para cada sessão de usuário
- Valida tokens em requisições que modificam dados (POST, PUT, DELETE)
- Tokens expiram em 1 hora
- Limpeza automática de tokens expirados

### Como usar

**Obter token:**
```bash
GET /api/auth/csrf-token
Response: { "status": "success", "data": { "csrfToken": "abc123..." } }
```

**Enviar token:**
```bash
# Via header
X-CSRF-Token: abc123...

# Ou via body
{ "_csrf": "abc123...", ...outros dados }
```

**Aplicar em rotas sensíveis:**
```typescript
import { csrfProtection } from '../middlewares/csrf.middleware';

router.post('/sensitive-action', csrfProtection, controller.action);
```

## 4. Proteção SQL Injection

### Implementação
- **ORM:** Prisma (usa prepared statements automaticamente)
- **Validação adicional:** `utils/validation.ts`

### O que faz
- Prisma automaticamente previne SQL injection usando prepared statements
- Validações adicionais detectam padrões suspeitos
- Whitelist de caracteres permitidos em inputs

### Boas Práticas
```typescript
// ✅ BOM - Prisma usa prepared statements
await prisma.user.findMany({
    where: { username: userInput }
});

// ❌ EVITAR - SQL raw sem sanitização
await prisma.$queryRaw`SELECT * FROM users WHERE username = ${userInput}`;

// ✅ BOM - SQL raw com sanitização
import { validateSqlSafe } from '../utils/validation';
if (!validateSqlSafe(userInput)) {
    throw new Error('Input inválido');
}
```

## 5. Criptografia de Dados Sensíveis

### Implementação
- **Algoritmo:** AES-256-GCM
- **Biblioteca:** `crypto` (nativo Node.js)
- **Utilitário:** `utils/encryption.ts`

### O que criptografar
- Tokens OAuth
- Chaves de API de terceiros
- Dados pessoais sensíveis (não senhas - usar bcrypt)
- Informações de pagamento

### Como usar

**Criptografar:**
```typescript
import { encrypt, decrypt } from '../utils/encryption';

// Criptografar texto
const encrypted = encrypt('dados sensíveis');

// Criptografar objeto
const encryptedJson = encryptJson({ apiKey: 'secret', token: 'xyz' });
```

**Descriptografar:**
```typescript
const decrypted = decrypt(encrypted);
const obj = decryptJson<MyType>(encryptedJson);
```

**Configuração:**
```bash
# .env
ENCRYPTION_KEY=<64 caracteres hex - gerar com: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
```

**Mascarar dados em logs:**
```typescript
import { maskSensitiveData, maskEmail } from '../utils/encryption';

logger.info(`Token: ${maskSensitiveData(token)}`); // Token: abcd****************
logger.info(`Email: ${maskEmail('user@example.com')}`); // Email: us***@example.com
```

## 6. HTTPS Enforcement

### Implementação
- **Middleware:** `httpsRedirect` em `middlewares/security.ts`
- **Helmet HSTS:** HTTP Strict Transport Security

### O que faz
- Redireciona HTTP para HTTPS em produção
- Força uso de conexões seguras
- HSTS com preload para browsers modernos

### Configuração
```typescript
hsts: {
    maxAge: 31536000, // 1 ano
    includeSubDomains: true,
    preload: true,
}
```

## 7. Proteção NoSQL Injection

### Implementação
- **Biblioteca:** `express-mongo-sanitize`
- **Middleware:** `mongoSanitizeMiddleware`

### O que faz
- Remove operadores MongoDB como `$gt`, `$ne`, etc. de inputs
- Previne ataques de query injection
- Substitui caracteres proibidos por `_`

### Exemplo de ataque prevenido
```javascript
// Ataque
{ "email": { "$gt": "" } } // Retornaria todos usuários

// Após sanitização
{ "email": { "_gt": "" } } // Não funciona como operador
```

## 8. Rate Limiting

### Implementação
- **Middleware:** `rateLimiter.ts`
- **Store:** Redis (em produção)

### Limites
- Geral: 100 req/15min
- Auth: 5 req/15min
- Upload: 3 req/hora

## 9. Outras Medidas de Segurança

### Headers de Segurança (via Helmet)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security`
- `Content-Security-Policy`

### Validação de Senhas
```typescript
import { validateStrongPassword } from '../utils/validation';

const result = validateStrongPassword(password);
if (!result.isValid) {
    throw new Error(result.errors.join(', '));
}

// Requisitos:
// - Mínimo 8 caracteres
// - Pelo menos 1 letra maiúscula
// - Pelo menos 1 letra minúscula
// - Pelo menos 1 número
// - Pelo menos 1 caractere especial
```

### Prevenção Path Traversal
```typescript
import { validateNoPathTraversal } from '../utils/validation';

if (!validateNoPathTraversal(filePath)) {
    throw new Error('Caminho inválido');
}
```

## 10. Checklist de Segurança

### Desenvolvimento
- [x] Variáveis de ambiente seguras (.env não commitado)
- [x] Validação de todos os inputs do usuário
- [x] Sanitização de dados antes de salvar
- [x] Rate limiting configurado
- [x] CORS configurado corretamente
- [x] Logs não expõem dados sensíveis

### Produção
- [ ] HTTPS configurado
- [ ] Certificado SSL válido
- [ ] ENCRYPTION_KEY gerada e segura
- [ ] JWT_SECRET forte e único
- [ ] Redis com senha
- [ ] PostgreSQL com senha forte
- [ ] Firewall configurado
- [ ] Backups regulares
- [ ] Monitoramento de segurança ativo

## 11. Variáveis de Ambiente Obrigatórias

```bash
# Segurança
JWT_SECRET=<string longa e aleatória>
JWT_REFRESH_SECRET=<string longa e aleatória diferente>
ENCRYPTION_KEY=<64 caracteres hex>
HMAC_SECRET=<string longa e aleatória>

# Produção
NODE_ENV=production
FRONTEND_URL=https://seu-dominio.com
```

## 12. Comandos Úteis

**Gerar chaves seguras:**
```bash
# Encryption key (32 bytes = 64 hex chars)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# CSRF token
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 13. Auditoria de Segurança

### Verificar vulnerabilidades
```bash
npm audit
npm audit fix
```

### Ferramentas recomendadas
- **OWASP ZAP:** Scanner de vulnerabilidades
- **Snyk:** Análise de dependências
- **ESLint Security Plugin:** Análise estática de código

## 14. Contato para Reportar Vulnerabilidades

Se você encontrar uma vulnerabilidade de segurança, por favor:
1. NÃO abra uma issue pública
2. Envie email para: security@labzz.com
3. Inclua detalhes da vulnerabilidade e passos para reproduzir

## 15. Referências

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Helmet.js Documentation](https://helmetjs.github.io/)
