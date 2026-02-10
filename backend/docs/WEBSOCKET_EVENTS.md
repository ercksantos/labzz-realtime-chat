# 📡 Eventos WebSocket - Labzz Chat

## Autenticação

Para conectar ao WebSocket, o cliente deve enviar o token JWT:

```javascript
const socket = io('http://localhost:4000', {
  auth: {
    token: 'seu-jwt-token-aqui'
  }
});
```

---

## 🔐 Eventos de Presença

### `user_online`
**Direção:** Servidor → Cliente  
**Descrição:** Emitido quando um usuário fica online

**Payload:**
```json
{
  "userId": "uuid",
  "username": "nome_usuario"
}
```

### `user_offline`
**Direção:** Servidor → Cliente  
**Descrição:** Emitido quando um usuário desconecta

**Payload:**
```json
{
  "userId": "uuid",
  "username": "nome_usuario"
}
```

---

## 💬 Eventos de Chat

### `join_conversation`
**Direção:** Cliente → Servidor  
**Descrição:** Entrar em uma sala de conversa para receber mensagens em tempo real

**Payload:**
```json
{
  "conversationId": "uuid"
}
```

### `leave_conversation`
**Direção:** Cliente → Servidor  
**Descrição:** Sair de uma sala de conversa

**Payload:**
```json
{
  "conversationId": "uuid"
}
```

### `send_message`
**Direção:** Cliente → Servidor  
**Descrição:** Enviar uma mensagem em uma conversa

**Payload:**
```json
{
  "conversationId": "uuid",
  "content": "Texto da mensagem"
}
```

**Resposta de erro (se houver):**
```json
{
  "message": "Descrição do erro"
}
```

### `new_message`
**Direção:** Servidor → Cliente  
**Descrição:** Receber uma nova mensagem em tempo real

**Payload:**
```json
{
  "id": "uuid",
  "content": "Texto da mensagem",
  "conversationId": "uuid",
  "senderId": "uuid",
  "isRead": false,
  "createdAt": "2026-02-10T22:00:00.000Z",
  "updatedAt": "2026-02-10T22:00:00.000Z",
  "sender": {
    "id": "uuid",
    "username": "nome_usuario",
    "name": "Nome Completo",
    "avatar": "url_do_avatar"
  }
}
```

### `mark_as_read`
**Direção:** Cliente → Servidor  
**Descrição:** Marcar mensagens de uma conversa como lidas

**Payload:**
```json
{
  "conversationId": "uuid"
}
```

**Confirmação:**
```json
{
  "conversationId": "uuid"
}
```

---

## ⌨️ Eventos de Digitação

### `typing_start`
**Direção:** Cliente → Servidor  
**Descrição:** Notificar que o usuário começou a digitar

**Payload:**
```json
{
  "conversationId": "uuid"
}
```

### `user_typing`
**Direção:** Servidor → Cliente  
**Descrição:** Notificação de que um usuário está digitando

**Payload:**
```json
{
  "userId": "uuid",
  "username": "nome_usuario",
  "conversationId": "uuid"
}
```

### `typing_stop`
**Direção:** Cliente → Servidor  
**Descrição:** Notificar que o usuário parou de digitar

**Payload:**
```json
{
  "conversationId": "uuid"
}
```

### `user_stopped_typing`
**Direção:** Servidor → Cliente  
**Descrição:** Notificação de que um usuário parou de digitar

**Payload:**
```json
{
  "userId": "uuid",
  "conversationId": "uuid"
}
```

---

## ❌ Tratamento de Erros

### `error`
**Direção:** Servidor → Cliente  
**Descrição:** Erro durante processamento de um evento

**Payload:**
```json
{
  "message": "Descrição do erro"
}
```

**Erros comuns:**
- `"Authentication error: Token not provided"`
- `"Authentication error: Invalid token"`
- `"Message content cannot be empty"`
- `"You are not a participant of this conversation"`
- `"Failed to send message"`
- `"Failed to mark messages as read"`
- `"Failed to join conversation"`

---

## 📝 Exemplo de Uso Completo (Cliente)

```javascript
import { io } from 'socket.io-client';

// Conectar com autenticação
const socket = io('http://localhost:4000', {
  auth: {
    token: localStorage.getItem('accessToken')
  }
});

// Eventos de conexão
socket.on('connect', () => {
  console.log('Conectado ao servidor WebSocket');
});

socket.on('disconnect', () => {
  console.log('Desconectado do servidor');
});

// Entrar em uma conversa
socket.emit('join_conversation', {
  conversationId: 'conversation-uuid'
});

// Enviar mensagem
socket.emit('send_message', {
  conversationId: 'conversation-uuid',
  content: 'Olá, mundo!'
});

// Receber mensagens
socket.on('new_message', (message) => {
  console.log('Nova mensagem:', message);
  // Atualizar UI
});

// Indicador de digitação
let typingTimeout;
const handleTyping = () => {
  socket.emit('typing_start', {
    conversationId: 'conversation-uuid'
  });
  
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit('typing_stop', {
      conversationId: 'conversation-uuid'
    });
  }, 1000);
};

// Escutar digitação de outros
socket.on('user_typing', (data) => {
  console.log(`${data.username} está digitando...`);
});

socket.on('user_stopped_typing', (data) => {
  console.log('Usuário parou de digitar');
});

// Presença online/offline
socket.on('user_online', (data) => {
  console.log(`${data.username} ficou online`);
});

socket.on('user_offline', (data) => {
  console.log(`${data.username} ficou offline`);
});

// Marcar mensagens como lidas
socket.emit('mark_as_read', {
  conversationId: 'conversation-uuid'
});

// Tratamento de erros
socket.on('error', (error) => {
  console.error('Erro WebSocket:', error);
});
```

---

## 🔒 Segurança

- Todas as conexões WebSocket requerem autenticação JWT
- Apenas participantes de uma conversa podem enviar/receber mensagens
- Mensagens são validadas antes de serem salvas
- Usuários não autorizados são desconectados automaticamente

---

## 🚀 Endpoints REST Relacionados

Para criar conversas e buscar histórico de mensagens, use os endpoints REST:

- `POST /api/chat/conversations` - Criar nova conversa
- `GET /api/chat/conversations` - Listar conversas do usuário
- `GET /api/chat/conversations/:id/messages` - Buscar histórico de mensagens
- `DELETE /api/chat/conversations/:id` - Deletar conversa

Ver documentação completa em [API_DOCS.md](./API_DOCS.md)
