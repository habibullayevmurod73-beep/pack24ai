'use client';

import { useState, useEffect, useCallback } from 'react';

type PushStatus = 'loading' | 'unsupported' | 'denied' | 'subscribed' | 'unsubscribed';

interface UsePushNotificationsReturn {
    status:       PushStatus;
    subscribe:    () => Promise<boolean>;
    unsubscribe:  () => Promise<boolean>;
    isSupported:  boolean;
    isSubscribed: boolean;
}

// ─── URL base64 decode (VAPID public key uchun) ───────────────────────────────
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const binary  = window.atob(base64);
    const bytes   = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function usePushNotifications(userId?: number): UsePushNotificationsReturn {
    const [status, setStatus] = useState<PushStatus>('loading');

    const isSupported = typeof window !== 'undefined'
        && 'serviceWorker' in navigator
        && 'PushManager' in window;

    // Browser support va mavjud holatni aniqlash
    useEffect(() => {
        if (!isSupported) { setStatus('unsupported'); return; }

        if (Notification.permission === 'denied') {
            setStatus('denied');
            return;
        }

        // Mavjud subscription tekshirish
        navigator.serviceWorker.ready.then(async (reg) => {
            const existing = await reg.pushManager.getSubscription();
            setStatus(existing ? 'subscribed' : 'unsubscribed');
        }).catch(() => setStatus('unsubscribed'));
    }, [isSupported]);

    // ─── Service Worker ro'yxatdan o'tkazish ─────────────────────────────────
    const ensureServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
        try {
            const reg = await navigator.serviceWorker.register('/sw.js');
            await navigator.serviceWorker.ready;
            return reg;
        } catch (err) {
            console.error('[Push] SW ro\'yxatdan o\'tmadi:', err);
            return null;
        }
    };

    // ─── VAPID public key serverdan olish ────────────────────────────────────
    const getVapidKey = async (): Promise<string | null> => {
        try {
            const res = await fetch('/api/push/subscribe');
            if (!res.ok) return null;
            const { vapidPublicKey } = await res.json();
            return vapidPublicKey || null;
        } catch {
            return null;
        }
    };

    // ─── Subscribe (obuna bo'lish) ────────────────────────────────────────────
    const subscribe = useCallback(async (): Promise<boolean> => {
        if (!isSupported) return false;

        try {
            // Ruxsat so'rash
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                setStatus('denied');
                return false;
            }

            const reg = await ensureServiceWorker();
            if (!reg) return false;

            const vapidKey = await getVapidKey();
            if (!vapidKey) {
                console.warn('[Push] VAPID key topilmadi — serverda VAPID_PUBLIC_KEY qo\'ying');
                return false;
            }

            const subscription = await reg.pushManager.subscribe({
                userVisibleOnly:      true,
                applicationServerKey: urlBase64ToUint8Array(vapidKey) as unknown as BufferSource,
            });

            const keys = subscription.toJSON().keys as { p256dh: string; auth: string };

            // Serverga saqlash
            const res = await fetch('/api/push/subscribe', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({
                    endpoint: subscription.endpoint,
                    keys,
                    userId,
                }),
            });

            if (res.ok) {
                setStatus('subscribed');
                return true;
            }
            return false;
        } catch (err) {
            console.error('[Push] Subscribe xatolik:', err);
            return false;
        }
    }, [isSupported, userId]);

    // ─── Unsubscribe (obunadan chiqish) ──────────────────────────────────────
    const unsubscribe = useCallback(async (): Promise<boolean> => {
        if (!isSupported) return false;

        try {
            const reg = await navigator.serviceWorker.ready;
            const subscription = await reg.pushManager.getSubscription();

            if (!subscription) {
                setStatus('unsubscribed');
                return true;
            }

            // Serverdan o'chirish
            await fetch('/api/push/subscribe', {
                method:  'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ endpoint: subscription.endpoint }),
            });

            await subscription.unsubscribe();
            setStatus('unsubscribed');
            return true;
        } catch (err) {
            console.error('[Push] Unsubscribe xatolik:', err);
            return false;
        }
    }, [isSupported]);

    return {
        status,
        subscribe,
        unsubscribe,
        isSupported,
        isSubscribed: status === 'subscribed',
    };
}
