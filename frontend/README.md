# 💬 Labzz Chat - Frontend

Interface do sistema de chat em tempo real construída com **Next.js 16**, **TypeScript** e **Tailwind CSS**.

## 🛠️ Tecnologias

| Tecnologia | Versão | Uso |
|---|---|---|
| Next.js | 16.1.6 | Framework React com App Router |
| TypeScript | 5.x | Tipagem estática |
| Tailwind CSS | 4.x | Estilização utility-first |
| Socket.io Client | 4.8.x | WebSocket em tempo real |
| Framer Motion | 12.x | Animações e transições |
| next-intl | 4.x | Internacionalização (pt-BR, en-US) |
| Jest | 30.x | Testes unitários |
| Playwright | 1.58.x | Testes E2E |

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+
- Backend rodando em `http://localhost:4000`
- Docker Compose (PostgreSQL, Redis, Elasticsearch)

### Instalação

```bash
npm install
cp .env.example .env.local
npm run dev
```

Acesse: http://localhost:3000

### Variáveis de Ambiente

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
NEXT_PUBLIC_APP_NAME=Labzz Chat
```

## 📂 Estrutura

```
src/
├── app/                    # App Router (páginas)
│   ├── (auth)/             # Grupo de rotas de autenticação
│   │   ├── login/          # Página de login
│   │   ├── register/       # Página de registro
│   │   ├── 2fa/            # Verificação 2FA (TOTP)
│   │   └── callback/       # Callback OAuth (Google/GitHub)
│   ├── chat/               # Interface principal do chat
│   ├── profile/            # Perfil do usuário
│   ├── settings/           # Configurações
│   ├── offline/            # Página offline (PWA)
│   ├── layout.tsx          # Layout raiz com providers
│   └── providers.tsx       # Providers globais (Auth, Socket, Theme, i18n)
│
├── components/
│   ├── ui/                 # Design system base
│   │   ├── Button.tsx      # Botão com variantes e loading
│   │   ├── Input.tsx       # Input com validação e ícones
│   │   ├── Modal.tsx       # Modal acessível com focus trap
│   │   ├── Avatar.tsx      # Avatar com iniciais e cores
│   │   ├── Badge.tsx       # Badges e contadores
│   │   ├── Loading.tsx     # Spinners e estados de loading
│   │   ├── Skeleton.tsx    # Skeleton loaders
│   │   ├── Toast.tsx       # Sistema de notificações toast
│   │   └── LanguageSelector.tsx # Seletor de idioma
│   │
│   ├── chat/               # Componentes do chat
│   │   ├── ChatLayout.tsx  # Layout principal (sidebar + área de chat)
│   │   ├── ChatArea.tsx    # Área de mensagens com scroll infinito
│   │   ├── Sidebar.tsx     # Lista de conversas
│   │   ├── Message.tsx     # Bolha de mensagem
│   │   ├── MessageInput.tsx # Input com auto-resize e typing
│   │   ├── MessageSearch.tsx # Busca de mensagens
│   │   ├── UserSearch.tsx  # Busca de usuários para nova conversa
│   │   ├── Header.tsx      # Header com notificações e menu
│   │   └── TypingIndicator.tsx # Indicador de digitação
│   │
│   ├── accessibility/      # Componentes de acessibilidade
│   │   └── AccessibilityComponents.tsx # SkipLink, VisuallyHidden, LiveRegion
│   │
│   ├── animations/         # Componentes de animação
│   │   └── MotionComponents.tsx # FadeIn, SlideIn, ScaleIn, StaggerList
│   │
│   ├── optimization/       # Otimização de performance
│   │   ├── LazyComponents.tsx   # Lazy loading com Suspense
│   │   └── OptimizedImage.tsx   # Imagens otimizadas Next/Image
│   │
│   ├── pwa/                # Progressive Web App
│   │   └── PWAComponents.tsx # InstallPrompt, UpdateNotification
│   │
│   └── ProtectedRoute.tsx  # HOC de proteção de rotas
│
├── contexts/               # React Contexts
│   ├── AuthContext.tsx      # Autenticação (login, register, tokens)
│   ├── SocketContext.tsx    # WebSocket (conexão, eventos)
│   └── ThemeContext.tsx     # Tema claro/escuro
│
├── hooks/                  # Custom hooks
│   ├── useMessages.ts      # Mensagens com paginação infinita
│   ├── useNotifications.ts # Notificações do navegador
│   ├── useCache.ts         # Cache com stale-while-revalidate
│   ├── useAccessibility.ts # Focus trap, navegação por teclado
│   ├── usePWA.ts           # Estado PWA e instalação
│   └── index.ts
│
├── services/               # Camada de serviços (API)
│   ├── auth.service.ts     # Autenticação e OAuth
│   ├── chat.service.ts     # Conversas e mensagens
│   └── user.service.ts     # Perfil e busca de usuários
│
├── lib/
│   ├── api/
│   │   └── client.ts       # Axios com interceptors e refresh token
│   └── utils/
│       ├── cn.ts           # Merge de classes CSS (clsx + tailwind-merge)
│       └── dateUtils.ts    # Formatação de datas relativas
│
├── config/
│   ├── env.ts              # Variáveis de ambiente tipadas
│   └── theme.ts            # Configuração do tema
│
├── messages/               # Traduções i18n
│   ├── pt-BR.json          # Português (padrão)
│   └── en-US.json          # Inglês
│
├── types/
│   └── index.ts            # Tipos globais (User, Message, Conversation)
│
└── i18n.ts                 # Configuração next-intl
```

## ✨ Funcionalidades

### Autenticação
- Login com email/senha
- Registro de novos usuários
- OAuth2 (Google e GitHub)
- Autenticação dois fatores (2FA/TOTP)
- Refresh token automático
- Proteção de rotas

### Chat em Tempo Real
- Mensagens instantâneas via WebSocket
- Indicador de digitação (typing)
- Scroll infinito com paginação
- Atualização otimista de mensagens
- Status de conexão em tempo real
- Agrupamento de mensagens por data

### Interface
- Design responsivo (mobile-first)
- Tema claro/escuro com persistência
- Animações suaves (Framer Motion)
- Skeleton loaders durante carregamento
- Sistema de toasts para feedback
- Busca de mensagens e usuários com debounce

### Acessibilidade (WCAG AA)
- Navegação por teclado em todos os componentes
- Focus trap em modais
- Skip links para conteúdo
- Suporte a leitores de tela (ARIA)
- Indicadores de foco visíveis
- Suporte a prefers-reduced-motion

### Performance
- Lazy loading de componentes pesados
- Imagens otimizadas (Next/Image)
- Cache com stale-while-revalidate
- Service Worker para offline
- PWA instalável

### Internacionalização
- Português (pt-BR) — padrão
- Inglês (en-US)
- Troca de idioma persistente via cookie

## 🧪 Testes

### Unitários (Jest + Testing Library)

```bash
npm test               # Rodar todos
npm run test:watch     # Modo watch
npm run test:coverage  # Com cobertura
```

**84 testes** organizados em 4 suítes:
- `Button.test.tsx` — Renderização, variantes, eventos, acessibilidade
- `Input.test.tsx` — Validação, estados, ícones, tipos
- `Modal.test.tsx` — Focus trap, ESC, overlay click, acessibilidade
- `useCache.test.ts` — TTL, invalidação, stale-while-revalidate, LRU

### E2E (Playwright)

```bash
npm run test:e2e       # Rodar testes E2E
```

Cenários cobertos:
- Fluxo de autenticação (login, registro, logout)
- Envio e recebimento de mensagens
- Busca de usuários e mensagens

## 📜 Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (Turbopack) |
| `npm run build` | Build de produção |
| `npm start` | Servidor de produção |
| `npm test` | Testes unitários |
| `npm run test:watch` | Testes em modo watch |
| `npm run test:coverage` | Cobertura de testes |
| `npm run test:e2e` | Testes E2E (Playwright) |
| `npm run lint` | Linter (ESLint) |

## 🏗️ Arquitetura

### Fluxo de Dados

```
Componente → Hook/Context → Service → API Client → Backend
                ↕
           WebSocket (Socket.io)
```

### Padrões Utilizados

- **App Router** — Roteamento baseado em arquivos com layouts aninhados
- **Server/Client Components** — Separação clara entre servidor e cliente
- **Context API** — Estado global (Auth, Socket, Theme)
- **Custom Hooks** — Lógica reutilizável encapsulada
- **Service Layer** — Abstração da comunicação com API
- **Optimistic Updates** — Feedback imediato antes da confirmação do servidor
- **Stale-While-Revalidate** — Cache inteligente com revalidação em background

### Providers

O app é envolvido por providers na seguinte ordem:

```
NextIntlClientProvider (i18n)
  └── ThemeProvider (tema)
      └── AuthProvider (autenticação)
          └── SocketProvider (WebSocket)
              └── App
```
