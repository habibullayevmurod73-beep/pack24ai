'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/Switch';
import { ArrowLeft, Sparkles, Wand2, Upload, Info, Plus, X, Loader2, Image as ImageIcon, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useProductStore } from '@/lib/store/useProductStore';
import { useRouter } from 'next/navigation';
import { useCategoryStore } from '@/lib/store/useCategoryStore';
import { useHasMounted } from '@/lib/hooks/useHasMounted';
import { ChevronDown } from 'lucide-react';

const LANGUAGES = [
    { code: 'uz', label: "O'zbek", flag: '🇺🇿' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'tr', label: 'Türkçe', flag: '🇹🇷' }
];

export default function NewProductPage() {
    const [activeLang, setActiveLang] = useState('uz');
    const categories = useCategoryStore((state) => state.categories);
    const hasMounted = useHasMounted();

    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSubCategory, setSelectedSubCategory] = useState('');
    const router = useRouter();
    const addProduct = useProductStore(state => state.addProduct);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    // Specifications State
    const [specs, setSpecs] = useState<{ id: string; key: string; value: string }[]>([]);

    const addSpec = () => {
        setSpecs([...specs, { id: Date.now().toString(), key: '', value: '' }]);
    };

    const updateSpec = (id: string, field: 'key' | 'value', value: string) => {
        setSpecs(specs.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const removeSpec = (id: string) => {
        setSpecs(specs.filter(s => s.id !== id));
    };

    const handleSave = async () => {
        if (!name) { toast.error("Mahsulot nomini kiriting!"); return; }

        const finalPrice = parseFloat(price) || (parseFloat(cost) + parseFloat(profit)) || 0;
        if (!finalPrice) { toast.error("Narxni kiriting!"); return; }
        if (!selectedCategory) { toast.error("Kategoriyani tanlang!"); return; }

        // Category name resolution
        const selectedCatObj = categories.find(c => c.id === selectedCategory);
        let categoryName = selectedCatObj ? (selectedCatObj.name.uz || selectedCatObj.name.ru || '') : selectedCategory;
        if (selectedSubCategory && selectedCatObj?.children) {
            const sub = selectedCatObj.children.find(s => s.id === selectedSubCategory);
            if (sub) categoryName = sub.name.uz || sub.name.ru || categoryName;
        }

        const payload = {
            name,
            description,
            price: finalPrice,
            originalPrice: parseFloat(cost) > 0 ? parseFloat(cost) : null,
            image: uploadedImage || '/placeholder.png',
            category: categoryName,
            status: 'active',
            inStock: true,
            gallery: [],
            specifications: specs.reduce((acc, curr) => {
                if (curr.key.trim()) acc[curr.key.trim()] = curr.value.trim();
                return acc;
            }, {} as Record<string, string>),
        };

        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.error || 'Server xatosi');
            }
            toast.success("Mahsulot muvaffaqiyatli saqlandi! ✅");
            router.push('/admin/products');
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Xatolik yuz berdi");
        }
    };

    // Pricing State
    const [cost, setCost] = useState<string>(''); // Tannarx
    const [profit, setProfit] = useState<string>(''); // Foyda
    const [price, setPrice] = useState<string>(''); // Narx (Calculated)
    const [margin, setMargin] = useState<string>(''); // Marja (Calculated)

    // Image State
    const [imageUrlInput, setImageUrlInput] = useState('');
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Auto-calculation Logic
    useEffect(() => {
        const costNum = parseFloat(cost) || 0;
        const profitNum = parseFloat(profit) || 0;

        if (costNum >= 0 && profitNum >= 0) {
            const calculatedPrice = costNum + profitNum;
            setPrice(calculatedPrice > 0 ? calculatedPrice.toFixed(2) : '');

            const calculatedMargin = calculatedPrice > 0 ? (profitNum / calculatedPrice) * 100 : 0;
            setMargin(calculatedMargin > 0 ? calculatedMargin.toFixed(2) : '');
        }
    }, [cost, profit]);

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleLocalImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith('image/')) {
            toast.error("Faqat rasm fayllari yuklanishi mumkin!");
            return;
        }
        if (file.size > 10 * 1024 * 1024) { // 10MB
            toast.error("Rasm hajmi 10 MB dan oshmasligi kerak!");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload/file', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setUploadedImage(data.url);
                toast.success("Rasm muvaffaqiyatli yuklandi!");
            } else {
                toast.error(data.error || "Yuklashda xatolik");
            }
        } catch (error) {
            console.error(error);
            toast.error("Tarmoq xatosi");
        } finally {
            setIsUploading(false);
        }
    };

    const handleUrlUpload = async () => {
        if (!imageUrlInput) return;

        setIsUploading(true);
        try {
            const response = await fetch('/api/upload/url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: imageUrlInput }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setUploadedImage(data.url);
                toast.success("Rasm muvaffaqiyatli yuklandi!");
                setImageUrlInput('');
            } else {
                toast.error(data.error || "Yuklashda xatolik");
            }
        } catch (error) {
            console.error(error);
            toast.error("Server bilan bog'lanishda xatolik");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="p-6 bg-[#F9FAFB] min-h-screen pb-24">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-[#F9FAFB] z-10 py-2">
                <div className="flex items-center gap-4">
                    <Link href="/admin/products">
                        <Button variant="ghost" size="icon" className="rounded-full bg-white border border-gray-200">
                            <ArrowLeft className="w-5 h-5 text-gray-500" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Mahsulot qo'shish</h1>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" className="bg-white">Bekor qilish</Button>
                    <Button onClick={handleSave}>Saqlash</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content (Left Column) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Language Tabs & Basic Info */}
                    <Card>
                        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 border-b border-gray-100">
                            {LANGUAGES.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => setActiveLang(lang.code)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeLang === lang.code
                                        ? 'bg-white shadow-sm border border-gray-200 text-gray-900 ring-1 ring-black/5'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <span>{lang.flag}</span>
                                    {lang.label}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="text-sm font-medium text-gray-700 ml-1">Mahsulot nomi ({LANGUAGES.find(l => l.code === activeLang)?.label})</label>
                                    <button className="text-xs flex items-center gap-1 text-purple-600 bg-purple-50 px-2 py-1 rounded-full hover:bg-purple-100 font-medium transition-colors border border-purple-100">
                                        <Sparkles className="w-3 h-3" /> Tarjima qilish
                                    </button>
                                </div>
                                <Input placeholder="Mahsulot nomini kiriting" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="text-sm font-medium text-gray-700 ml-1">Ta'rif ({LANGUAGES.find(l => l.code === activeLang)?.label})</label>
                                    <button className="text-xs flex items-center gap-1 text-purple-600 bg-purple-50 px-2 py-1 rounded-full hover:bg-purple-100 font-medium transition-colors border border-purple-100">
                                        <Wand2 className="w-3 h-3" /> Yaratish
                                    </button>
                                </div>
                                <div className="relative">
                                    <textarea
                                        className="w-full min-h-[120px] p-3 border border-gray-200 rounded-[10px] outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-y text-sm text-gray-700 placeholder-gray-400"
                                        placeholder="Mahsulot haqida batafsil ma'lumot (xususiyatlari, o'lchamlari, ishlatilishi...)"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                    <div className="absolute bottom-2 right-2 text-xs text-gray-400 pointer-events-none">
                                        {description.length} belgi
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Media */}
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-medium text-gray-900 flex items-center gap-2">
                                Mahsulot rasmlari
                                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                            </h3>
                            {uploadedImage && (
                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => setUploadedImage(null)}>
                                    <Trash2 className="w-4 h-4 mr-1" /> O'chirish
                                </Button>
                            )}
                        </div>

                        <div className="space-y-6">
                            {/* URL Input */}
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <Input
                                        placeholder="Rasm havolasini kiriting (https://...)"
                                        value={imageUrlInput}
                                        onChange={(e) => setImageUrlInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleUrlUpload()}
                                        className="pl-10"
                                    />
                                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                </div>
                                <Button
                                    variant="secondary"
                                    onClick={handleUrlUpload}
                                    disabled={isUploading || !imageUrlInput}
                                >
                                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                                    Yuklash
                                </Button>
                            </div>

                            {/* Preview Area */}
                            {uploadedImage ? (
                                <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 group">
                                    <img src={uploadedImage} alt="Product Preview" className="w-full h-64 object-contain" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <p className="text-white font-medium text-sm">Serverga yuklandi ✅</p>
                                    </div>
                                    <button
                                        type="button"
                                        className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full hover:bg-white text-gray-600 hover:text-red-500 transition-colors"
                                        onClick={() => setUploadedImage(null)}
                                        aria-label="Rasmni o'chirish"
                                        title="Rasmni o'chirish"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-gray-300 rounded-[10px] p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer group min-h-[200px]"
                                >
                                    <input
                                        type="file"
                                        aria-label="Rasm yuklash"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleLocalImageUpload}
                                    />
                                    {isUploading ? (
                                        <div className="flex flex-col items-center">
                                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                                            <p className="text-gray-500">Yuklanmoqda...</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                <Plus className="w-6 h-6 text-gray-400 group-hover:text-gray-600" />
                                            </div>
                                            <p className="text-sm font-medium text-gray-900">Tasvirni shu yerga tashlang yoki <span className="text-[#064E3B] underline">yuklang</span></p>
                                            <p className="text-xs text-gray-500 mt-1">1600 x 1200 (4:3) tavsiya etiladi, har biri 10 MB gacha.</p>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Pricing Form */}
                    <Card>
                        <h3 className="font-medium text-gray-900 mb-6">Narx va Qoldiq</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <Input
                                label="Narx (Avtomatik hisoblanadi)"
                                value={price}
                                readOnly
                                className="bg-gray-50 text-gray-500 font-semibold"
                                icon={<span className="text-xs font-bold text-gray-500">UZS</span>}
                            />
                            <Input
                                label="O'lchov Birligi"
                                placeholder="Masalan, dona"
                            />
                        </div>

                        <Input
                            label="Eski narx"
                            placeholder="Eski narxni kiriting"
                            className="mb-6"
                            icon={<span className="text-xs font-bold text-gray-500">UZS</span>}
                        />

                        <div className="border-t border-gray-100 pt-6 mt-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Input
                                    label="Tannarx"
                                    placeholder="0.00"
                                    value={cost}
                                    onChange={(e) => setCost(e.target.value)}
                                    type="number"
                                    icon={<span className="text-xs font-bold text-gray-500">UZS</span>}
                                />
                                <Input
                                    label="Foyda"
                                    placeholder="0.00"
                                    value={profit}
                                    onChange={(e) => setProfit(e.target.value)}
                                    type="number"
                                    icon={<span className="text-xs font-bold text-gray-500">UZS</span>}
                                />
                                <Input
                                    label="Marja (%)"
                                    placeholder="0.00"
                                    value={margin}
                                    readOnly
                                    className="bg-gray-50 text-gray-500 font-semibold"
                                    icon={<span className="text-xs font-bold text-gray-500">%</span>}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-3 flex gap-1 items-center">
                                <Info className="w-3 h-3" />
                                Foyda va Tannarx kiritilganda Narx va Marja avtomatik hisoblanadi.
                            </p>
                        </div>
                    </Card>

                </div>

                {/* Sidebar (Right Column) */}
                <div className="space-y-6 lg:order-first">
                    <Card>
                        <h3 className="font-medium text-gray-900 mb-4">Katalog</h3>

                        {/* Main Category */}
                        <div className="relative mb-4">
                            <label className="text-xs text-gray-500 mb-1 block">Asosiy Kategoriya</label>
                            {!hasMounted ? (
                                <div className="h-[42px] bg-gray-50 border border-gray-200 rounded-[10px] animate-pulse"></div>
                            ) : (
                                <div className="relative">
                                    <select
                                        aria-label="Kategoriyani tanlang"
                                        className="w-full p-2.5 bg-white border border-gray-200 rounded-[10px] text-sm focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] outline-none transition-all appearance-none cursor-pointer"
                                        value={selectedCategory}
                                        onChange={(e) => {
                                            setSelectedCategory(e.target.value);
                                            setSelectedSubCategory(''); // Reset sub-category on change
                                        }}
                                    >
                                        <option value="" disabled>Tanlang...</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name[activeLang as keyof typeof cat.name] || cat.name.ru}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
                                </div>
                            )}
                        </div>

                        {/* Sub Category */}
                        {selectedCategory && categories.find(c => c.id === selectedCategory)?.children && (
                            <div className="relative slide-in-from-top-2 animate-in fade-in duration-300">
                                <label className="text-xs text-gray-500 mb-1 block">Ichki Kategoriya (Model)</label>
                                <div className="relative">
                                    <select
                                        aria-label="Modelni tanlang"
                                        className="w-full p-2.5 bg-white border border-gray-200 rounded-[10px] text-sm focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] outline-none transition-all appearance-none cursor-pointer"
                                        value={selectedSubCategory}
                                        onChange={(e) => setSelectedSubCategory(e.target.value)}
                                    >
                                        <option value="" disabled>Modelni tanlang...</option>
                                        {categories.find(c => c.id === selectedCategory)?.children?.map((sub) => (
                                            <option key={sub.id} value={sub.id}>
                                                {sub.name[activeLang as keyof typeof sub.name] || sub.name.ru}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
                                </div>
                            </div>
                        )}
                    </Card>

                    <Card>
                        <h3 className="font-medium text-gray-900 mb-4">Holat</h3>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Faol</span>
                            <Switch defaultChecked />
                        </div>
                    </Card>

                    <Card>
                        <h3 className="font-medium text-gray-900 mb-4">Qo'shimcha</h3>
                        <div className="space-y-3 mb-4">
                            {specs.map((spec) => (
                                <div key={spec.id} className="flex gap-2 items-start">
                                    <Input
                                        placeholder="Nomi (masalan: Rang)"
                                        value={spec.key}
                                        onChange={(e) => updateSpec(spec.id, 'key', e.target.value)}
                                        className="h-8 text-xs"
                                    />
                                    <Input
                                        placeholder="Qiymati (masalan: Oq)"
                                        value={spec.value}
                                        onChange={(e) => updateSpec(spec.id, 'value', e.target.value)}
                                        className="h-8 text-xs"
                                    />
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-red-500 hover:text-red-700 shrink-0"
                                        onClick={() => removeSpec(spec.id)}
                                    >
                                        <X size={14} />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <Button variant="outline" className="w-full justify-start text-left mb-2 text-sm font-normal">
                            Variant qo'shish
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start text-left text-sm font-normal flex items-center gap-2"
                            onClick={addSpec}
                        >
                            <Plus size={14} /> Xarakteristika qo'shish
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
}
