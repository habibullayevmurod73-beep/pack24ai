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

    // Config State
    const [botToken, setBotToken] = useState('');
    const [welcomeText, setWelcomeText] = useState('Assalomu alaykum, {user}! Pack24uz botiga xush kelibsiz.');
    const [mainButtonText, setMainButtonText] = useState("Do'kon 🏪");
    const [botUsername, setBotUsername] = useState('Mavjud emas');
    const [copied, setCopied] = useState(false);

    // Mock Data for stats (can be connected to backend later)
    const [botStats, setBotStats] = useState({
        name: 'Pack24 Bot',
        username: '@...',
        version: 'v1.0.0',
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
                setBotUsername(data.botUsername || 'Mavjud emas');
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
                    mainButton: mainButtonText
                })
            });

            if (res.ok) {
                const data = await res.json();
                setBotUsername(data.botUsername);
                setBotStats(prev => ({ ...prev, username: data.botUsername }));
                toast.success('Sozlamalar saqlandi');
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

    const handleCopyToken = () => {
        navigator.clipboard.writeText('/set_group -100...'); // TODO: Add group ID logic
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
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                        <Bot className="w-10 h-10" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{botStats.name}</h1>
                        <p className="text-blue-500 font-medium mb-1">{botStats.username}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium text-xs">{botStats.version}</span>
                            <span>•</span>
                            <span>{botToken ? 'Faol' : 'Faol emas'}</span>
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
                            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                <ShoppingCart className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-medium">Buyurtmalar</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{botStats.orders.toLocaleString()}</p>
                    </Card>
                </div>
            </div>

            {/* 2. Tabs */}
            <div className="flex items-center gap-8 border-b border-gray-200 mb-8">
                {['settings', 'actions', 'qr'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-4 text-sm font-medium transition-all relative ${activeTab === tab
                            ? 'text-[#064E3B] font-bold'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab === 'settings' && 'Bot sozlamalari'}
                        {tab === 'actions' && 'Amallar'}
                        {tab === 'qr' && 'QR kod'}
                        {activeTab === tab && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#064E3B] rounded-t-full" />
                        )}
                    </button>
                ))}
            </div>

            {/* Main Content */}
            <div className="grid xl:grid-cols-3 gap-8">
                {/* Left Column: Settings */}
                <div className="xl:col-span-2 space-y-8">

                    {/* Token Input */}
                    <div className="bg-white rounded-[16px] shadow-sm border border-gray-100 p-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bot Token (BotFather)</label>
                        <div className="flex gap-2">
                            <Input
                                type="password"
                                value={botToken}
                                onChange={(e) => setBotToken(e.target.value)}
                                placeholder="123456789:ABCdef..."
                                className="font-mono text-sm"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">BotFather orqali olingan tokenni kiriting.</p>
                    </div>

                    {/* 3. Connection Instructions */}
                    <div className="bg-white rounded-[16px] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-50">
                            <h2 className="text-lg font-bold text-gray-900">Buyurtmalarni Telegram guruhiga yo'naltirish</h2>
                            <p className="text-sm text-gray-500 mt-1">Bot orqali kelgan buyurtmalar menejerlar guruhiga avtomatik tushadi</p>
                        </div>
                        <div className="p-6 bg-gray-50/50">
                            <ol className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:h-full before:w-0.5 before:bg-gray-200 before:z-0">
                                <li className="relative flex items- gap-4 z-10">
                                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-white border-2 border-blue-500 text-blue-600 font-bold text-sm flex items-center justify-center shadow-sm">1</span>
                                    <p className="text-sm text-gray-700 pt-1">Telegramda yangi guruh yarating va <span className="font-semibold text-gray-900">{botStats.username}</span> ni guruhga qo'shing.</p>
                                </li>
                                <li className="relative flex items-start gap-4 z-10">
                                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-white border-2 border-blue-500 text-blue-600 font-bold text-sm flex items-center justify-center shadow-sm">2</span>
                                    <p className="text-sm text-gray-700 pt-1">Botni guruhda <b>Administrator</b> qilib tayinlang.</p>
                                </li>
                            </ol>
                        </div>
                    </div>

                    {/* 4. Multilingual Settings */}
                    <Card className="p-0 border border-gray-100 shadow-sm rounded-[16px] overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900">Bot Matnlari</h2>
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                {[
                                    { code: 'uz', label: "O'zbek", flag: '🇺🇿' },
                                    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
                                    { code: 'en', label: 'English', flag: '🇬🇧' },
                                    { code: 'tr', label: 'Türkçe', flag: '🇹🇷' }
                                ].map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => setActiveLang(lang.code)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeLang === lang.code
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        <span>{lang.flag}</span>
                                        <span className="hidden sm:inline">{lang.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Boshlang'ich matn /start
                                </label>
                                <div className="relative">
                                    <textarea
                                        value={welcomeText}
                                        onChange={(e) => setWelcomeText(e.target.value)}
                                        className="w-full min-h-[140px] p-4 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] text-gray-700 resize-y"
                                        placeholder="Botga kirganda chiqadigan matn..."
                                    />
                                    <div className="absolute bottom-3 right-3 text-xs text-gray-400 bg-white/80 px-2 py-0.5 rounded-full backdrop-blur-sm border border-gray-100">
                                        {welcomeText.length} belgi
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    <span className="text-blue-600 font-mono bg-blue-50 px-1 rounded mx-1">{'{user}'}</span> - mijoz ismi,
                                    <span className="text-blue-600 font-mono bg-blue-50 px-1 rounded mx-1">{'{bot}'}</span> - bot nomi
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Asosiy tugma nomi</label>
                                <Input
                                    value={mainButtonText}
                                    onChange={(e) => setMainButtonText(e.target.value)}
                                    placeholder="Masalan: Do'kon"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4">
                        <Button variant="secondary" className="bg-white border text-gray-700 hover:bg-gray-50">Bekor qilish</Button>
                        <Button onClick={handleSave} disabled={saving} className="bg-[#064E3B] hover:bg-[#053d2e] shadow-lg shadow-[#064E3B]/20">
                            {saving ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <Save className="w-4 h-4 mr-2" />
                            )}
                            O'zgarishlarni saqlash
                        </Button>
                    </div>
                </div>

                {/* Right Column: Real-time Preview */}
                <div className="hidden xl:block">
                    <div className="sticky top-6">
                        <div className="border-[12px] border-gray-900 rounded-[3rem] overflow-hidden shadow-2xl bg-gray-100 min-h-[600px] relative">
                            {/* iPhone Notch */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl z-20"></div>

                            {/* Telegram Header */}
                            <div className="bg-[#517DA2] text-white p-4 pt-10 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">P</div>
                                    <div>
                                        <h4 className="font-bold text-sm leading-tight">{botStats.name}</h4>
                                        <p className="text-[10px] opacity-80">bot</p>
                                    </div>
                                </div>
                            </div>

                            {/* Chat Area */}
                            <div className="p-4 space-y-4 h-[440px] overflow-y-auto bg-[#8FAEC5] bg-opacity-20 bg-[url('https://web.telegram.org/img/bg_0.png')]">
                                {/* Bot Message */}
                                <div className="bg-white p-3 rounded-2xl rounded-tl-none max-w-[85%] shadow-sm text-sm text-gray-800">
                                    {welcomeText.replace('{user}', 'Mijoz').replace('{bot}', botStats.name)}
                                </div>
                                <div className="bg-white p-3 rounded-2xl rounded-tl-none max-w-[85%] shadow-sm text-sm text-gray-800">
                                    Pastdagi tugmani bosib bizning mahsulotlar bilan tanishing 👇
                                </div>
                            </div>

                            {/* Keyboard Area */}
                            <div className="absolute bottom-0 w-full bg-[#F0F2F5] p-2 border-t border-gray-300">
                                <button className="w-full bg-white py-3 rounded-lg text-sm text-gray-800 font-medium shadow-sm active:scale-[0.99] transition-transform border border-b-2 border-gray-300">
                                    {mainButtonText}
                                </button>
                            </div>
                        </div>
                        <p className="text-center text-gray-400 text-sm mt-4">Real vaqt rejimida ko'rinish (Preview)</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
