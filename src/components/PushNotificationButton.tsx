'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '';

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

type PermState = 'default' | 'granted' | 'denied' | 'unsupported' | 'loading';

export default function PushNotificationButton({ compact = false }: { compact?: boolean }) {
    const [state, setState] = useState<PermState>('default');

    useEffect(() => {
        if (!('Notification' in window) || !('serviceWorker' in navigator)) {
            setState('unsupported');
            return;
        }
        const perm = Notification.permission;
        if (perm === 'granted') setState('granted');
        else if (perm === 'denied') setState('denied');
    }, []);

    const subscribe = async () => {
        if (!('serviceWorker' in navigator)) return;
        setState('loading');

        try {
            // Register SW
            const reg = await navigator.serviceWorker.register('/sw.js');
            await navigator.serviceWorker.ready;

            const perm = await Notification.requestPermission();
            if (perm !== 'granted') {
                setState('denied');
                toast.error('Bildirishnomalar ruxsat etilmadi');
                return;
            }

            let subscription = await reg.pushManager.getSubscription();
            if (!subscription && VAPID_PUBLIC_KEY) {
                subscription = await reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
                });
            }

            if (subscription) {
                const subJson = subscription.toJSON();
                await fetch('/api/push/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        endpoint: subJson.endpoint,
                        keys: subJson.keys,
                    }),
                });
            }

            setState('granted');
            toast.success('Bildirishnomalar yoqildi! 🔔');
        } catch (err) {
            console.error('[Push]', err);
            setState('default');
            toast.error('Bildirishnomani yoqishda xatolik');
        }
    };

    const unsubscribe = async () => {
        try {
            const reg = await navigator.serviceWorker.getRegistration('/sw.js');
            const sub = await reg?.pushManager.getSubscription();
            if (sub) {
                await fetch('/api/push/subscribe', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ endpoint: sub.endpoint }),
                });
                await sub.unsubscribe();
            }
            setState('default');
            toast.success('Bildirishnomalar o\'chirildi');
        } catch (err) {
            console.error('[Push unsubscribe]', err);
        }
    };

    if (state === 'unsupported') return null;

    if (compact) {
        return (
            <button
                onClick={state === 'granted' ? unsubscribe : subscribe}
                disabled={state === 'loading'}
                aria-label={state === 'granted' ? "Bildirishnomalarni o'chirish" : "Bildirishnomalarni yoqish"}
                title={state === 'granted' ? "Bildirishnomalarni o'chirish" : "Bildirishnomalarni yoqish"}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    state === 'granted'
                        ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
            >
                {state === 'loading' ? <Loader2 size={16} className="animate-spin" /> :
                 state === 'granted' ? <Bell size={16} /> : <BellOff size={16} />}
            </button>
        );
    }

    return (
        <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${state === 'granted' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                {state === 'loading' ? <Loader2 size={18} className="animate-spin text-blue-500" /> :
                 state === 'granted' ? <Bell size={18} className="text-blue-600" /> :
                 state === 'denied' ? <BellOff size={18} className="text-red-400" /> :
                 <Bell size={18} className="text-gray-400" />}
            </div>
            <div className="flex-1">
                <p className="text-sm font-bold text-gray-800">
                    {state === 'granted' ? 'Bildirishnomalar yoqilgan' :
                     state === 'denied'  ? 'Bildirishnomalar bloklangan' :
                     'Bildirishnomalarni yoqing'}
                </p>
                <p className="text-xs text-gray-400">
                    {state === 'granted' ? 'Yangi buyurtmalar haqida xabardor bo\'lasiz' :
                     state === 'denied'  ? 'Brauzer sozlamalaridan yoqing' :
                     'Tezkor xabarnomalar uchun ruxsat bering'}
                </p>
            </div>
            {state !== 'denied' && (
                <button
                    onClick={state === 'granted' ? unsubscribe : subscribe}
                    disabled={state === 'loading'}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        state === 'granted'
                            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                >
                    {state === 'granted' ? "O'chirish" : 'Yoqish'}
                </button>
            )}
            {state === 'granted' && <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />}
        </div>
    );
}
