'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
    Bot,
    Users,
    ShoppingCart,
    Copy,
    Save,
    RefreshCcw,
    Smartphone,
    Globe,
    CheckCircle,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export default function TelegramBotPage() {
    const [activeTab, setActiveTab] = useState('settings');
    const [activeLang, setActiveLang] = useState('uz');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [testLoading, setTestLoading] = useState(false);

    // Config State
    const [botToken, setBotToken] = useState('');
    const [welcomeText, setWelcomeText] = useState('Assalomu alaykum, {user}! Pack24uz botiga xush kelibsiz.');
    const [mainButtonText, setMainButtonText] = useState("Do'kon 🏪");
    const [botUsername, setBotUsername] = useState('Mavjud emas');
    const [copied, setCopied] = useState(false);
    const [salesChatId, setSalesChatId] = useState('');
    const [webhookInfo, setWebhookInfo] = useState<any>(null);

    // Mock Data for stats
    const [botStats, setBotStats] = useState({
        name: 'PACK24AI_bot',
        username: '@...',
        version: 'v2.0.0 (Recycling Ready)',
        lastUpdated: 'Hozir',
        subscribers: 0,
        orders: 0
    });

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/telegram/config');
            if (res.ok) {
                const data = await res.json();
                setBotToken(data.botToken || '');
                setWelcomeText(data.welcomeMessage || '');
                setMainButtonText(data.mainButton || '');
                setSalesChatId(data.salesChatId || '');
                setBotUsername(data.botUsername || 'Mavjud emas');
                setWebhookInfo(data.webhookInfo);
                setBotStats(prev => ({ ...prev, username: data.botUsername || '@...' }));
            }
        } catch (error) {
            console.error('Error fetching config:', error);
            toast.error('Sozlamalarni yuklashda xatolik');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/telegram/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    botToken,
                    welcomeMessage: welcomeText,
                    mainButton: mainButtonText,
                    salesChatId
                })
            });

            if (res.ok) {
                const data = await res.json();
                setBotUsername(data.botUsername);
                setBotStats(prev => ({ ...prev, username: data.botUsername }));
                toast.success('Sozlamalar saqlandi');
                fetchConfig(); // Refresh to get webhook info
            } else {
                toast.error('Saqlashda xatolik');
            }
        } catch (error) {
            console.error('Error saving:', error);
            toast.error('Xatolik yuz berdi');
        } finally {
            setSaving(false);
        }
    };

    const handleTest = async () => {
        setTestLoading(true);
        try {
            const res = await fetch('/api/admin/telegram/test', { method: 'POST' });
            const data = await res.json();
            
            if (res.ok) {
                const successCount = data.results?.filter((r: any) => r.status === 'success').length || 0;
                if (successCount > 0) {
                    toast.success(`${successCount} ta manzilga test xabari yuborildi!`);
                } else {
                    toast.warning('Bot ishlamoqda, lekin Chat ID-lar xato yoki kiritilmagan.');
                }
            } else {
                toast.error(data.error || 'Testda xatolik');
            }
        } catch (error) {
            toast.error('Server bilan bog\'lanishda xatolik');
        } finally {
            setTestLoading(false);
        }
    };

    const handleCopyToken = () => {
        navigator.clipboard.writeText('/set_group'); 
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return <div className="p-6 flex items-center justify-center min-h-screen">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>;
    }

    return (
        <div className="p-6 bg-[#F9FAFB] min-h-screen">
            {/* 1. Header with Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <Card className="col-span-2 p-6 flex items-center gap-6 border border-gray-100 shadow-sm rounded-[16px]">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                        <Bot className="w-10 h-10" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{botStats.name}</h1>
                        <p className="text-emerald-500 font-medium mb-1">{botStats.username}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium text-xs">{botStats.version}</span>
                            <span>•</span>
                            <span className={botToken ? 'text-emerald-600 font-bold' : 'text-red-500'}>
                                {botToken ? 'Faol' : 'Faol emas'}
                            </span>
                        </div>
                    </div>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                    <Card className="p-5 flex flex-col justify-center border border-gray-100 shadow-sm rounded-[16px]">
                        <div className="flex items-center gap-3 mb-2 text-gray-500">
                            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                <Users className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-medium">Mijozlar</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{botStats.subscribers.toLocaleString()}</p>
                    </Card>
                    <Card className="p-5 flex flex-col justify-center border border-gray-100 shadow-sm rounded-[16px]">
                        <div className="flex items-center gap-3 mb-2 text-gray-500">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                <ShoppingCart className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-medium">Topshiriqlar</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{botStats.orders.toLocaleString()}</p>
                    </Card>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid xl:grid-cols-3 gap-8">
                {/* Left Column: Settings */}
                <div className="xl:col-span-2 space-y-8">

                    {/* Webhook Status */}
                    {botToken && (
                        <Card className={`p-4 border-l-4 rounded-xl flex items-center justify-between ${webhookInfo?.url ? 'border-emerald-500 bg-emerald-50/30' : 'border-amber-500 bg-amber-50/30'}`}>
                            <div className="flex items-center gap-3">
                                <Globe className={webhookInfo?.url ? 'text-emerald-600' : 'text-amber-600'} size={20} />
                                <div>
                                    <p className="text-sm font-bold text-gray-900">Webhook Holati</p>
                                    <p className="text-xs text-gray-500 truncate max-w-[300px]">
                                        {webhookInfo?.url || 'Webhook sozlanmagan'}
                                    </p>
                                </div>
                            </div>
                            {webhookInfo?.pending_update_count > 0 && (
                                <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                                    {webhookInfo.pending_update_count} kutilmoqda
                                </Badge>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => fetchConfig()} title="Yangilash">
                                <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
                            </Button>
                        </Card>
                    )}

                    {/* Token Input */}
                    <div className="bg-white rounded-[16px] shadow-sm border border-gray-100 p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Bot Token (BotFather)</label>
                            <Input
                                type="password"
                                value={botToken}
                                onChange={(e) => setBotToken(e.target.value)}
                                placeholder="123456789:ABCdef..."
                                className="font-mono text-sm"
                            />
                            <p className="text-xs text-gray-500 mt-2">BotFather orqali olingan tokenni kiriting.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Menejerlar Guruh ID (salesChatId)</label>
                            <Input
                                value={salesChatId}
                                onChange={(e) => setSalesChatId(e.target.value)}
                                placeholder="-100123456789"
                                className="font-mono text-sm"
                            />
                            <p className="text-xs text-gray-500 mt-2">Yangi arizalar haqida xabar boradigan guruh yoki kanal ID-si. Vergul bilan bir nechta yozish mumkin.</p>
                        </div>
                    </div>

                    {/* 3. Connection Instructions */}
                    <div className="bg-white rounded-[16px] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-50">
                            <h2 className="text-lg font-bold text-gray-900">Botni Sozlash Bo'yicha Qo'llanma</h2>
                            <p className="text-sm text-gray-500 mt-1">Bot barcha rollar (Admin, Masul, Haydovchi, Mijoz) uchun xizmat qiladi</p>
                        </div>
                        <div className="p-6 bg-gray-50/50">
                            <ol className="space-y-4 relative">
                                <li className="flex gap-4">
                                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-500 text-white font-bold text-sm flex items-center justify-center">1</span>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Tokenni kiriting</p>
                                        <p className="text-xs text-gray-600">BotFather'dan olingan tokenni kiriting va saqlashni bosing. Webhook avtomatik sozlanadi.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-500 text-white font-bold text-sm flex items-center justify-center">2</span>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Masul va Haydovchilarni biriktiring</p>
                                        <p className="text-xs text-gray-600">Admin paneldagi "Recycling" bo'limida Masul va Haydovchilarga o'zlarining Telegram ID raqamlarini kiriting.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-500 text-white font-bold text-sm flex items-center justify-center">3</span>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Botni guruhga qo'shing</p>
                                        <p className="text-xs text-gray-600">Agar arizalar guruhga tushishini xohlasangiz, botni guruhga qo'shing va guruh ID-sini yuqorida ko'rsating.</p>
                                    </div>
                                </li>
                            </ol>
                        </div>
                    </div>

                    {/* 4. Multilingual Settings */}
                    <Card className="p-0 border border-gray-100 shadow-sm rounded-[16px] overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900">Mijozlar uchun Xush Kelibsiz Matni</h2>
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                <Badge variant="secondary" className="bg-white text-gray-700 shadow-sm">🇺🇿 O'zbek</Badge>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Boshlang'ich matn /start
                                </label>
                                <textarea
                                    value={welcomeText}
                                    onChange={(e) => setWelcomeText(e.target.value)}
                                    className="w-full min-h-[120px] p-4 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-700 resize-none text-sm"
                                    placeholder="Botga kirganda chiqadigan matn..."
                                />
                                <p className="text-[10px] text-gray-500 mt-2">
                                    <span className="text-blue-600 font-mono bg-blue-50 px-1 rounded mx-1">{'{user}'}</span> - ismi,
                                    <span className="text-blue-600 font-mono bg-blue-50 px-1 rounded mx-1">{'{bot}'}</span> - bot nomi
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Web App Tugmasi</label>
                                <Input
                                    value={mainButtonText}
                                    onChange={(e) => setMainButtonText(e.target.value)}
                                    placeholder="Masalan: Katalog"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4">
                        <Button 
                            onClick={handleTest} 
                            disabled={testLoading || !botToken} 
                            variant="secondary" 
                            className="border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 px-6 py-6 rounded-2xl font-bold"
                        >
                            {testLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            ) : (
                                <Smartphone className="w-5 h-5 mr-2" />
                            )}
                            BOTNI TEKSHIRISH
                        </Button>
                        <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 px-8 py-6 rounded-2xl font-bold">
                            {saving ? (
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            ) : (
                                <Save className="w-5 h-5 mr-2" />
                            )}
                            SOZLAMALARNI SAQLASH
                        </Button>
                    </div>
                </div>

                {/* Right Column: Real-time Preview */}
                <div className="hidden xl:block">
                    <div className="sticky top-6">
                        <div className="border-[12px] border-gray-900 rounded-[3rem] overflow-hidden shadow-2xl bg-gray-100 min-h-[600px] relative">
                            {/* iPhone UI */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl z-20"></div>

                            {/* Telegram Header */}
                            <div className="bg-[#517DA2] text-white p-4 pt-10 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold font-mono">
                                        {botStats.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm leading-tight">{botStats.name}</h4>
                                        <p className="text-[10px] opacity-80">bot</p>
                                    </div>
                                </div>
                            </div>

                            {/* Chat Area */}
                            <div className="p-4 space-y-4 h-[440px] overflow-y-auto bg-[#8FAEC5]/20 bg-[url('https://web.telegram.org/img/bg_0.png')]">
                                <div className="bg-white p-3 rounded-2xl rounded-tl-none max-w-[85%] shadow-sm text-[13px] text-gray-800 leading-relaxed whitespace-pre-wrap">
                                    {welcomeText.replace('{user}', 'Mijoz').replace('{bot}', botStats.name)}
                                    {"\n\n"}
                                    ♻️ Makulatura topshirish uchun <b>/ariza</b> buyrug'ini yuboring!
                                </div>
                            </div>

                            {/* Keyboard Area */}
                            <div className="absolute bottom-0 w-full bg-[#F0F2F5]/90 backdrop-blur-md p-3 border-t border-gray-300 space-y-2">
                                <button className="w-full bg-white py-3 rounded-xl text-sm text-[#0088CC] font-bold shadow-sm border border-gray-200">
                                    {mainButtonText}
                                </button>
                                <button className="w-full bg-white py-3 rounded-xl text-sm text-gray-800 font-medium shadow-sm border border-gray-200">
                                    ♻️ Ariza yuborish
                                </button>
                            </div>
                        </div>
                        <p className="text-center text-gray-400 text-xs mt-4 uppercase font-bold tracking-widest">Bot Preview</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
