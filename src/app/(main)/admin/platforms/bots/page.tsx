'use client';

import { useEffect, useState } from 'react';
import { Bot, CheckCircle, XCircle, Loader2, Wifi, WifiOff, RefreshCw, Globe, Radio } from 'lucide-react';

interface BotStatus {
    name: string;
    username: string;
    envKey: string;
    hasToken: boolean;
    description: string;
    webhookInfo?: {
        url: string;
        has_custom_certificate: boolean;
        pending_update_count: number;
        last_error_message?: string;
    };
}

interface SetupResult {
    bot: string;
    status: string;
    url?: string;
}

export default function BotsPage() {
    const [bots, setBots] = useState<BotStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [setupLoading, setSetupLoading] = useState(false);
    const [setupResults, setSetupResults] = useState<SetupResult[]>([]);
    const [baseUrl, setBaseUrl] = useState('');

    // Botlar holatini yuklash
    const fetchBots = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/telegram/setup');
            const data = await res.json();
            setBots(data.bots || []);
        } catch (err) {
            console.error('Botlar yuklanmadi:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBots();
        // Auto-detect base URL
        setBaseUrl(window.location.origin);
    }, []);

    // Webhook o'rnatish
    const setupWebhooks = async () => {
        if (!baseUrl) return;
        setSetupLoading(true);
        setSetupResults([]);
        try {
            const res = await fetch('/api/telegram/setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode: 'webhook', baseUrl }),
            });
            const data = await res.json();
            setSetupResults(data.bots || []);
            fetchBots();
        } catch (err) {
            console.error('Webhook xatolik:', err);
        } finally {
            setSetupLoading(false);
        }
    };

    // Polling boshlash
    const startPolling = async () => {
        setSetupLoading(true);
        setSetupResults([]);
        try {
            const res = await fetch('/api/telegram/setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode: 'polling' }),
            });
            const data = await res.json();
            setSetupResults(data.bots || []);
        } catch (err) {
            console.error('Polling xatolik:', err);
        } finally {
            setSetupLoading(false);
        }
    };

    // Webhooklarni o'chirish
    const deleteWebhooks = async () => {
        setSetupLoading(true);
        setSetupResults([]);
        try {
            const res = await fetch('/api/telegram/setup', { method: 'DELETE' });
            const data = await res.json();
            setSetupResults(data.bots || []);
            fetchBots();
        } catch (err) {
            console.error('Delete xatolik:', err);
        } finally {
            setSetupLoading(false);
        }
    };

    const botIcons = ['🛒', '🚚', '👷'];
    const botColors = [
        'from-blue-500 to-indigo-600',
        'from-amber-500 to-orange-600',
        'from-emerald-500 to-teal-600',
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <Bot className="text-blue-600" size={28} />
                        Telegram Botlar Boshqaruvi
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        3 ta bot: Mijoz, Haydovchi, Masul — barcha tokenlar <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">.env</code> da
                    </p>
                </div>
                <button
                    onClick={fetchBots}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Yangilash
                </button>
            </div>

            {/* Bot Cards */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-blue-500" size={32} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {bots.map((bot, i) => (
                        <div key={bot.envKey} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            {/* Bot Header */}
                            <div className={`bg-gradient-to-r ${botColors[i] || botColors[0]} p-5 text-white`}>
                                <div className="flex items-center justify-between">
                                    <span className="text-3xl">{botIcons[i]}</span>
                                    {bot.hasToken ? (
                                        <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                                            <CheckCircle size={14} />
                                            Token ✓
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 bg-red-500/30 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                                            <XCircle size={14} />
                                            Token yo&apos;q
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-lg font-bold mt-3">{bot.name}</h3>
                                <p className="text-white/80 text-sm">{bot.username}</p>
                            </div>

                            {/* Bot Info */}
                            <div className="p-5 space-y-3">
                                <p className="text-sm text-slate-600">{bot.description}</p>

                                <div className="flex items-center gap-2 text-xs">
                                    <span className="text-slate-400">ENV:</span>
                                    <code className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-slate-700 font-mono">{bot.envKey}</code>
                                </div>

                                {bot.hasToken ? (
                                    <div className="flex items-center gap-2 text-emerald-600 text-sm">
                                        <Wifi size={16} />
                                        <span>Tayyor — webhook/polling o&apos;rnatish mumkin</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-red-500 text-sm">
                                        <WifiOff size={16} />
                                        <span>.env ga token qo&apos;shing</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Control Panel */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
                <h2 className="text-lg font-bold text-slate-800">⚙️ Bot sozlamalari</h2>

                {/* Base URL Input */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Base URL (webhook uchun)
                    </label>
                    <input
                        type="text"
                        value={baseUrl}
                        onChange={(e) => setBaseUrl(e.target.value)}
                        placeholder="https://pack24.uz"
                        className="w-full md:w-96 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                        Production: https://pack24.uz | Dev: http://localhost:3000
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={setupWebhooks}
                        disabled={setupLoading || !baseUrl}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm"
                    >
                        {setupLoading ? <Loader2 size={16} className="animate-spin" /> : <Globe size={16} />}
                        🌐 Webhook o&apos;rnatish
                    </button>

                    <button
                        onClick={startPolling}
                        disabled={setupLoading}
                        className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm"
                    >
                        {setupLoading ? <Loader2 size={16} className="animate-spin" /> : <Radio size={16} />}
                        🔄 Polling boshlash (Dev)
                    </button>

                    <button
                        onClick={deleteWebhooks}
                        disabled={setupLoading}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                        ❌ Webhookni o&apos;chirish
                    </button>
                </div>
            </div>

            {/* Setup Results */}
            {setupResults.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">📋 Natijalar</h3>
                    <div className="space-y-3">
                        {setupResults.map((r, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <span className="text-lg mt-0.5">
                                    {r.status.startsWith('✅') ? '✅' : r.status.startsWith('⚠️') ? '⚠️' : '❌'}
                                </span>
                                <div>
                                    <p className="font-semibold text-sm text-slate-800">{r.bot}</p>
                                    <p className="text-sm text-slate-600">{r.status}</p>
                                    {r.url && (
                                        <code className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded mt-1 inline-block">{r.url}</code>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Architecture Diagram */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white">
                <h3 className="text-lg font-bold mb-4">🏗️ Multi-Bot Arxitektura</h3>
                <pre className="text-sm text-slate-300 font-mono overflow-x-auto whitespace-pre">{`
┌─────────────────────────────────────────────────────────┐
│                    TELEGRAM CLOUD                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Mijoz Bot│  │Driver Bot│  │Admin Bot │              │
│  │@Pack24AI │  │@pack24MX │  │@pack24AUP│              │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘              │
└───────┼─────────────┼─────────────┼─────────────────────┘
        │             │             │
   Webhook/Poll  Webhook/Poll  Webhook/Poll
        │             │             │
┌───────┼─────────────┼─────────────┼─────────────────────┐
│       ▼             ▼             ▼     PACK24 SERVER   │
│  /webhook      /webhook/drv  /webhook/adm               │
│       │             │             │                      │
│  customerBot   driverBot     adminBot                    │
│       │             │             │                      │
│       └─────── notifier.ts ───────┘ ← cross-bot xabar   │
│                     │                                    │
│              ┌──────┴──────┐                             │
│              │  PostgreSQL │ (Neon)                       │
│              │   Prisma    │                             │
│              └─────────────┘                             │
└──────────────────────────────────────────────────────────┘
`}</pre>
            </div>
        </div>
    );
}
