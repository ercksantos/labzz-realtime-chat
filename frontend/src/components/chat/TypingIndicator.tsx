'use client';

import { cn } from '@/lib/utils/cn';

interface TypingIndicatorProps {
  userName: string;
  className?: string;
}

export function TypingIndicator({ userName, className }: TypingIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-2 px-4 py-2', className)}>
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
      </div>
      <span className="text-sm text-gray-600 dark:text-gray-400">{userName} está digitando...</span>
    </div>
  );
}
