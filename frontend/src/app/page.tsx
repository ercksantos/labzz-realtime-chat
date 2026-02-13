'use client';

import { useState } from 'react';
import { Avatar, Badge, Button, Input, Loading, Modal } from '@/components/ui';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            🎨 Labzz Chat - Design System
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Componentes UI Base - MÓDULO 2 Completo ✅
          </p>
        </div>

        {/* Buttons */}
        <section className="bg-white dark:bg-dark-card rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Buttons</h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="success">Success</Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button isLoading>Loading</Button>
              <Button disabled>Disabled</Button>
              <Button fullWidth>Full Width</Button>
            </div>
          </div>
        </section>

        {/* Inputs */}
        <section className="bg-white dark:bg-dark-card rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Inputs</h2>
          <div className="space-y-4 max-w-md">
            <Input label="Nome" placeholder="Digite seu nome" />
            <Input
              label="Email"
              type="email"
              placeholder="email@exemplo.com"
              helperText="Nunca compartilharemos seu email"
            />
            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              error="Senha deve ter pelo menos 8 caracteres"
            />
            <Input
              label="Campo obrigatório"
              required
              placeholder="Campo obrigatório"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>
        </section>

        {/* Avatars */}
        <section className="bg-white dark:bg-dark-card rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Avatars</h2>
          <div className="space-y-4">
            <div className="flex flex-wrap items-end gap-4">
              <Avatar alt="João Silva" size="xs" />
              <Avatar alt="Maria Santos" size="sm" />
              <Avatar alt="Pedro Costa" size="md" />
              <Avatar alt="Ana Lima" size="lg" />
              <Avatar alt="Carlos Souza" size="xl" />
              <Avatar alt="Júlia Oliveira" size="2xl" />
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Avatar alt="Online User" size="lg" isOnline={true} showBorder />
              <Avatar alt="Offline User" size="lg" isOnline={false} showBorder />
              <Avatar alt="Unknown Status" size="lg" showBorder />
            </div>
          </div>
        </section>

        {/* Badges */}
        <section className="bg-white dark:bg-dark-card rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Badges</h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Badge variant="primary">Primary</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
              <Badge variant="info">Info</Badge>
            </div>
            <div className="flex flex-wrap gap-3">
              <Badge size="sm">Small</Badge>
              <Badge size="md">Medium</Badge>
              <Badge size="lg">Large</Badge>
            </div>
            <div className="flex flex-wrap gap-3">
              <Badge variant="success" dot>
                Online
              </Badge>
              <Badge variant="error" dot>
                Offline
              </Badge>
              <Badge variant="warning" dot>
                Away
              </Badge>
            </div>
          </div>
        </section>

        {/* Loading */}
        <section className="bg-white dark:bg-dark-card rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Loading</h2>
          <div className="space-y-8">
            <div className="flex flex-wrap items-center gap-8">
              <Loading variant="spinner" size="sm" />
              <Loading variant="spinner" size="md" />
              <Loading variant="spinner" size="lg" />
            </div>
            <div className="flex flex-wrap items-center gap-8">
              <Loading variant="dots" size="sm" />
              <Loading variant="dots" size="md" />
              <Loading variant="dots" size="lg" />
            </div>
            <div className="flex flex-wrap items-center gap-8">
              <Loading variant="pulse" size="sm" />
              <Loading variant="pulse" size="md" />
              <Loading variant="pulse" size="lg" />
            </div>
            <Loading variant="spinner" size="md" text="Carregando dados..." />
          </div>
        </section>

        {/* Modal */}
        <section className="bg-white dark:bg-dark-card rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Modal</h2>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setIsModalOpen(true)}>Abrir Modal</Button>
          </div>

          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Modal de Demonstração"
            footer={
              <>
                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setIsModalOpen(false)}>Confirmar</Button>
              </>
            }
          >
            <p className="text-gray-600 dark:text-gray-400">
              Este é um modal de demonstração. Você pode usar ESC para fechar ou clicar no overlay.
            </p>
            <div className="mt-4 space-y-3">
              <Input label="Nome" placeholder="Digite seu nome" />
              <Input label="Email" type="email" placeholder="email@exemplo.com" />
            </div>
          </Modal>
        </section>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p>✅ MÓDULO 2: Design System e Componentes Base - 100% Completo</p>
          <p className="mt-2">Próximo: MÓDULO 3 - Autenticação UI</p>
        </div>
      </div>
    </div>
  );
}
