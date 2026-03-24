'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import {
    ArrowLeft, Upload, Info, Plus, X, Loader2,
    Image as ImageIcon, Trash2, Save
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter, useParams } from 'next/navigation';
import { useCategoryStore } from '@/lib/store/useCategoryStore';
import { useHasMounted } from '@/lib/hooks/useHasMounted';
import { ChevronDown } from 'lucide-react';

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const categories = useCategoryStore((state) => state.categories);
    const hasMounted = useHasMounted();

    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [originalPrice, setOriginalPrice] = useState('');
    const [sku, setSku] = useState('');
    const [status, setStatus] = useState<'active' | 'draft' | 'archived'>('active');
    const [inStock, setInStock] = useState(true);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [imageUrlInput, setImageUrlInput] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSubCategory, setSelectedSubCategory] = useState('');
    const [specs, setSpecs] = useState<{ id: string; key: string; value: string }[]>([]);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Ma'lumotlarni yuklash
    useEffect(() => {
        if (!id) return;
        setIsLoading(true);
        fetch(`/api/products/${id}`)
            .then(r => r.json())
            .then(product => {
                if (product.error) { toast.error('Mahsulot topilmadi'); router.push('/admin/products'); return; }
                setName(product.name || '');
                setDescription(product.description || '');
                setPrice(String(product.price || ''));
                setOriginalPrice(String(product.originalPrice || ''));
                setSku(product.sku || '');
                setStatus(product.status || 'active');
                setInStock(product.inStock !== false);
                setUploadedImage(product.image || null);

                // Kategoriyani topish
                if (product.category) {
                    const matchedCat = categories.find(c =>
                        c.name.uz === product.category ||
                        c.name.ru === product.category ||
                        c.slug === product.category?.toLowerCase().replace(/\s+/g, '-')
                    );
                    if (matchedCat) {
                        setSelectedCategory(matchedCat.id);
                    }
                }

                // Specifications
                if (product.specifications && typeof product.specifications === 'object') {
                    const entries = Object.entries(product.specifications as Record<string, string>);
                    setSpecs(entries.map(([key, value]) => ({
                        id: Math.random().toString(),
                        key,
                        value,
                    })));
                }
            })
            .catch(() => toast.error('Yuklashda xatolik'))
            .finally(() => setIsLoading(false));
    }, [id, categories]);

    const addSpec = () => setSpecs([...specs, { id: Date.now().toString(), key: '', value: '' }]);
    const updateSpec = (sid: string, field: 'key' | 'value', value: string) =>
        setSpecs(specs.map(s => s.id === sid ? { ...s, [field]: value } : s));
    const removeSpec = (sid: string) => setSpecs(specs.filter(s => s.id !== sid));

    const handleSave = async () => {
        if (!name.trim()) { toast.error('Mahsulot nomini kiriting!'); return; }
        const priceNum = parseFloat(price);
        if (isNaN(priceNum) || priceNum < 0) { toast.error("Narxni to'g'ri kiriting!"); return; }

        // Category name
        const selCatObj = categories.find(c => c.id === selectedCategory);
        let categoryName = selCatObj ? (selCatObj.name.uz || selCatObj.name.ru || '') : '';
        if (selectedSubCategory && selCatObj?.children) {
            const sub = selCatObj.children.find(s => s.id === selectedSubCategory);
            if (sub) categoryName = sub.name.uz || sub.name.ru || categoryName;
        }

        const payload = {
            name: name.trim(),
            description,
            price: priceNum,
            originalPrice: parseFloat(originalPrice) > 0 ? parseFloat(originalPrice) : null,
            sku,
            category: categoryName || undefined,
            image: uploadedImage || '/placeholder.png',
            status,
            inStock,
            specifications: specs.reduce((acc, curr) => {
                if (curr.key.trim()) acc[curr.key.trim()] = curr.value.trim();
                return acc;
            }, {} as Record<string, string>),
        };

        setIsSaving(true);
        try {
            const res = await fetch(`/api/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.error || 'Server xatosi');
            }
            toast.success('Mahsulot yangilandi ✅');
            router.push('/admin/products');
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : 'Xatolik yuz berdi');
        } finally {
            setIsSaving(false);
        }
    };

    const handleUrlUpload = async () => {
        if (!imageUrlInput) return;
        setIsUploading(true);
        try {
            const res = await fetch('/api/upload/url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: imageUrlInput }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setUploadedImage(data.url);
                toast.success('Rasm yuklandi!');
                setImageUrlInput('');
            } else {
                toast.error(data.error || 'Yuklashda xatolik');
            }
        } catch { toast.error('Server bilan ulanishda xatolik'); }
        finally { setIsUploading(false); }
    };

    const handleLocalUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { toast.error('Faqat rasm yuklang!'); return; }
        if (file.size > 10 * 1024 * 1024) { toast.error('10 MB dan oshmasligi kerak!'); return; }
        setIsUploading(true);
        const fd = new FormData();
        fd.append('file', file);
        try {
            const res = await fetch('/api/upload/file', { method: 'POST', body: fd });
            const data = await res.json();
            if (res.ok && data.success) { setUploadedImage(data.url); toast.success('Rasm yuklandi!'); }
            else toast.error(data.error || 'Yuklashda xatolik');
        } catch { toast.error('Tarmoq xatosi'); }
        finally { setIsUploading(false); }
    };

    if (isLoading) {
        return (
            <div className="p-6 min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-gray-500">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <p className="text-sm">Yuklanmoqda...</p>
                </div>
            </div>
        );
    }

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
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Mahsulotni tahrirlash</h1>
                        <p className="text-xs text-gray-400">ID: {id}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/products">
                        <Button variant="secondary" className="bg-white">Bekor qilish</Button>
                    </Link>
                    <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Saqlash
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <Card>
                        <h3 className="font-medium text-gray-900 mb-4">Asosiy ma&apos;lumotlar</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Mahsulot nomi</label>
                                <Input
                                    placeholder="Mahsulot nomini kiriting"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Ta&apos;rif</label>
                                <textarea
                                    className="w-full min-h-[120px] p-3 border border-gray-200 rounded-[10px] outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y text-sm text-gray-700 placeholder-gray-400"
                                    placeholder="Mahsulot haqida batafsil ma'lumot..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                            <Input
                                label="SKU (Artikul)"
                                placeholder="Masalan: PKG-001"
                                value={sku}
                                onChange={(e) => setSku(e.target.value)}
                            />
                        </div>
                    </Card>

                    {/* Image */}
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-medium text-gray-900">Mahsulot rasmi</h3>
                            {uploadedImage && (
                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => setUploadedImage(null)}>
                                    <Trash2 className="w-4 h-4 mr-1" /> O&apos;chirish
                                </Button>
                            )}
                        </div>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <Input
                                        placeholder="Rasm havolasi (https://...)"
                                        value={imageUrlInput}
                                        onChange={(e) => setImageUrlInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleUrlUpload()}
                                        className="pl-10"
                                    />
                                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                </div>
                                <Button variant="secondary" onClick={handleUrlUpload} disabled={isUploading || !imageUrlInput}>
                                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                                    Yuklash
                                </Button>
                            </div>

                            {uploadedImage ? (
                                <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 group">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={uploadedImage} alt="Product" className="w-full h-64 object-contain" />
                                    <button
                                        type="button"
                                        className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full hover:bg-white text-gray-600 hover:text-red-500 transition-colors"
                                        onClick={() => setUploadedImage(null)}
                                        aria-label="Rasmni o'chirish"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-gray-300 rounded-[10px] p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer min-h-[160px]"
                                >
                                    <input
                                        type="file"
                                        aria-label="Rasm yuklash"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleLocalUpload}
                                    />
                                    {isUploading ? (
                                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                                <Plus className="w-6 h-6 text-gray-400" />
                                            </div>
                                            <p className="text-sm font-medium text-gray-700">Rasm tanlang yoki URL kiriting</p>
                                            <p className="text-xs text-gray-400 mt-1">10 MB gacha</p>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Pricing */}
                    <Card>
                        <h3 className="font-medium text-gray-900 mb-4">Narx</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Joriy narx (UZS)"
                                placeholder="0"
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                icon={<span className="text-xs font-bold text-gray-500">UZS</span>}
                            />
                            <Input
                                label="Eski narx (ixtiyoriy)"
                                placeholder="0"
                                type="number"
                                value={originalPrice}
                                onChange={(e) => setOriginalPrice(e.target.value)}
                                icon={<span className="text-xs font-bold text-gray-500">UZS</span>}
                            />
                        </div>
                        {parseFloat(originalPrice) > 0 && parseFloat(price) > 0 && (
                            <div className="mt-3 text-sm text-emerald-600 font-medium flex items-center gap-1.5">
                                <Info className="w-4 h-4" />
                                Chegirma: {Math.round((1 - parseFloat(price) / parseFloat(originalPrice)) * 100)}%
                            </div>
                        )}
                    </Card>
                </div>

                {/* Right sidebar */}
                <div className="space-y-6">
                    {/* Category */}
                    <Card>
                        <h3 className="font-medium text-gray-900 mb-4">Katalog</h3>
                        <div className="relative mb-4">
                            <label className="text-xs text-gray-500 mb-1 block">Asosiy Kategoriya</label>
                            {!hasMounted ? (
                                <div className="h-[42px] bg-gray-50 border border-gray-200 rounded-[10px] animate-pulse" />
                            ) : (
                                <div className="relative">
                                    <select
                                        aria-label="Kategoriyani tanlang"
                                        className="w-full p-2.5 bg-white border border-gray-200 rounded-[10px] text-sm focus:ring-2 focus:ring-blue-500/20 outline-none appearance-none cursor-pointer"
                                        value={selectedCategory}
                                        onChange={(e) => { setSelectedCategory(e.target.value); setSelectedSubCategory(''); }}
                                    >
                                        <option value="">Tanlang...</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name.uz || cat.name.ru}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
                                </div>
                            )}
                        </div>

                        {selectedCategory && categories.find(c => c.id === selectedCategory)?.children && (
                            <div className="relative">
                                <label className="text-xs text-gray-500 mb-1 block">Ichki Kategoriya</label>
                                <div className="relative">
                                    <select
                                        aria-label="Modelni tanlang"
                                        className="w-full p-2.5 bg-white border border-gray-200 rounded-[10px] text-sm focus:ring-2 focus:ring-blue-500/20 outline-none appearance-none cursor-pointer"
                                        value={selectedSubCategory}
                                        onChange={(e) => setSelectedSubCategory(e.target.value)}
                                    >
                                        <option value="">Modelni tanlang...</option>
                                        {categories.find(c => c.id === selectedCategory)?.children?.map((sub) => (
                                            <option key={sub.id} value={sub.id}>
                                                {sub.name.uz || sub.name.ru}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Status */}
                    <Card>
                        <h3 className="font-medium text-gray-900 mb-4">Holat</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">Faol (active)</span>
                                <Switch
                                    checked={status === 'active'}
                                    onCheckedChange={(checked) => setStatus(checked ? 'active' : 'draft')}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">Omborda bor</span>
                                <Switch
                                    checked={inStock}
                                    onCheckedChange={setInStock}
                                />
                            </div>
                        </div>
                        <div className="mt-3">
                            <span className={`inline-block text-xs font-bold px-2 py-1 rounded-full ${status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                {status === 'active' ? '✅ Faol' : '⚠️ Qoralama'}
                            </span>
                        </div>
                    </Card>

                    {/* Specifications */}
                    <Card>
                        <h3 className="font-medium text-gray-900 mb-4">Xarakteristikalar</h3>
                        <div className="space-y-2 mb-3">
                            {specs.map((spec) => (
                                <div key={spec.id} className="flex gap-2 items-start">
                                    <Input
                                        placeholder="Nomi (Rang)"
                                        value={spec.key}
                                        onChange={(e) => updateSpec(spec.id, 'key', e.target.value)}
                                        className="h-8 text-xs"
                                    />
                                    <Input
                                        placeholder="Qiymati (Oq)"
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
                        <Button
                            variant="outline"
                            className="w-full text-sm font-normal flex items-center gap-2"
                            onClick={addSpec}
                        >
                            <Plus size={14} /> Xarakteristika qo&apos;shish
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
}
