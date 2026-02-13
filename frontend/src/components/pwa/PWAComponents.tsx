'use client';

import { useEffect, useState } from 'react';
import { useServiceWorker, useInstallPrompt } from '@/hooks/usePWA';

interface InstallBannerProps {
  onDismiss?: () => void;
}

export function InstallBanner({ onDismiss }: InstallBannerProps) {
  const { isInstallable, install } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const wasDismissed = localStorage.getItem('pwa-install-dismissed');
    if (wasDismissed) setDismissed(true);
  }, []);

  if (!isInstallable || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
    onDismiss?.();
  };

  const handleInstall = async () => {
    const installed = await install();
    if (installed) handleDismiss();
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-lg bg-white p-4 shadow-lg dark:bg-gray-800">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <svg
            className="h-6 w-6 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-900 dark:text-white">Instalar Labzz Chat</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Acesse mais rápido direto da home
          </p>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={handleDismiss}
          className="flex-1 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Agora não
        </button>
        <button
          onClick={handleInstall}
          className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          Instalar
        </button>
      </div>
    </div>
  );
}

export function OfflineIndicator() {
  const { isOffline } = useServiceWorker();

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-yellow-500 px-4 py-2 text-center text-sm font-medium text-yellow-900">
      Você está offline. Algumas funcionalidades podem não estar disponíveis.
    </div>
  );
}

export function UpdateAvailable() {
  const { isUpdateAvailable, update } = useServiceWorker();

  if (!isUpdateAvailable) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-primary p-4 text-white shadow-lg">
      <p className="mb-2 font-medium">Nova versão disponível!</p>
      <button
        onClick={update}
        className="rounded bg-white px-4 py-2 text-sm font-medium text-primary hover:bg-gray-100"
      >
        Atualizar agora
      </button>
    </div>
  );
}
