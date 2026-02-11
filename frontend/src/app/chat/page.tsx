'use client';

export default function ChatPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        💬 Labzz Chat
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Esta é uma rota protegida. Você está autenticado! 🎉
                    </p>
                    <p className="mt-4 text-sm text-gray-500 dark:text-gray-500">
                        A interface de chat será implementada nos próximos módulos.
                    </p>
                </div>
            </div>
        </div>
    );
}
