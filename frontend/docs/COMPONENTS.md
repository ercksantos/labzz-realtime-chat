# 📚 Documentação de Componentes

## UI Components (`components/ui/`)

### Button

Botão reutilizável com variantes visuais, estados de loading e suporte a ícones.

```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="md" isLoading={false} onClick={handleClick}>
  Enviar
</Button>
```

**Props:**
| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'danger' \| 'ghost' \| 'outline'` | `'primary'` | Estilo visual |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamanho |
| `isLoading` | `boolean` | `false` | Exibe spinner e desabilita |
| `fullWidth` | `boolean` | `false` | Ocupa largura total |
| `leftIcon` / `rightIcon` | `ReactNode` | — | Ícone antes/depois do texto |

---

### Input

Campo de entrada com validação, ícones e estados de erro.

```tsx
import { Input } from '@/components/ui';

<Input
  label="Email"
  type="email"
  error="Email inválido"
  leftIcon={<MailIcon />}
/>
```

**Props:**
| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `label` | `string` | — | Rótulo do campo |
| `error` | `string` | — | Mensagem de erro |
| `helperText` | `string` | — | Texto auxiliar |
| `leftIcon` / `rightIcon` | `ReactNode` | — | Ícone decorativo |
| `type` | `string` | `'text'` | Tipo do input HTML |

---

### Modal

Modal acessível com focus trap, fechamento por ESC e click no overlay.

```tsx
import { Modal } from '@/components/ui';

<Modal isOpen={open} onClose={() => setOpen(false)} title="Confirmar">
  <p>Deseja continuar?</p>
</Modal>
```

**Props:**
| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `isOpen` | `boolean` | — | Controle de visibilidade |
| `onClose` | `() => void` | — | Callback ao fechar |
| `title` | `string` | — | Título do modal |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Largura |
| `showCloseButton` | `boolean` | `true` | Exibir botão X |

**Acessibilidade:** Focus trap ativo, `role="dialog"`, `aria-modal`, ESC para fechar.

---

### Avatar

Avatar com imagem ou iniciais geradas automaticamente com cor consistente.

```tsx
import { Avatar } from '@/components/ui';

<Avatar name="João Silva" src="/avatar.jpg" size="md" />
```

**Props:**
| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `name` | `string` | — | Nome para iniciais e cor |
| `src` | `string` | — | URL da imagem |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Tamanho |
| `status` | `'online' \| 'offline' \| 'away'` | — | Indicador de presença |

---

### Toast

Sistema global de notificações toast com tipos e auto-dismiss.

```tsx
import { useToast } from '@/components/ui/Toast';

const { addToast } = useToast();
addToast({ type: 'success', message: 'Salvo com sucesso!' });
```

**Tipos:** `success`, `error`, `warning`, `info`

---

### Skeleton

Placeholders animados para estados de carregamento.

```tsx
import { Skeleton, MessageSkeleton, ConversationSkeleton } from '@/components/ui';

<Skeleton className="h-4 w-32" />
<MessageSkeleton />
<ConversationSkeleton count={5} />
```

---

### Badge, Loading, LanguageSelector

Componentes auxiliares para badges de notificação, spinners de carregamento e seleção de idioma (pt-BR/en-US).

---

## Chat Components (`components/chat/`)

### ChatLayout

Layout principal que organiza `Sidebar` e `ChatArea` lado a lado com responsividade.

### ChatArea

Área central de mensagens com:
- Scroll infinito (Intersection Observer)
- Atualização otimista ao enviar
- Listeners WebSocket para mensagens em tempo real
- Indicador de digitação
- Agrupamento por data

### Sidebar

Lista de conversas do usuário com busca e seleção ativa.

### Message

Bolha de mensagem com alinhamento (enviada/recebida), horário e avatar.

### MessageInput

Input de texto com auto-resize, envio por Enter (Shift+Enter para quebra de linha) e emissão de evento de digitação via socket.

### MessageSearch / UserSearch

Componentes de busca com debounce (300ms) para mensagens e usuários.

### Header

Header com título da conversa, notificações e menus dropdown.

### TypingIndicator

Animação de "digitando..." com três pontos.

---

## Hooks (`hooks/`)

### useMessages

Gerencia mensagens com paginação infinita e atualização otimista.

```tsx
const { messages, isLoading, hasMore, loadMore, addApiMessage } = useMessages(conversationId);
```

### useNotifications

Solicita permissão e exibe notificações nativas do navegador.

```tsx
const { requestPermission, showNotification } = useNotifications();
```

### useCache

Cache em memória com TTL, invalidação manual e stale-while-revalidate.

```tsx
const { get, set, invalidate } = useCache<User>({ ttl: 60000, maxSize: 100 });
```

### useAccessibility

Focus trap, navegação por setas em listas e anúncios para leitores de tela.

```tsx
const { trapFocus } = useAccessibility();
const containerRef = trapFocus(isOpen);
```

### usePWA

Estado de instalação da PWA e prompt de instalação.

```tsx
const { isInstallable, install, isStandalone } = usePWA();
```

---

## Contexts (`contexts/`)

### AuthContext

Gerencia autenticação completa: login, registro, logout, refresh token e estado do usuário.

```tsx
const { user, isAuthenticated, login, logout, register } = useAuth();
```

### SocketContext

Conexão WebSocket com reconexão automática, emissão e escuta de eventos.

```tsx
const { socket, isConnected, emit, on, off } = useSocket();
```

### ThemeContext

Tema claro/escuro com persistência em localStorage e aplicação no `<html>`.

```tsx
const { theme, toggleTheme } = useTheme();
```

---

## Services (`services/`)

### auth.service.ts

| Método | Descrição |
|---|---|
| `login(email, password)` | Login com credenciais |
| `register(data)` | Registro de novo usuário |
| `logout()` | Logout e limpeza de tokens |
| `refreshToken()` | Renovar access token |
| `getGoogleUrl()` | URL de login Google |
| `getGithubUrl()` | URL de login GitHub |

### chat.service.ts

| Método | Descrição |
|---|---|
| `getConversations()` | Listar conversas |
| `getConversation(id)` | Buscar conversa por ID |
| `getMessages(id, page, limit)` | Mensagens com paginação |
| `sendMessage(id, content)` | Enviar mensagem |
| `markAsRead(id)` | Marcar como lida |
| `searchMessages(query)` | Buscar mensagens |
| `searchUsers(query)` | Buscar usuários |
| `createConversation(userId)` | Criar conversa |
| `deleteConversation(id)` | Excluir conversa |

### user.service.ts

| Método | Descrição |
|---|---|
| `getProfile()` | Perfil do usuário autenticado |
| `updateProfile(data)` | Atualizar perfil |
| `updateAvatar(file)` | Upload de avatar |
| `changePassword(data)` | Alterar senha |
| `searchUsers(query)` | Buscar usuários |
| `getUserById(id)` | Buscar por ID |
| `enable2FA()` / `verify2FA()` / `disable2FA()` | Gerenciar 2FA |

---

## Componentes de Acessibilidade (`components/accessibility/`)

| Componente | Uso |
|---|---|
| `SkipLink` | Link visível com Tab para pular ao conteúdo principal |
| `VisuallyHidden` | Conteúdo oculto visualmente, acessível para screen readers |
| `LiveRegion` | Região para anúncios dinâmicos (`aria-live`) |
| `AccessibleColors` | Paleta de cores que atende WCAG AA |
| `SemanticHeading` | Heading com hierarquia semântica correta |
| `FocusRing` | Classes CSS de indicador de foco |

---

## Componentes de Animação (`components/animations/`)

| Componente | Animação |
|---|---|
| `FadeIn` | Transição de opacidade |
| `SlideIn` | Deslizar de qualquer direção |
| `ScaleIn` | Escalar de pequeno para normal |
| `StaggerList` | Lista com entrada sequencial |
| `PageTransition` | Transição entre páginas |
| `PulseAnimation` | Efeito de pulso |
| `BounceAnimation` | Efeito de bounce |

Todos respeitam `prefers-reduced-motion`.

---

## Componentes de Otimização (`components/optimization/`)

| Componente | Uso |
|---|---|
| `createLazyComponent` | Cria componente com lazy loading e fallback |
| `createClientOnlyComponent` | Componente sem SSR |
| `SuspenseWrapper` | Wrapper com Suspense e fallback padrão |
| `OptimizedImage` | Imagem com lazy loading e shimmer placeholder |
| `OptimizedAvatar` | Avatar otimizado com fallback |
| `BackgroundImage` | Imagem de fundo otimizada |
| `preloadComponent` | Preload de componentes para navegação rápida |
