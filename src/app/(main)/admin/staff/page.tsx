'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import {
    Search,
    Plus,
    Pencil,
    Trash2,
    Check,
    X,
    Eye,
    EyeOff,
    User,
    Shield,
    Store,
    Send
} from 'lucide-react';

interface Staff {
    id: number;
    name: string;
    phone: string;
    role: 'Admin' | 'Sotuvchi' | 'Kuryer';
    branch: string;
    status: 'active' | 'inactive';
}

const INITIAL_STAFF: Staff[] = [
    {
        id: 1,
        name: 'Abror X.',
        phone: '+998 90 123 45 67',
        role: 'Admin',
        branch: 'Markaziy ofis',
        status: 'active'
    },
    {
        id: 2,
        name: 'Sardor A.',
        phone: '+998 93 987 65 43',
        role: 'Sotuvchi',
        branch: 'Chilonzor Filiali',
        status: 'active'
    }
];

export default function StaffPage() {
    const [staff, setStaff] = useState<Staff[]>(INITIAL_STAFF);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="p-6 bg-[#F9FAFB] min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-900">Xodimlar</h1>
                    <Badge variant="success" className="bg-emerald-100 text-emerald-700 border-none px-2 py-0.5 rounded-lg text-sm font-medium">
                        {staff.length} Xodim
                    </Badge>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-72">
                        <Input
                            placeholder="Ism yoki telefon orqali qidirish"
                            icon={<Search className="w-4 h-4 text-gray-400" />}
                            className="bg-white border-gray-200 pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => setIsModalOpen(true)} className="bg-[#064E3B] hover:bg-[#053d2e] shrink-0">
                        <Plus className="w-4 h-4 mr-2" />
                        Xodim qo'shish
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[12px] border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                            <th className="py-4 px-6 font-medium">F.I.O</th>
                            <th className="py-4 px-4 font-medium">Telefon</th>
                            <th className="py-4 px-4 font-medium">Rol</th>
                            <th className="py-4 px-4 font-medium">Filial</th>
                            <th className="py-4 px-4 font-medium">Holat</th>
                            <th className="py-4 px-6 font-medium text-right">Harakatlar</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {staff
                            .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.phone.includes(searchTerm))
                            .map((employee) => (
                                <tr key={employee.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">
                                                {employee.name.charAt(0)}
                                            </div>
                                            <span className="font-semibold text-gray-900">{employee.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-gray-600 text-sm font-mono">{employee.phone}</td>
                                    <td className="py-4 px-4">
                                        <Badge className="bg-blue-50 text-blue-700 border-none px-2 py-0.5">{employee.role}</Badge>
                                    </td>
                                    <td className="py-4 px-4 text-sm text-gray-600">{employee.branch}</td>
                                    <td className="py-4 px-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${employee.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                            }`}>
                                            {employee.status === 'active' ? 'Faol' : 'Nofaol'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors" aria-label="Tahrirlash">
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors" aria-label="O'chirish">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[16px] shadow-2xl w-full max-w-lg p-6 animate-in zoom-in-95 duration-200 relative">
                        <button onClick={() => setIsModalOpen(false)} aria-label="Yopish" className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-xl font-bold text-gray-900 mb-6">Yangi xodim qo'shish</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">F.I.O</label>
                                <Input placeholder="Xodim ism sharifi" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefon</label>
                                    <Input placeholder="+998" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Rol</label>
                                    <select className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#064E3B]/20" aria-label="Rolni tanlash">
                                        <option>Sotuvchi</option>
                                        <option>Admin</option>
                                        <option>Kuryer</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Filial</label>
                                <select className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#064E3B]/20" aria-label="Filialni tanlash">
                                    <option>Markaziy ofis</option>
                                    <option>Chilonzor Filiali</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Parol</label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Tizimga kirish uchun parol"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <p className="text-xs text-blue-600 cursor-pointer hover:underline">Parolni avtomatik yaratish</p>
                                    <button type="button" className="text-xs text-emerald-600 font-medium hover:underline flex items-center gap-1">
                                        <Send className="w-3 h-3" /> Telegram orqali yuborish
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 border-transparent text-gray-700">Bekor qilish</Button>
                                <Button className="flex-1 bg-[#064E3B] hover:bg-[#053d2e]">
                                    <Check className="w-4 h-4 mr-2" />
                                    Saqlash
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
