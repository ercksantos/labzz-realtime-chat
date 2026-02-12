export default function OfflinePage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
            <div className="text-center">
                {/* Offline Icon */}
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                    <svg
                        className="h-12 w-12 text-gray-500 dark:text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a5 5 0 01-.707-7.071m-2.828 2.828a9 9 0 012.829-6.364M3 3l18 18"
                        />
                    </svg>
                </div>

                {/* Title */}
                <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                    Você está offline
                </h1>

                {/* Description */}
                <p className="mb-8 max-w-md text-gray-600 dark:text-gray-400">
                    Parece que você perdeu a conexão com a internet. Verifique sua conexão e tente novamente.
                </p>

                {/* Actions */}
                <div className="space-y-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary/90"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                        </svg>
                        Tentar novamente
                    </button>

                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Algumas páginas visitadas recentemente podem estar disponíveis offline.
                    </p>
                </div>

                {/* Cached Pages Hint */}
                <div className="mt-8 rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        💡 Dica: O Labzz Chat funciona offline!
                    </p>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Instale o app para acessar suas conversas mesmo sem internet.
                    </p>
                </div>
            </div>
        </div>
    );
}
