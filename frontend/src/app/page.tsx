'use client';

import { motion, type Easing } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: 'easeOut' as Easing },
  }),
};

const features = [
  {
    icon: '💬',
    title: 'Chat em Tempo Real',
    description:
      'Mensagens instantâneas com WebSocket (Socket.io), indicadores de digitação e status online.',
  },
  {
    icon: '🔐',
    title: 'Autenticação Completa',
    description:
      'JWT com refresh token, OAuth2 (Google & GitHub) e autenticação de dois fatores (2FA/TOTP).',
  },
  {
    icon: '⚡',
    title: 'Alta Performance',
    description:
      'Cache com Redis, filas assíncronas com BullMQ e busca avançada com Elasticsearch.',
  },
  {
    icon: '🌍',
    title: 'Internacionalização',
    description: 'Suporte a múltiplos idiomas (PT-BR, EN, ES) com next-intl e troca em tempo real.',
  },
  {
    icon: '🎨',
    title: 'UI Moderna',
    description:
      'Design responsivo com Tailwind CSS, modo escuro, animações com Framer Motion e PWA.',
  },
  {
    icon: '🧪',
    title: 'Testes & Qualidade',
    description:
      'Testes unitários e de integração com Jest, E2E com Playwright e CI/CD configurado.',
  },
];

const techStack = [
  { name: 'Next.js 16', color: 'bg-black dark:bg-white dark:text-black text-white' },
  { name: 'React 19', color: 'bg-sky-500 text-white' },
  { name: 'TypeScript', color: 'bg-blue-600 text-white' },
  { name: 'Node.js', color: 'bg-green-600 text-white' },
  { name: 'Express', color: 'bg-gray-700 text-white' },
  { name: 'Socket.io', color: 'bg-gray-900 dark:bg-gray-200 dark:text-black text-white' },
  { name: 'PostgreSQL', color: 'bg-blue-800 text-white' },
  { name: 'Prisma', color: 'bg-indigo-600 text-white' },
  { name: 'Redis', color: 'bg-red-600 text-white' },
  { name: 'Tailwind CSS', color: 'bg-cyan-500 text-white' },
  { name: 'Docker', color: 'bg-blue-500 text-white' },
  { name: 'Jest', color: 'bg-red-800 text-white' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 dark:from-dark-bg dark:via-slate-900 dark:to-slate-800">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-200/30 via-transparent to-transparent dark:from-primary-900/20" />
        <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-sm font-medium mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-600" />
            </span>
            Teste Técnico — Labzz
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-5xl sm:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight"
          >
            Labzz{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-cyan-500">
              Chat
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed"
          >
            Plataforma de comunicação em tempo real construída com tecnologias modernas. Chat
            instantâneo, autenticação robusta, design responsivo e muito mais.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="https://github.com/ercksantos/labzz-realtime-chat"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-3.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold text-base hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              Ver no GitHub
            </a>
            <a
              href="/auth/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary-600 text-white font-semibold text-base hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Acessar o Chat
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>
          </motion.div>
        </div>
      </header>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4"
        >
          Funcionalidades
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-gray-500 dark:text-gray-400 mb-14 max-w-xl mx-auto"
        >
          Sistema completo construído do zero com foco em segurança, performance e experiência do
          usuário.
        </motion.p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="group p-6 rounded-2xl bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border hover:border-primary-200 dark:hover:border-primary-800 transition-all hover:shadow-lg"
            >
              <span className="text-3xl block mb-4">{feature.icon}</span>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12"
        >
          Tech Stack
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap justify-center gap-3"
        >
          {techStack.map((tech) => (
            <span
              key={tech.name}
              className={`px-4 py-2 rounded-full text-sm font-medium ${tech.color} shadow-sm hover:shadow-md transition-shadow`}
            >
              {tech.name}
            </span>
          ))}
        </motion.div>
      </section>

      {/* Architecture */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl bg-gray-900 dark:bg-dark-card p-8 sm:p-10 text-center border border-gray-800 dark:border-dark-border"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Arquitetura</h2>
          <pre className="text-sm sm:text-base text-gray-300 font-mono leading-relaxed whitespace-pre overflow-x-auto">
            {`┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   Vercel      │◄─────►│   Render      │◄─────►│  Supabase    │
│  (Frontend)   │  API  │  (Backend)    │  SQL  │ (PostgreSQL)  │
│  Next.js 16   │  WS   │  Express      │       └──────────────┘
└──────────────┘       │  Socket.io    │       ┌──────────────┐
                        │               │◄─────►│  Upstash     │
                        └──────────────┘ Redis │  (Redis)      │
                                                └──────────────┘`}
          </pre>
        </motion.div>
      </section>

      {/* License */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 p-8 sm:p-10"
        >
          <div className="flex items-start gap-4">
            <span className="text-3xl flex-shrink-0">⚖️</span>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Licença de Uso Restrito
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                Este software foi desenvolvido por <strong>Erick Pereira dos Santos</strong>{' '}
                exclusivamente para fins de avaliação técnica no processo seletivo da Labzz. O autor
                mantém todos os direitos sobre o código-fonte.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                É proibido o uso comercial, modificação, distribuição ou incorporação deste código
                em produtos ou serviços sem a contratação formal do autor e acordo por escrito.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                © 2026 Erick Pereira dos Santos — Protegido pela Lei nº 9.610/98 (Lei de Direitos
                Autorais). Contato:{' '}
                <a
                  href="mailto:erickpsantos0@gmail.com"
                  className="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  erickpsantos0@gmail.com
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-dark-border mt-10">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2026 Labzz Chat — Erick Pereira dos Santos
          </p>
          <a
            href="https://github.com/ercksantos/labzz-realtime-chat"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
