'use client';

import dynamic from 'next/dynamic';
import { ComponentType, ReactNode, Suspense } from 'react';
import { Skeleton } from '@/components/ui';

// Cria componente com carregamento lazy e fallback
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createLazyComponent<T = any>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  LoadingComponent?: ReactNode
) {
  return dynamic(importFn, {
    loading: () => <>{LoadingComponent || <DefaultLoader />}</>,
    ssr: true,
  });
}

// Componente lazy sem SSR (apenas navegador)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createClientOnlyComponent<T = any>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  LoadingComponent?: ReactNode
) {
  return dynamic(importFn, {
    loading: () => <>{LoadingComponent || <DefaultLoader />}</>,
    ssr: false,
  });
}

// Loaders padrão

function DefaultLoader() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

export function CardLoader() {
  return <Skeleton variant="rectangular" className="h-48 w-full rounded-lg" />;
}

export function ListLoader() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} variant="rectangular" className="h-12 w-full rounded" />
      ))}
    </div>
  );
}

export function AvatarLoader() {
  return <Skeleton variant="circular" className="h-10 w-10" />;
}

// Wrapper com Suspense

interface LazyWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function LazyWrapper({ children, fallback }: LazyWrapperProps) {
  return <Suspense fallback={fallback || <DefaultLoader />}>{children}</Suspense>;
}

// Componentes lazy pré-configurados

export const LazyChatArea = dynamic(
  () => import('@/components/chat/ChatArea').then((mod) => mod.ChatArea),
  {
    loading: () => <CardLoader />,
    ssr: true,
  }
);

export const LazySidebar = dynamic({
  loading: () => <ListLoader />,
  ssr: true,
});

export const LazyModal = dynamic(() => import('@/components/ui/Modal').then((mod) => mod.Modal), {
  loading: () => <DefaultLoader />,
  ssr: true,
});

export const LazyUserSearch = dynamic(
  () => import('@/components/chat/UserSearch').then((mod) => mod.UserSearch),
  {
    loading: () => <ListLoader />,
    ssr: false,
  }
);

export const LazyFadeIn = dynamic(
  () => import('@/components/animations/MotionComponents').then((mod) => mod.FadeIn),
  {
    loading: () => <DefaultLoader />,
    ssr: false,
  }
);

// Preload de componentes para carregamento mais rápido

export function preloadComponent(importFn: () => Promise<unknown>) {
  if (typeof window !== 'undefined') {
    const connection = (navigator as Navigator & { connection?: { effectiveType: string } })
      .connection;
    if (!connection || connection.effectiveType !== 'slow-2g') {
      importFn();
    }
  }
}

export function usePreload(importFn: () => Promise<unknown>) {
  const preload = () => preloadComponent(importFn);

  return {
    onMouseEnter: preload,
    onFocus: preload,
  };
}
