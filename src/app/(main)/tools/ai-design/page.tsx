'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useState, useCallback } from 'react';
import {
    ChevronRight, Sparkles, RefreshCw, Download, Image as ImageIcon,
    ZoomIn, Check, Wand2, Share2, Copy
} from 'lucide-react';
import { toast } from 'sonner';

// ─────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────
const STYLE_OPTIONS = [
    { id: 'minimalist',  uz: 'Minimalist',    ru: 'Минималист',    emoji: '⬜', suffix: 'minimalist flat design, clean white background, thin lines' },
    { id: 'luxury',      uz: 'Hashamatli',    ru: 'Роскошный',     emoji: '✨', suffix: 'luxury premium packaging, gold foil, dark background, elegant' },
    { id: 'eco',         uz: 'Ekologik',      ru: 'Экологичный',   emoji: '🌿', suffix: 'eco-friendly natural kraft paper packaging, earthy green tones' },
    { id: 'bold',        uz: 'Dadil',         ru: 'Дерзкий',       emoji: '🎨', suffix: 'bold colorful packaging, vibrant gradients, modern typography' },
    { id: 'vintage',     uz: 'Vintage',       ru: 'Ретро',         emoji: '🎞️', suffix: 'vintage retro packaging design, antique label, aged texture' },
    { id: 'playful',     uz: 'Quvnoq',        ru: 'Игривый',       emoji: '🎉', suffix: 'playful fun packaging, bright colors, cartoon elements, kids' },
    { id: 'corporate',   uz: 'Korporativ',    ru: 'Корпоративный', emoji: '💼', suffix: 'corporate professional packaging, navy blue, structured grid layout' },
    { id: 'modern',      uz: 'Zamonaviy',     ru: 'Современный',   emoji: '🔷', suffix: 'modern sleek packaging, geometric shapes, sans-serif, monochromatic' },
];

const EXAMPLE_PROMPTS = [
    { uz: "Muzqaymoq brendi uchun qadoq",   ru: "Упаковка для бренда мороженого" },
    { uz: "Ekologik qahva to'plami",         ru: "Экологичный кофейный набор" },
    { uz: "Hashamatli parfyum qutisi",       ru: "Роскошная коробка для парфюма" },
    { uz: "Minimalist choy qadoqlash",       ru: "Минималистичная упаковка для чая" },
    { uz: "Vitamin shisha dizayni",          ru: "Дизайн флакона для витаминов" },
];

// ─────────────────────────────────────────────────────────────
// Generate via Pollinations.ai (free, no API key needed)
// ─────────────────────────────────────────────────────────────
function buildImageUrl(prompt: string, styleSuffix: string, seed: number, width = 512, height = 512) {
    const fullPrompt = `product packaging design mockup, ${prompt}, ${styleSuffix}, professional product photo, studio lighting, isolated on white, high quality render`;
    const encoded = encodeURIComponent(fullPrompt);
    return `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&seed=${seed}&nologo=true&enhance=true`;
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────
export default function AIDesignPage() {
    const { language } = useLanguage();
    const [prompt, setPrompt] = useState('');
    const [selectedStyle, setSelectedStyle] = useState('minimalist');
    const [isGenerating, setIsGenerating] = useState(false);
    const [results, setResults] = useState<{ url: string; seed: number; label: string }[]>([]);
    const [selectedImg, setSelectedImg] = useState<string | null>(null);
    const [loadedCount, setLoadedCount] = useState(0);

    const t = (uz: string, ru: string) => language === 'ru' ? ru : uz;

    const style = STYLE_OPTIONS.find(s => s.id === selectedStyle)!;

    // ── Generate: 4 variants (different seeds) ────────────────
    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) return;
        setIsGenerating(true);
        setResults([]);
        setSelectedImg(null);
        setLoadedCount(0);

        const seeds = [
            Math.floor(Math.random() * 9999),
            Math.floor(Math.random() * 9999),
            Math.floor(Math.random() * 9999),
            Math.floor(Math.random() * 9999),
        ];

        const newResults = seeds.map((seed, i) => ({
            url: buildImageUrl(prompt, style.suffix, seed),
            seed,
            label: `Variant ${i + 1}`,
        }));

        setResults(newResults);
        setIsGenerating(false);
        toast.success(t("4 ta variant yaratilmoqda...", "Генерируем 4 варианта..."));
    }, [prompt, style, language]);

    // ── Download ──────────────────────────────────────────────
    const handleDownload = async (url: string, label: string) => {
        try {
            const res = await fetch(url);
            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `pack24-ai-design-${label}.jpg`;
            a.click();
            URL.revokeObjectURL(blobUrl);
            toast.success(t("Yuklab olindi!", "Скачано!"));
        } catch {
            toast.error(t("Yuklab olishda xato", "Ошибка загрузки"));
        }
    };

    // ── Copy URL ──────────────────────────────────────────────
    const handleCopy = (url: string) => {
        navigator.clipboard.writeText(url);
        toast.success(t("Havola nusxalandi!", "Ссылка скопирована!"));
    };

    const allLoaded = loadedCount >= 4;

    return (
        <div className="min-h-screen bg-[#f5f6fa]">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 py-6">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                        <Link href="/tools" className="hover:text-blue-600">{t("Asboblar", "Инструменты")}</Link>
                        <ChevronRight size={14} />
                        <span className="text-gray-700 font-medium">AI Packaging Design</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center">
                            <Sparkles size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold text-gray-900">
                                {t("AI Qadoq Dizayni", "AI Дизайн упаковки")}
                            </h1>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {t("Matn orqali professional qadoq dizaynlari yarating", "Создавайте профессиональные дизайны упаковок по тексту")}
                                {' '}· <span className="text-emerald-500 font-semibold">{t("Bepul · API talab qilmaydi", "Бесплатно · Без API ключа")}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col xl:flex-row gap-8">

                    {/* ── LEFT ───────────────────────────────────────────── */}
                    <div className="flex-1 min-w-0 space-y-6">

                        {/* Prompt input */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <label className="block text-sm font-bold text-gray-800 mb-3">
                                {t("Qadoqni tasvirlab bering", "Опишите упаковку")}
                            </label>
                            <div className="relative">
                                <textarea
                                    value={prompt}
                                    onChange={e => setPrompt(e.target.value.slice(0, 300))}
                                    placeholder={t(
                                        "Masalan: Organik asal brendi uchun minimalist stil qadoq, yashil va oltin ranglar, ekologik material...",
                                        "Например: Минималистичная упаковка для бренда органического мёда, зелёные и золотые цвета..."
                                    )}
                                    rows={4}
                                    className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 resize-none"
                                />
                                <div className="absolute bottom-3 right-3 text-xs text-gray-300">{prompt.length}/300</div>
                            </div>

                            {/* Example prompts */}
                            <div className="mt-3">
                                <p className="text-xs text-gray-400 mb-2">{t("Namunalar:", "Примеры:")}</p>
                                <div className="flex flex-wrap gap-2">
                                    {EXAMPLE_PROMPTS.map((p, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setPrompt(language === 'ru' ? p.ru : p.uz)}
                                            className="text-xs bg-orange-50 hover:bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full border border-orange-100 transition-colors"
                                        >
                                            {language === 'ru' ? p.ru : p.uz}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleGenerate}
                                disabled={!prompt.trim() || isGenerating}
                                className="mt-4 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-rose-500 disabled:from-gray-200 disabled:to-gray-300 disabled:text-gray-400 text-white font-bold py-3.5 rounded-xl transition-all hover:opacity-90 active:scale-[0.98] shadow-lg shadow-orange-200"
                            >
                                {isGenerating ? (
                                    <><RefreshCw size={16} className="animate-spin" /> {t("Yaratilmoqda...", "Генерация...")}</>
                                ) : (
                                    <><Wand2 size={16} /> {t("4 ta variant yaratish", "Создать 4 варианта")}</>
                                )}
                            </button>
                        </div>

                        {/* Style selector */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <p className="text-sm font-bold text-gray-800 mb-4">
                                {t("Dizayn uslubi", "Стиль дизайна")}
                            </p>
                            <div className="grid grid-cols-4 gap-2">
                                {STYLE_OPTIONS.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => setSelectedStyle(s.id)}
                                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all relative ${
                                            selectedStyle === s.id
                                                ? 'border-orange-500 bg-orange-50'
                                                : 'border-gray-100 hover:border-orange-200 hover:bg-orange-50/50'
                                        }`}
                                    >
                                        <span className="text-2xl">{s.emoji}</span>
                                        <span className="text-[10px] font-semibold text-gray-700 text-center">
                                            {language === 'ru' ? s.ru : s.uz}
                                        </span>
                                        {selectedStyle === s.id && (
                                            <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                                                <Check size={9} className="text-white" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Results */}
                        {results.length > 0 && (
                            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-sm font-bold text-gray-800">
                                        {t("AI yaratgan variantlar", "Варианты от AI")}
                                        {!allLoaded && (
                                            <span className="ml-2 text-xs text-orange-500 font-normal">
                                                {t(`${loadedCount}/4 yuklanyapti...`, `${loadedCount}/4 загружается...`)}
                                            </span>
                                        )}
                                    </p>
                                    <button onClick={handleGenerate} className="text-xs text-orange-600 flex items-center gap-1 hover:text-orange-700">
                                        <RefreshCw size={12} /> {t("Qayta yaratish", "Перегенерировать")}
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {results.map((r, i) => (
                                        <div key={r.seed} className="relative group rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                                            <img
                                                src={r.url}
                                                alt={r.label}
                                                className="w-full h-48 object-cover"
                                                onLoad={() => setLoadedCount(c => c + 1)}
                                                onError={() => setLoadedCount(c => c + 1)}
                                            />
                                            {/* Loading overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse data-[loaded]:hidden" id={`loader-${i}`}>
                                                <Sparkles size={24} className="text-gray-300" />
                                            </div>
                                            {/* Hover overlay */}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                                <p className="text-white text-xs font-bold">{r.label}</p>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setSelectedImg(r.url)}
                                                        aria-label={t("Kattalashtirish", "Увеличить")}
                                                        className="p-2 bg-white/90 rounded-xl hover:bg-white"
                                                    >
                                                        <ZoomIn size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownload(r.url, r.label)}
                                                        aria-label={t("Yuklab olish", "Скачать")}
                                                        className="p-2 bg-white/90 rounded-xl hover:bg-white"
                                                    >
                                                        <Download size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleCopy(r.url)}
                                                        aria-label={t("Nusxa olish", "Копировать")}
                                                        className="p-2 bg-white/90 rounded-xl hover:bg-white"
                                                    >
                                                        <Copy size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[10px] text-gray-400 text-center mt-3">
                                    {t("Pollinations AI tomonidan yaratildi · Bepul foydalanish", "Создано с помощью Pollinations AI · Бесплатно")}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* ── RIGHT ──────────────────────────────────────────── */}
                    <div className="xl:w-72 flex-shrink-0 space-y-4">
                        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                            <p className="text-sm font-bold text-gray-800 mb-4">
                                {t("Qanday ishlaydi?", "Как это работает?")}
                            </p>
                            <div className="space-y-4">
                                {[
                                    { step: '1', uz: "Qadoqni ingliz yoki rus tilida tasvirlab bering", ru: "Опишите упаковку на русском или английском", icon: '✏️' },
                                    { step: '2', uz: "Dizayn uslubini tanlang (minimalist, hashamatli, eco...)", ru: "Выберите стиль дизайна", icon: '🎨' },
                                    { step: '3', uz: "\"4 ta variant yaratish\" tugmasini bosing", ru: "Нажмите «Создать 4 варианта»", icon: '✨' },
                                    { step: '4', uz: "Yoqtirgan variantni yuklab oling", ru: "Скачайте понравившийся вариант", icon: '📥' },
                                ].map(({ step, uz, ru, icon }) => (
                                    <div key={step} className="flex items-start gap-3">
                                        <div className="w-7 h-7 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0">
                                            {step}
                                        </div>
                                        <p className="text-xs text-gray-600 leading-relaxed pt-0.5">
                                            <span className="mr-1">{icon}</span>
                                            {language === 'ru' ? ru : uz}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="bg-gradient-to-br from-orange-50 to-rose-50 border border-orange-100 rounded-2xl p-5">
                            <p className="text-xs font-bold text-orange-700 mb-2">💡 {t("Maslahat", "Совет")}</p>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                {t(
                                    "Yaxshi natija uchun qadoqning maqsadi, rang sxemasi va brend nomini aniq yozing. Ingliz tilida tavsif ko'proq aniqlik beradi.",
                                    "Для лучшего результата укажите назначение упаковки, цветовую схему и название бренда. Описание на английском даёт больше точности."
                                )}
                            </p>
                        </div>

                        <Link href="/tools/mockup-generator" className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-orange-200 hover:shadow-sm transition-all group">
                            <div>
                                <p className="text-sm font-semibold text-gray-800">
                                    {t("3D Mockupga qo'llash", "Применить к 3D Mockup")}
                                </p>
                                <p className="text-xs text-gray-400">Mockup Generator</p>
                            </div>
                            <ChevronRight size={16} className="text-gray-400 group-hover:text-orange-500 transition-colors" />
                        </Link>

                        <Link href="/tools" className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-orange-200 hover:shadow-sm transition-all group">
                            <div>
                                <p className="text-sm font-semibold text-gray-800">{t("Boshqa asboblar", "Другие инструменты")}</p>
                                <p className="text-xs text-gray-400">Mockup, Dieline, 3D...</p>
                            </div>
                            <ChevronRight size={16} className="text-gray-400 group-hover:text-orange-500 transition-colors" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Lightbox */}
            {selectedImg && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setSelectedImg(null)}
                >
                    <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
                        <img src={selectedImg} alt="Kattalashtirish" className="w-full rounded-2xl shadow-2xl" />
                        <div className="flex gap-2 mt-3 justify-center">
                            <button
                                onClick={() => handleDownload(selectedImg, 'ai-design')}
                                className="flex items-center gap-2 bg-white text-gray-800 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-gray-50"
                            >
                                <Download size={14} /> {t("Yuklab olish", "Скачать")}
                            </button>
                            <button
                                onClick={() => setSelectedImg(null)}
                                className="bg-gray-800 text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-gray-700"
                            >
                                {t("Yopish", "Закрыть")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
