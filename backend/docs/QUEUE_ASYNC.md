# ⚙️ Filas e Processamento Assíncrono - BullMQ

## Visão Geral

Este módulo implementa filas de processamento assíncrono usando BullMQ e Redis para tarefas que não precisam ser executadas imediatamente (emails, notificações, etc).

## Configuração

### Variáveis de Ambiente

```env
# Redis (usado pelo BullMQ)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=sua_senha

# SMTP (para envio de emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu_email@gmail.com
SMTP_PASSWORD=sua_senha_app
SMTP_FROM=noreply@labzz.chat

# Frontend URL (para links nos emails)
FRONTEND_URL=http://localhost:3000
```

## Filas Disponíveis

### 1. Fila de Emails (`email`)

**Concorrência**: 5 workers  
**Rate Limit**: 10 emails/segundo  
**Retry**: 3 tentativas com backoff exponencial

**Tipos de Email:**
- Email de boas-vindas
- Redefinição de senha
- Nova mensagem (para usuários offline)
- Convite para conversa

### 2. Fila de Notificações (`notification`)

**Concorrência**: 10 workers  
**Retry**: 3 tentativas com backoff exponencial

**Tipos de Notificação:**
- Nova mensagem
- Nova conversa
- Notificação do sistema

## Workers

Os workers são processos que ficam escutando as filas e processando os jobs automaticamente.

### Email Worker
- Processa envio de emails via SMTP
- Retry automático em caso de falha
- Logging detalhado de sucesso/erro

### Notification Worker
- Processa criação de notificações
- Suporte para notificações push (futuro)
- Logging de processamento

## Templates de Email

### Welcome Email
```html
Assunto: Bem-vindo ao Labzz Chat!
Corpo: Mensagem de boas-vindas com email do usuário
```

### Password Reset
```html
Assunto: Redefinição de Senha - Labzz Chat
Corpo: Link de redefinição com token (expira em 1h)
```

### New Message
```html
Assunto: Nova mensagem de {senderName}
Corpo: Preview da mensagem + link para conversa
```

### Conversation Invite
```html
Assunto: {inviterName} adicionou você a uma conversa
Corpo: Nome da conversa + link para abrir
```

## Uso nos Services

### Enviar Email de Boas-vindas

```typescript
import emailService from './services/email.service';

// No registro de usuário
await emailService.sendWelcomeEmail(user.email, user.name);
```

### Enviar Notificação

```typescript
import notificationService from './services/notification.service';

// Quando nova mensagem é enviada
await notificationService.notifyNewMessage(
  userId,
  senderName,
  messageContent,
  conversationId
);
```

### Enviar Email de Redefinição de Senha

```typescript
await emailService.sendPasswordResetEmail(
  user.email,
  user.name,
  resetToken
);
```

## Integração Automática

### Registro de Usuário
✅ Email de boas-vindas é enviado automaticamente

### Nova Mensagem (WebSocket)
✅ Notificações são enviadas automaticamente para participantes offline

### Convite para Conversa
✅ Email de convite pode ser enviado ao adicionar participante

## Endpoints

### Obter Estatísticas das Filas

**Endpoint:** `GET /api/queue/stats`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Resposta de Sucesso (200):**
```json
{
  "status": "success",
  "data": {
    "email": {
      "waiting": 5,
      "active": 2,
      "completed": 150,
      "failed": 3
    },
    "notification": {
      "waiting": 0,
      "active": 0,
      "completed": 320,
      "failed": 1
    }
  }
}
```

## Configuração de Jobs

### Opções Padrão

```typescript
{
  attempts: 3,               // 3 tentativas
  backoff: {
    type: 'exponential',
    delay: 2000,            // 2s, 4s, 8s
  },
  removeOnComplete: {
    age: 86400,             // Remover após 24h
    count: 100,             // Manter últimos 100
  },
  removeOnFail: {
    age: 604800,            // Remover após 7 dias
    count: 1000,            // Manter últimos 1000
  },
}
```

### Prioridade

Jobs podem ter prioridade (menor número = maior prioridade):

```typescript
// Email de reset de senha (alta prioridade)
await emailService.queueEmail(
  emailData,
  { priority: 1 }
);

// Email normal (prioridade padrão)
await emailService.queueEmail(emailData);
```

### Delay

Jobs podem ser agendados para execução futura:

```typescript
// Enviar email daqui a 1 hora
await emailService.queueEmail(
  emailData,
  { delay: 3600000 } // 1h em ms
);
```

## Monitoramento

### Logs

Os workers geram logs automáticos:

```
✅ Email worker inicializado
✅ Notification worker inicializado
🚀 Todos os workers foram inicializados

Processando email job 123: Bem-vindo ao Labzz Chat!
Email job 123 processado com sucesso
Email job 123 completado
```

### Estatísticas

Verifique as estatísticas via endpoint `/api/queue/stats`:

- **waiting**: Jobs aguardando processamento
- **active**: Jobs sendo processados agora
- **completed**: Total de jobs completados
- **failed**: Total de jobs que falharam

### Health Check

O endpoint `/health` não mostra status das filas, mas você pode verificar:
- Redis deve estar `connected` (filas dependem do Redis)

## Tratamento de Erros

### Retry Automático

Quando um job falha:
1. **1ª tentativa**: Imediatamente após falha
2. **2ª tentativa**: Após 2 segundos
3. **3ª tentativa**: Após 4 segundos
4. **Falha definitiva**: Job marcado como failed

### Logs de Falha

```
Email job 123 falhou: Error: SMTP connection failed
Erro no email worker: ...
```

### Modo Degradado

Se as filas falharem:
- ✅ Aplicação continua funcionando
- ⚠️ Emails/notificações não serão enviados
- 📝 Erros são logados

## Performance

### Concorrência

- **Email**: 5 jobs simultâneos
- **Notification**: 10 jobs simultâneos

### Rate Limiting

- Email: Máximo 10/segundo (prevenir bloqueio SMTP)
- Notification: Sem limite

### Throughput Esperado

- **Emails**: ~300-600/minuto (dependendo do SMTP)
- **Notificações**: ~1000+/minuto

## Boas Práticas

### ✅ Fazer

- Sempre usar filas para emails (nunca bloquear request HTTP)
- Logar sucessos e falhas
- Usar prioridade para jobs críticos
- Monitorar estatísticas regularmente
- Configurar SMTP corretamente antes de prod

### ❌ Evitar

- Processar jobs síncronos em filas (overhead desnecessário)
- Criar muitos jobs de uma vez (pode sobrecarregar)
- Ignorar falhas (investigar e corrigir)
- Usar delay muito longo (> 24h)

## Configuração SMTP

### Gmail

1. Ativar "Verificação em 2 etapas"
2. Gerar "Senha de app" em: https://myaccount.google.com/apppasswords
3. Usar senha de app no `SMTP_PASSWORD`

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu_email@gmail.com
SMTP_PASSWORD=senha_app_gerada
```

### SendGrid / Mailgun

Veja documentação dos provedores para configurações específicas.

## Desenvolvimento

### Testar Localmente

Use um servidor SMTP de teste:

```bash
# Mailhog (captura emails sem enviar)
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog

# Configurar
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
```

Emails capturados: http://localhost:8025

### Desabilitar Emails em Dev

```env
# Não configurar SMTP_USER ou SMTP_PASSWORD
# Emails serão logados mas não enviados
```

## Troubleshooting

### Problema: Jobs não estão sendo processados

**Solução:**
1. Verificar se Redis está rodando
2. Verificar logs dos workers
3. Reiniciar servidor (workers precisam ser inicializados)

### Problema: Emails não estão sendo enviados

**Solução:**
1. Testar conexão SMTP: verificar logs de erro
2. Validar credenciais SMTP
3. Verificar firewall/porta bloqueada
4. Usar ferramenta de teste (Mailhog)

### Problema: Muitos jobs failed

**Solução:**
1. Verificar logs para identificar erro
2. Corrigir causa raiz (SMTP, network, etc)
3. Se necessário, limpar jobs failed:
   ```bash
   # Via redis-cli
   docker compose exec redis redis-cli
   > DEL bull:email:failed
   ```

### Problema: Fila crescendo muito

**Solução:**
1. Verificar se workers estão rodando
2. Aumentar concorrência se necessário
3. Verificar rate limiting
4. Escalar horizontalmente (mais instâncias)

## Exemplos Avançados

### Enviar Email com Delay

```typescript
// Enviar lembrete daqui a 24h
await emailService.queueEmail(
  {
    to: user.email,
    subject: 'Lembrete',
    template: 'reminder',
    data: { /* ... */ }
  },
  { delay: 86400000 } // 24h
);
```

### Notificar Múltiplos Usuários

```typescript
const userIds = ['user1', 'user2', 'user3'];

await notificationService.notifyMultipleUsers(
  userIds,
  {
    type: 'system',
    title: 'Manutenção Programada',
    body: 'Sistema ficará offline às 02:00'
  }
);
```

### Email Personalizado

```typescript
await emailService.queueEmail({
  to: user.email,
  subject: 'Seu Relatório Mensal',
  template: 'monthlyReport',
  data: {
    name: user.name,
    stats: {
      messages: 150,
      conversations: 12
    }
  }
});
```

## Escalabilidade

### Escalar Horizontalmente

Para maior throughput, execute múltiplas instâncias:

```bash
# Instância 1
npm run dev

# Instância 2 (mesmas filas)
npm run dev
```

BullMQ distribui jobs automaticamente entre workers.

### Escalar Verticalmente

Aumentar concorrência nos workers:

```typescript
// emailWorker.ts
{
  concurrency: 10 // era 5
}
```

## Referências

- [BullMQ Documentation](https://docs.bullmq.io/)
- [Nodemailer Documentation](https://nodemailer.com/)
- [Redis Documentation](https://redis.io/docs/)
