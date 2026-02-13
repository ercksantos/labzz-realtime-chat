'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import type { Conversation } from '@/services/chat.service';

interface ChatLayoutProps {
  children: React.ReactNode;
  conversations?: Conversation[];
  selectedConversationId?: string;
  onSelectConversation?: (conversation: Conversation) => void;
  onConversationCreated?: (conversation: Conversation) => void;
  isLoadingConversations?: boolean;
}

export function ChatLayout({
  children,
  conversations = [],
  selectedConversationId,
  onSelectConversation,
  onConversationCreated,
  isLoadingConversations = false,
}: ChatLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-bg overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        conversations={conversations}
        selectedConversationId={selectedConversationId}
        onSelectConversation={(conv) => {
          onSelectConversation?.(conv);
          setIsSidebarOpen(false);
        }}
        onConversationCreated={onConversationCreated}
        isLoading={isLoadingConversations}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
