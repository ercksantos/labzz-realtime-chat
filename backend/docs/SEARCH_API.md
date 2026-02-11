# 🔍 API de Busca - Elasticsearch

## Visão Geral

Este módulo implementa busca avançada usando Elasticsearch para mensagens e usuários.

## Endpoints

### 1. Buscar Mensagens

**Endpoint:** `GET /api/search/messages`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `query` (string, obrigatório): Texto de busca
- `conversationId` (uuid, opcional): Filtrar por conversa específica
- `senderId` (uuid, opcional): Filtrar por remetente específico
- `page` (number, opcional, default: 1): Página de resultados
- `limit` (number, opcional, default: 20): Resultados por página
- `sortBy` (string, opcional, default: 'relevance'): Ordenação ('relevance' ou 'date')

**Exemplo de Requisição:**
```bash
GET /api/search/messages?query=reunião&conversationId=abc123&sortBy=date&page=1&limit=10
```

**Resposta de Sucesso (200):**
```json
{
  "status": "success",
  "data": {
    "results": [
      {
        "id": "msg-uuid",
        "content": "Vamos ter uma reunião hoje?",
        "senderId": "user-uuid",
        "senderName": "João Silva",
        "senderUsername": "joao",
        "conversationId": "conv-uuid",
        "createdAt": "2026-02-11T10:30:00.000Z",
        "updatedAt": "2026-02-11T10:30:00.000Z"
      }
    ],
    "total": 5,
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

### 2. Buscar Usuários

**Endpoint:** `GET /api/search/users`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `query` (string, obrigatório): Texto de busca (nome, username ou email)
- `page` (number, opcional, default: 1): Página de resultados
- `limit` (number, opcional, default: 20): Resultados por página

**Exemplo de Requisição:**
```bash
GET /api/search/users?query=joão&page=1&limit=10
```

**Resposta de Sucesso (200):**
```json
{
  "status": "success",
  "data": {
    "results": [
      {
        "id": "user-uuid",
        "email": "joao@example.com",
        "username": "joao",
        "name": "João Silva",
        "avatar": "https://example.com/avatar.jpg",
        "isOnline": true,
        "createdAt": "2026-01-15T08:00:00.000Z"
      }
    ],
    "total": 1,
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

## Recursos da Busca

### Busca de Mensagens

1. **Multi-match**: Busca em múltiplos campos
   - Conteúdo da mensagem (peso 2x)
   - Nome do remetente
   - Username do remetente

2. **Fuzzy Search**: Tolerância a erros de digitação

3. **Filtros**:
   - Por conversa específica
   - Por remetente específico

4. **Ordenação**:
   - Por relevância (score do Elasticsearch)
   - Por data (mais recentes primeiro)

### Busca de Usuários

1. **Multi-match**: Busca em múltiplos campos
   - Nome (peso 2x)
   - Username (peso 1.5x)
   - Email

2. **Fuzzy Search**: Tolerância a erros de digitação

## Indexação Automática

### Mensagens
- Indexadas automaticamente ao serem enviadas via WebSocket
- Campos indexados: id, content, senderId, senderName, senderUsername, conversationId, timestamps

### Usuários
- Indexados automaticamente no registro
- Atualizados automaticamente quando o perfil é editado
- Status online atualizado em tempo real
- Campos indexados: id, email, username, name, avatar, isOnline, createdAt

## Scripts de Indexação

Para indexar mensagens/usuários existentes:

```bash
# Indexar todas as mensagens
npm run index-messages

# Indexar todos os usuários
npm run index-users
```

## Configuração

Variável de ambiente necessária:

```env
ELASTICSEARCH_NODE=http://localhost:9200
```

## Índices Criados

1. **messages**: Armazena todas as mensagens do chat
2. **users**: Armazena todos os usuários do sistema

Os índices são criados automaticamente na inicialização do servidor.

## Tratamento de Erros

Se o Elasticsearch não estiver disponível:
- O servidor iniciará normalmente (modo degradado)
- Busca não funcionará, mas o chat continuará operacional
- Logs indicarão o problema

## Performance

- Limite máximo de resultados por página: 100
- Timeout de requisição: 60 segundos
- Retry automático: 5 tentativas
- Shards por índice: 1
- Réplicas: 1

## Exemplos de Uso

### Buscar mensagem em conversa específica
```typescript
const response = await fetch('/api/search/messages?query=projeto&conversationId=123', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Buscar usuário por nome parcial
```typescript
const response = await fetch('/api/search/users?query=joão', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Buscar mensagens mais recentes
```typescript
const response = await fetch('/api/search/messages?query=deadline&sortBy=date&limit=5', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```
