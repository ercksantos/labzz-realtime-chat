'use client';

import { useEffect, useCallback } from 'react';
import { useSocket } from '@/contexts/SocketContext';

export function useNotifications() {
    const { isConnected, on, off } = useSocket();

    useEffect(() => {
        if (!isConnected || typeof window === 'undefined') return;

        // Solicitar permissão
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        const handleNewMessage = (data: any) => {
            // Notificação apenas se a aba não estiver em foco
            if (document.hidden && Notification.permission === 'granted') {
                new Notification('Nova mensagem', {
                    body: `${data.senderName || 'Alguém'}: ${data.content || 'Enviou uma mensagem'}`,
                    icon: data.senderAvatar || '/logo.png',
                    tag: data.conversationId,
                    requireInteraction: false,
                });
            }

            // Som de notificação
            playNotificationSound();
        };

        const handleTyping = (data: any) => {
            if (document.hidden) {
                const originalTitle = document.title;
                document.title = `💬 ${data.userName || 'Alguém'} está digitando...`;

                setTimeout(() => {
                    document.title = originalTitle;
                }, 3000);
            }
        };

        on('message:new', handleNewMessage);
        on('typing:start', handleTyping);

        return () => {
            off('message:new', handleNewMessage);
            off('typing:start', handleTyping);
        };
    }, [isConnected, on, off]);

    const playNotificationSound = useCallback(() => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    }, []);

    return {
        playNotificationSound,
    };
}
