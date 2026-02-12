'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface ServiceWorkerState {
    isSupported: boolean;
    isInstalled: boolean;
    isUpdateAvailable: boolean;
    isOffline: boolean;
    registration: ServiceWorkerRegistration | null;
}

export function useServiceWorker() {
    const [state, setState] = useState<ServiceWorkerState>({
        isSupported: false,
        isInstalled: false,
        isUpdateAvailable: false,
        isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
        registration: null,
    });

    useEffect(() => {
        if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

        setState((prev) => ({ ...prev, isSupported: true }));

        navigator.serviceWorker
            .register('/sw.js')
            .then((registration) => {
                setState((prev) => ({ ...prev, isInstalled: true, registration }));
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                setState((prev) => ({ ...prev, isUpdateAvailable: true }));
                            }
                        });
                    }
                });
            })
            .catch((err) => console.error('[PWA] SW registration failed:', err));

        const goOnline = () => setState((prev) => ({ ...prev, isOffline: false }));
        const goOffline = () => setState((prev) => ({ ...prev, isOffline: true }));
        window.addEventListener('online', goOnline);
        window.addEventListener('offline', goOffline);
        return () => {
            window.removeEventListener('online', goOnline);
            window.removeEventListener('offline', goOffline);
        };
    }, []);

    const update = async () => {
        if (state.registration) {
            await state.registration.update();
            window.location.reload();
        }
    };

    return { ...state, update };
}

export function useInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        const onPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setIsInstallable(true);
        };
        const onInstalled = () => {
            setIsInstalled(true);
            setIsInstallable(false);
            setDeferredPrompt(null);
        };
        window.addEventListener('beforeinstallprompt', onPrompt);
        window.addEventListener('appinstalled', onInstalled);
        return () => {
            window.removeEventListener('beforeinstallprompt', onPrompt);
            window.removeEventListener('appinstalled', onInstalled);
        };
    }, []);

    const install = async (): Promise<boolean> => {
        if (!deferredPrompt) return false;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setIsInstallable(false);
            setDeferredPrompt(null);
            return true;
        }
        return false;
    };

    return { isInstallable, isInstalled, install };
}

export function usePushNotifications() {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined' || !('Notification' in window)) return;
        setPermission(Notification.permission);
    }, []);

    const requestPermission = async (): Promise<boolean> => {
        if (!('Notification' in window)) return false;
        const result = await Notification.requestPermission();
        setPermission(result);
        return result === 'granted';
    };

    const subscribe = async (vapidPublicKey: string): Promise<PushSubscription | null> => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null;
        try {
            const registration = await navigator.serviceWorker.ready;
            const padding = '='.repeat((4 - (vapidPublicKey.length % 4)) % 4);
            const base64 = (vapidPublicKey + padding).replace(/-/g, '+').replace(/_/g, '/');
            const rawData = window.atob(base64);
            const outputArray = new Uint8Array(rawData.length);
            for (let i = 0; i < rawData.length; ++i) {
                outputArray[i] = rawData.charCodeAt(i);
            }
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: outputArray.buffer,
            });
            setSubscription(sub);
            return sub;
        } catch (error) {
            console.error('[PWA] Push subscription failed:', error);
            return null;
        }
    };

    const unsubscribe = async (): Promise<boolean> => {
        if (!subscription) return false;
        const result = await subscription.unsubscribe();
        if (result) setSubscription(null);
        return result;
    };

    return {
        permission,
        subscription,
        requestPermission,
        subscribe,
        unsubscribe,
        isSupported: typeof window !== 'undefined' && 'Notification' in window,
    };
}
