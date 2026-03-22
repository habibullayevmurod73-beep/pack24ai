'use client';

import { useState } from 'react';
import { useCategoryStore, Category } from '@/lib/store/useCategoryStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Trash2, Edit2, Archive, CheckCircle, Search, Save } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCategoriesPage() {
    const { categories, addCategory, updateCategory, deleteCategory } = useCategoryStore();
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [formData, setFormData] = useState<Partial<Category>>({
        name: { uz: '', ru: '', en: '' },
        icon: 'Box',
        slug: '',
        isActive: true,
    });

    const handleSave = () => {
        if (!formData.name?.uz || !formData.slug) {
            toast.error("Nomi va Slug majburiy!");
            return;
        }

        if (editingId) {
            updateCategory(editingId, formData);
            toast.success("Kategoriya yangilandi!");
        } else {
            addCategory({
                name: formData.name as any,
                icon: formData.icon || 'Box',
                slug: formData.slug!,
                isActive: true,
            });
            toast.success("Yangi kategoriya qo'shildi! 🚀");
        }

        resetForm();
    };

    const handleEdit = (category: Category) => {
        setEditingId(category.id);
        setFormData(category);
        setIsAdding(true);
    };

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Rostdan ham "${name}" kategoriyasini o'chirmoqchimisiz?`)) {
            deleteCategory(id);
            toast.success("Kategoriya o'chirildi.");
        }
    };

    const resetForm = () => {
        setIsAdding(false);
        setEditingId(null);
        setFormData({
            name: { uz: '', ru: '', en: '' },
            icon: 'Box',
            slug: '',
            isActive: true,
        });
    };

    // Auto-generate slug
    const generateSlug = (text: string) => {
        return text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    };

    const filteredCategories = categories.filter(c =>
        c.name.uz.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.name.ru.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-5xl mx-auto p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Каталог товаров</h1>
                    <p className="text-slate-500 text-sm">Sayt katalogini boshqarish</p>
                </div>
                <Button onClick={() => setIsAdding(true)} className="bg-emerald-500 hover:bg-emerald-600">
                    <Plus size={18} className="mr-2" /> Katalogga qo'shish
                </Button>
            </div>

            {/* List View */}
            {!isAdding ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Qidirish..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm"
                            />
                        </div>
                    </div>

                    <div className="divide-y divide-gray-50">
                        {filteredCategories.map((cat) => {
                            const Icon = (LucideIcons as any)[cat.icon] || LucideIcons.Box;
                            return (
                                <div key={cat.id} className="p-4 flex items-center hover:bg-gray-50 transition-colors group">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mr-4">
                                        <Icon size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-800 text-sm">{cat.name.uz} / {cat.name.ru}</h3>
                                        <p className="text-xs text-slate-400 font-mono">/{cat.slug}</p>
                                    </div>
                                    <div className="flex items-center gap-4 mr-8">
                                        <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                                            {cat.productCount} ta mahsulot
                                        </span>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-md ${cat.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                            {cat.isActive ? 'Faol' : 'Nofaol'}
                                        </span>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button size="icon" variant="ghost" onClick={() => handleEdit(cat)}>
                                            <Edit2 size={16} className="text-slate-500" />
                                        </Button>
                                        <Button size="icon" variant="ghost" onClick={() => handleDelete(cat.id, cat.name.uz)}>
                                            <Trash2 size={16} className="text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                        {filteredCategories.length === 0 && (
                            <div className="p-12 text-center text-slate-400">
                                <Archive size={48} className="mx-auto mb-4 opacity-20" />
                                <p>Kategoriyalar topilmadi</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm animate-in slide-in-from-bottom-4">
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                        {editingId ? <Edit2 size={18} /> : <Plus size={18} />}
                        {editingId ? 'Kategoriyani Tahrirlash' : 'Katalogga yangi element qo\'shish'}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Nomi (O'zbek)</label>
                                <Input
                                    value={formData.name?.uz}
                                    onChange={(e) => {
                                        setFormData({ ...formData, name: { ...formData.name!, uz: e.target.value } });
                                        if (!editingId) setFormData(prev => ({ ...prev, slug: generateSlug(e.target.value) }));
                                    }}
                                    placeholder="Masalan: Stretch Plyonka"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Nomi (Rus)</label>
                                <Input
                                    value={formData.name?.ru}
                                    onChange={(e) => setFormData({ ...formData, name: { ...formData.name!, ru: e.target.value } })}
                                    placeholder="Например: Стретч-пленка"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Slug (URL)</label>
                                <Input
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="stretch-film"
                                    className="font-mono text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Icon (Lucide)</label>
                                <div className="flex gap-2">
                                    <Input
                                        value={formData.icon}
                                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                        placeholder="Box, Layers, Zap..."
                                    />
                                    <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center shrink-0">
                                        {(() => {
                                            const PreviewIcon = (LucideIcons as any)[formData.icon || 'Box'] || LucideIcons.HelpCircle;
                                            return <PreviewIcon size={20} />;
                                        })()}
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1">Lucide React ikonkalari nomini kiriting.</p>
                            </div>

                            <div className="pt-4">
                                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="w-5 h-5 text-emerald-500 rounded focus:ring-emerald-500"
                                    />
                                    <div>
                                        <span className="font-bold text-slate-700 block text-sm">Kategoriya Faol</span>
                                        <span className="text-xs text-slate-400">Saytda ko'rinadi</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-3">
                        <Button variant="ghost" onClick={resetForm}>Bekor qilish</Button>
                        <Button onClick={handleSave} className="bg-slate-900 text-white hover:bg-slate-800 px-8">
                            <Save size={16} className="mr-2" /> Saqlash
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
