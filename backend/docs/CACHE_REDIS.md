# 💾 Sistema de Cache com Redis

## Visão Geral

Este módulo implementa cache usando Redis para melhorar a performance e reduzir a carga no banco de dados PostgreSQL.

## Configuração

### Variáveis de Ambiente

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=sua_senha_aqui
```

## Estratégia de Cache

### 1. Cache de Sessões
- **TTL**: 7 dias
- **Chaves**: `session:{userId}`
- **Uso**: Armazenar dados de sessão do usuário
- **Invalidação**: No logout ou quando a sessão expira

### 2. Cache de Conversas
- **TTL**: 30 minutos
- **Chaves**: 
  - `conversation:{conversationId}` - Detalhes da conversa
  - `user:conversations:{userId}` - Lista de conversas do usuário
- **Uso**: Evitar queries pesadas ao listar conversas
- **Invalidação**: Quando nova mensagem é enviada ou conversa é deletada

### 3. Cache de Usuários Online
- **TTL**: 5 minutos (renovado automaticamente)
- **Chaves**: 
  - `user:online:{userId}` - Dados do usuário online
  - `online:users` - Set com IDs de todos os usuários online
- **Uso**: Status de presença em tempo real
- **Invalidação**: Quando usuário desconecta

## Endpoints

### 1. Obter Usuários Online

**Endpoint:** `GET /api/cache/online-users`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Resposta de Sucesso (200):**
```json
{
  "status": "success",
  "data": {
    "users": [
      {
        "id": "user-uuid",
        "username": "joao",
        "name": "João Silva",
        "avatar": "https://example.com/avatar.jpg",
        "isOnline": true
      }
    ],
    "count": 5
  }
}
```

### 2. Verificar Saúde do Cache

**Endpoint:** `GET /api/cache/health`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Resposta de Sucesso (200):**
```json
{
  "status": "success",
  "data": {
    "connected": true,
    "memory": "2.5M"
  }
}
```

### 3. Limpar Cache

**Endpoint:** `DELETE /api/cache/flush`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Resposta de Sucesso (200):**
```json
{
  "status": "success",
  "message": "Cache cleared successfully"
}
```

⚠️ **Atenção**: Este endpoint limpa TODO o cache. Use apenas em desenvolvimento ou em caso de necessidade.

## Integração com Services

### Chat Service

```typescript
// Buscar conversas (com cache)
const conversations = await chatService.getUserConversations(userId);

// Cache é:
// 1. Verificado primeiro (retorna se existir)
// 2. Populado após query no DB (se não existir)
// 3. Invalidado quando nova mensagem é enviada
```

### WebSocket Handlers

```typescript
// Mensagem enviada -> invalida cache de conversas
socket.on('send_message', async (data) => {
  // ... criar mensagem ...
  
  // Invalidar cache
  await cacheService.invalidateConversationCache(
    conversationId, 
    participantIds
  );
});

// Usuário conecta -> adiciona ao cache de online
socket.on('connect', async () => {
  await cacheService.setUserOnline(userId, userData);
});

// Usuário desconecta -> remove do cache de online
socket.on('disconnect', async () => {
  await cacheService.setUserOffline(userId);
});
```

## Padrões de Uso

### 1. Ler do Cache

```typescript
const cached = await cacheService.get<MyType>('chave');
if (cached) {
  return cached; // Cache hit
}

// Cache miss - buscar do banco
const data = await database.query(...);
await cacheService.set('chave', data, TTL);
return data;
```

### 2. Invalidar Cache

```typescript
// Invalidar chave específica
await cacheService.del('chave');

// Invalidar por padrão
await cacheService.delPattern('user:conversations:*');

// Invalidar cache de conversa completo
await cacheService.invalidateConversationCache(
  conversationId, 
  participantIds
);
```

### 3. Cache de Sets (Usuários Online)

```typescript
// Adicionar ao set
await cacheService.setUserOnline(userId, userData);

// Verificar se está no set
const isOnline = await cacheService.isUserOnline(userId);

// Obter todos do set
const onlineUsers = await cacheService.getOnlineUsers();

// Remover do set
await cacheService.setUserOffline(userId);
```

## TTLs (Time To Live)

| Tipo de Cache | TTL | Renovação |
|---------------|-----|-----------|
| Sessões | 7 dias | Manual (no login) |
| Conversas | 30 min | Automática |
| Usuários Online | 5 min | Automática (heartbeat) |
| Genérico | 1 hora | Manual |

## Monitoramento

### Health Check Integrado

O endpoint `/health` do servidor inclui status do Redis:

```json
{
  "status": "ok",
  "services": {
    "database": "connected",
    "redis": "connected",
    "elasticsearch": "connected"
  },
  "cache": {
    "memory": "2.5M"
  }
}
```

### Logs

O Redis emite logs automáticos para:
- ✅ Conexão estabelecida
- 🚀 Cliente pronto
- ❌ Erros de conexão
- 🔄 Reconexões automáticas

## Tratamento de Falhas

### Modo Degradado

Se o Redis estiver indisponível:
- ✅ Servidor inicia normalmente
- ✅ Todas as funcionalidades continuam operando
- ⚠️ Performance reduzida (sem cache)
- 📝 Logs indicam problema

### Retry Automático

O cliente Redis tenta reconectar automaticamente:
- Delay incremental: 50ms → 100ms → 150ms...
- Máximo de 2000ms entre tentativas
- 3 tentativas por requisição

## Performance

### Cache Hit Rates Esperados

- **Conversas recentes**: ~80-90% (alta reutilização)
- **Usuários online**: ~95%+ (dados atualizados constantemente)
- **Sessões**: ~99%+ (apenas em logout invalida)

### Economia de Queries

Com cache ativo:
- ⬇️ 60-80% menos queries ao PostgreSQL
- ⚡ Latência reduzida em 70-90%
- 📊 Throughput 3-5x maior

## Boas Práticas

### ✅ Fazer

- Sempre definir TTL apropriado
- Invalidar cache quando dados mudam
- Usar prefixos organizados (`session:`, `user:`, etc.)
- Serializar/deserializar objetos em JSON
- Logar erros sem quebrar o fluxo

### ❌ Evitar

- TTLs muito longos (dados obsoletos)
- TTLs muito curtos (pouco benefício)
- Armazenar dados sensíveis sem criptografia
- Depender 100% do cache (sempre ter fallback)
- Fazer flush em produção sem necessidade

## Exemplos de Uso

### Exemplo 1: Cache de Lista de Conversas

```typescript
async getUserConversations(userId: string) {
  // Tentar cache primeiro
  const cached = await cacheService.getUserConversations(userId);
  if (cached) return cached;

  // Cache miss - buscar do banco
  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { userId } } },
    include: { /* ... */ }
  });

  // Salvar no cache
  await cacheService.setUserConversations(userId, conversations);
  
  return conversations;
}
```

### Exemplo 2: Verificar Usuário Online

```typescript
const isOnline = await cacheService.isUserOnline(userId);

if (isOnline) {
  // Usuário está online
  console.log('Usuário online!');
} else {
  // Verificar lastSeen no banco
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastSeen: true }
  });
}
```

### Exemplo 3: Invalidar Cache ao Enviar Mensagem

```typescript
// Após salvar mensagem no banco
await prisma.message.create({ /* ... */ });

// Invalidar cache de todos os participantes
const participants = await prisma.conversationParticipant.findMany({
  where: { conversationId },
  select: { userId: true }
});

await cacheService.invalidateConversationCache(
  conversationId,
  participants.map(p => p.userId)
);
```

## Troubleshooting

### Problema: Cache não está funcionando

**Solução:**
1. Verificar se Redis está rodando: `docker compose ps`
2. Testar conexão: `GET /api/cache/health`
3. Verificar variáveis de ambiente (REDIS_HOST, REDIS_PORT)
4. Checar logs do servidor para erros de conexão

### Problema: Dados desatualizados

**Solução:**
1. Verificar se invalidação está sendo chamada
2. Reduzir TTL temporariamente
3. Fazer flush do cache: `DELETE /api/cache/flush`

### Problema: Memória do Redis alta

**Solução:**
1. Verificar usage: `GET /api/cache/health`
2. Reduzir TTLs se necessário
3. Implementar política de eviction (maxmemory-policy)
4. Fazer flush se crítico

## Monitoramento Avançado

### Redis CLI

```bash
# Conectar no Redis
docker compose exec redis redis-cli

# Ver todas as chaves
KEYS *

# Ver chaves por padrão
KEYS session:*

# Ver TTL de uma chave
TTL session:user-123

# Ver memória usada
INFO memory

# Contar usuários online
SCARD online:users
```

### Logs Úteis

```bash
# Ver logs do Redis container
docker compose logs redis -f

# Ver logs do servidor (filtrar cache)
# No arquivo de log, procurar por "cache" ou "Redis"
```
