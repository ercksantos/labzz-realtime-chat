/**
 * Format timestamp to relative time (e.g., "há 5 minutos", "ontem")
 */
export function formatRelativeTime(date: Date | string): string {
    const now = new Date();
    const messageDate = typeof date === 'string' ? new Date(date) : date;
    const diffInMs = now.getTime() - messageDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMinutes < 1) {
        return 'agora';
    }

    if (diffInMinutes < 60) {
        return `há ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`;
    }

    if (diffInHours < 24) {
        return `há ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
    }

    if (diffInDays === 1) {
        return 'ontem';
    }

    if (diffInDays < 7) {
        return `há ${diffInDays} dias`;
    }

    // More than a week ago, show date
    return messageDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

/**
 * Format time to HH:MM
 */
export function formatTime(date: Date | string): string {
    const messageDate = typeof date === 'string' ? new Date(date) : date;
    return messageDate.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Format full timestamp (date + time)
 */
export function formatFullTimestamp(date: Date | string): string {
    const messageDate = typeof date === 'string' ? new Date(date) : date;
    return messageDate.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Check if date is today
 */
export function isToday(date: Date | string): boolean {
    const messageDate = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    return (
        messageDate.getDate() === today.getDate() &&
        messageDate.getMonth() === today.getMonth() &&
        messageDate.getFullYear() === today.getFullYear()
    );
}

/**
 * Check if date is yesterday
 */
export function isYesterday(date: Date | string): boolean {
    const messageDate = typeof date === 'string' ? new Date(date) : date;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return (
        messageDate.getDate() === yesterday.getDate() &&
        messageDate.getMonth() === yesterday.getMonth() &&
        messageDate.getFullYear() === yesterday.getFullYear()
    );
}

/**
 * Group messages by date
 */
export function groupMessagesByDate<T extends { createdAt: Date | string }>(
    messages: T[]
): Map<string, T[]> {
    const groups = new Map<string, T[]>();

    messages.forEach((message) => {
        const date = typeof message.createdAt === 'string' ? new Date(message.createdAt) : message.createdAt;

        let dateKey: string;
        if (isToday(date)) {
            dateKey = 'Hoje';
        } else if (isYesterday(date)) {
            dateKey = 'Ontem';
        } else {
            dateKey = date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
            });
        }

        if (!groups.has(dateKey)) {
            groups.set(dateKey, []);
        }
        groups.get(dateKey)!.push(message);
    });

    return groups;
}
