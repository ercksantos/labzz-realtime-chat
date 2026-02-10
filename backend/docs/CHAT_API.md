# 📚 API REST - Chat Endpoints

## Autenticação

Todos os endpoints requerem autenticação via Bearer Token no header:

```
Authorization: Bearer <seu-jwt-token>
```

---

## 🗨️ Conversas

### Criar Nova Conversa
**POST** `/api/chat/conversations`

Cria uma nova conversa entre usuários. Se for uma conversa direta entre 2 usuários e já existir, retorna a conversa existente.

**Body:**
```json
{
  "participantIds": ["uuid1", "uuid2"],
  "isGroup": false,
  "name": "Nome do Grupo (opcional, apenas para grupos)"
}
```

**Resposta (201):**
```json
{
  "status": "success",
  "data": {
    "conversation": {
      "id": "uuid",
      "isGroup": false,
      "name": null,
      "createdAt": "2026-02-10T22:00:00.000Z",
      "updatedAt": "2026-02-10T22:00:00.000Z",
      "participants": [
        {
          "id": "uuid",
          "conversationId": "uuid",
          "userId": "uuid",
          "joinedAt": "2026-02-10T22:00:00.000Z",
          "user": {
            "id": "uuid",
            "username": "usuario1",
            "name": "Usuário Um",
            "avatar": null,
            "isOnline": true
          }
        },
        {
          "id": "uuid",
          "conversationId": "uuid",
          "userId": "uuid",
          "joinedAt": "2026-02-10T22:00:00.000Z",
          "user": {
            "id": "uuid",
            "username": "usuario2",
            "name": "Usuário Dois",
            "avatar": null,
            "isOnline": false
          }
        }
      ]
    }
  }
}
```

**Erros:**
- `400` - Validação falhou
- `404` - Um ou mais participantes não encontrados

---

### Listar Conversas do Usuário
**GET** `/api/chat/conversations`

Retorna todas as conversas do usuário autenticado, ordenadas por última atualização.

**Resposta (200):**
```json
{
  "status": "success",
  "data": {
    "conversations": [
      {
        "id": "uuid",
        "isGroup": false,
        "name": null,
        "createdAt": "2026-02-10T22:00:00.000Z",
        "updatedAt": "2026-02-10T22:05:00.000Z",
        "participants": [
          {
            "id": "uuid",
            "conversationId": "uuid",
            "userId": "uuid",
            "joinedAt": "2026-02-10T22:00:00.000Z",
            "user": {
              "id": "uuid",
              "username": "usuario2",
              "name": "Usuário Dois",
              "avatar": "https://example.com/avatar.jpg",
              "isOnline": true,
              "lastSeen": "2026-02-10T22:05:00.000Z"
            }
          }
        ],
        "messages": [
          {
            "id": "uuid",
            "content": "Última mensagem da conversa",
            "conversationId": "uuid",
            "senderId": "uuid",
            "isRead": true,
            "createdAt": "2026-02-10T22:05:00.000Z",
            "sender": {
              "id": "uuid",
              "username": "usuario2",
              "name": "Usuário Dois"
            }
          }
        ]
      }
    ]
  }
}
```

---

### Deletar Conversa
**DELETE** `/api/chat/conversations/:conversationId`

Deleta uma conversa permanentemente (apenas para participantes).

**Parâmetros:**
- `conversationId` (UUID) - ID da conversa

**Resposta (200):**
```json
{
  "status": "success",
  "data": {
    "message": "Conversation deleted successfully"
  }
}
```

**Erros:**
- `403` - Você não é participante desta conversa
- `404` - Conversa não encontrada

---

## 💬 Mensagens

### Buscar Histórico de Mensagens
**GET** `/api/chat/conversations/:conversationId/messages`

Retorna o histórico de mensagens de uma conversa com paginação.

**Parâmetros:**
- `conversationId` (UUID) - ID da conversa

**Query Parameters:**
- `page` (number, opcional) - Página (padrão: 1)
- `limit` (number, opcional) - Mensagens por página (padrão: 50)

**Exemplo:**
```
GET /api/chat/conversations/uuid-da-conversa/messages?page=1&limit=50
```

**Resposta (200):**
```json
{
  "status": "success",
  "data": {
    "messages": [
      {
        "id": "uuid",
        "content": "Olá!",
        "conversationId": "uuid",
        "senderId": "uuid",
        "isRead": true,
        "createdAt": "2026-02-10T22:00:00.000Z",
        "updatedAt": "2026-02-10T22:00:00.000Z",
        "sender": {
          "id": "uuid",
          "username": "usuario1",
          "name": "Usuário Um",
          "avatar": null
        }
      },
      {
        "id": "uuid",
        "content": "Tudo bem?",
        "conversationId": "uuid",
        "senderId": "uuid",
        "isRead": true,
        "createdAt": "2026-02-10T22:01:00.000Z",
        "updatedAt": "2026-02-10T22:01:00.000Z",
        "sender": {
          "id": "uuid",
          "username": "usuario2",
          "name": "Usuário Dois",
          "avatar": "https://example.com/avatar.jpg"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 127,
      "totalPages": 3
    }
  }
}
```

**Notas:**
- As mensagens são retornadas em ordem crescente (mais antigas primeiro)
- Apenas participantes podem acessar o histórico

**Erros:**
- `403` - Você não é participante desta conversa
- `404` - Conversa não encontrada

---

## 📋 Exemplos de Uso

### Criar Conversa Direta
```bash
curl -X POST http://localhost:4000/api/chat/conversations \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "participantIds": ["user-uuid-2"],
    "isGroup": false
  }'
```

### Criar Grupo
```bash
curl -X POST http://localhost:4000/api/chat/conversations \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "participantIds": ["user-uuid-2", "user-uuid-3", "user-uuid-4"],
    "isGroup": true,
    "name": "Grupo de Trabalho"
  }'
```

### Listar Conversas
```bash
curl -X GET http://localhost:4000/api/chat/conversations \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Buscar Mensagens
```bash
curl -X GET "http://localhost:4000/api/chat/conversations/conversation-uuid/messages?page=1&limit=50" \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Deletar Conversa
```bash
curl -X DELETE http://localhost:4000/api/chat/conversations/conversation-uuid \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## 🔄 Fluxo Completo

1. **Criar Conversa** - `POST /api/chat/conversations`
2. **Conectar WebSocket** - Com token JWT
3. **Entrar na Conversa** - Emitir `join_conversation` via WebSocket
4. **Enviar Mensagens** - Emitir `send_message` via WebSocket
5. **Receber Mensagens** - Escutar evento `new_message`
6. **Buscar Histórico** - `GET /api/chat/conversations/:id/messages`
7. **Marcar como Lido** - Emitir `mark_as_read` via WebSocket

---

## 🔐 Segurança

- Todos os endpoints requerem autenticação JWT
- Usuários só podem acessar conversas das quais são participantes
- Validação de entrada com Zod
- Sanitização automática de conteúdo

---

## ⚡ Performance

- Paginação padrão: 50 mensagens por página
- Índices no banco de dados para queries rápidas
- Cache de conversas recentes (Redis - a ser implementado)
- Lazy loading de mensagens antigas

---

## 📚 Próximos Passos

Ver documentação de WebSocket: [WEBSOCKET_EVENTS.md](./WEBSOCKET_EVENTS.md)
