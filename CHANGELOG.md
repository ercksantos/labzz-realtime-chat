# Changelog

Todas as mudanças notáveis neste projeto serão documentadas aqui.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.0.0] - 2025-02-10

### Adicionado

#### Backend
- **Servidor Express** com TypeScript e configuração completa
- **Autenticação JWT** com access token (15min) e refresh token (7d)
- **OAuth2** com Google e GitHub
- **2FA (TOTP)** com speakeasy e QR Code
- **Prisma ORM** com PostgreSQL (UUID primary keys)
- **WebSocket** com Socket.io para chat em tempo real
- **Cache Redis** para sessões, dados frequentes e rate limiting
- **Busca com Elasticsearch** para mensagens e usuários
- **Filas BullMQ** para emails e notificações assíncronas
- **Rate Limiting** configurável por ambiente (dev/prod)
- **Segurança** - Helmet, CORS, CSRF, sanitização de inputs
- **Swagger/OpenAPI** documentação da API
- **Métricas** com Prometheus (endpoint /metrics)
- **Logging** estruturado com Winston
- **Testes unitários** com Jest (84 testes, >80% cobertura)
- **Coleção Postman** para testes manuais da API

#### Frontend
- **Next.js 16** com App Router e Turbopack
- **Design System** com Tailwind CSS v4 e componentes reutilizáveis
- **Autenticação completa** - Login, Registro, OAuth2, 2FA
- **Chat em tempo real** com Socket.io Client
- **Indicadores de digitação** e presença (online/offline)
- **Paginação infinita** com scroll para histórico de mensagens
- **Busca** de mensagens e usuários
- **Perfil de usuário** com edição e upload de avatar
- **Internacionalização** (pt-BR, en-US) com next-intl
- **Acessibilidade** WCAG 2.1 (teclado, ARIA, contraste, screen reader)
- **Animações** com Framer Motion (entrada, saída, transições)
- **Modo escuro** com toggle persistente
- **PWA** com Service Worker e manifest
- **Responsivo** mobile-first design
- **Testes** com Jest + React Testing Library
- **Code splitting** e lazy loading de componentes

#### DevOps
- **Docker Compose** para PostgreSQL, Redis e Elasticsearch
- **Dockerfile** multi-stage para backend e frontend
- **Docker Compose Production** com todas as dependências
- **CI/CD** com GitHub Actions (lint, test, build, docker)
- **Deploy Guide** para Vercel + Render + Supabase + Upstash

### Infraestrutura
- PostgreSQL 15 Alpine
- Redis 7 Alpine
- Elasticsearch 8.11

---

## Links
- [Repositório](https://github.com/seu-usuario/labzz-realtime-chat)
