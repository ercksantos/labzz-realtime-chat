'use client';

import { ChatLayout } from '@/components/chat';

export default function ChatPage() {
    return (
        <ChatLayout>
            <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
                <div className="text-center max-w-md mx-auto p-8">
                    <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-10 h-10 text-primary-600 dark:text-primary-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Bem-vindo ao Labzz Chat!
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Selecione uma conversa na barra lateral para começar a conversar ou crie uma nova
                        conversa.
                    </p>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            💡 A interface de mensagens será implementada no próximo módulo
                        </p>
                    </div>
                </div>
            </div>
        </ChatLayout>
    );
}
