'use client';

import { Avatar } from '../ui';
import { cn } from '@/lib/utils/cn';
import { formatTime } from '@/lib/utils/dateUtils';

export interface MessageProps {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderUsername: string;
  senderAvatar?: string;
  createdAt: Date | string;
  isOwn: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
}

export function Message({
  content,
  senderName,
  senderAvatar,
  createdAt,
  isOwn,
  status = 'sent',
}: MessageProps) {
  return (
    <div className={cn('flex gap-3 mb-4 animate-fadeIn', isOwn ? 'flex-row-reverse' : 'flex-row')}>
      {/* Avatar - só mostra para mensagens de outros */}
      {!isOwn && <Avatar src={senderAvatar} alt={senderName} size="sm" className="flex-shrink-0" />}

      {/* Message Bubble */}
      <div
        className={cn(
          'flex flex-col max-w-[70%] md:max-w-[60%]',
          isOwn ? 'items-end' : 'items-start'
        )}
      >
        {/* Sender Name - só mostra para mensagens de outros */}
        {!isOwn && (
          <span className="text-xs text-gray-600 dark:text-gray-400 mb-1 px-1">{senderName}</span>
        )}

        {/* Message Content */}
        <div
          className={cn(
            'px-4 py-2 rounded-2xl break-words',
            isOwn
              ? 'bg-primary-600 text-white rounded-tr-sm'
              : 'bg-white dark:bg-dark-card text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-tl-sm'
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{content}</p>
        </div>

        {/* Timestamp and Status */}
        <div
          className={cn(
            'flex items-center gap-1 mt-1 px-1',
            isOwn ? 'flex-row-reverse' : 'flex-row'
          )}
        >
          <span className="text-xs text-gray-500 dark:text-gray-400">{formatTime(createdAt)}</span>

          {/* Status Indicator - só para mensagens próprias */}
          {isOwn && status && (
            <div className="flex-shrink-0">
              {status === 'sending' && (
                <svg className="w-4 h-4 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
              {status === 'sent' && (
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
              {status === 'delivered' && (
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7M5 13l4 4L19 7"
                  />
                </svg>
              )}
              {status === 'read' && (
                <svg
                  className="w-4 h-4 text-primary-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7M5 13l4 4L19 7"
                  />
                </svg>
              )}
              {status === 'error' && (
                <svg
                  className="w-4 h-4 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
