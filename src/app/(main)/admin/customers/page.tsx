'use client';

import { useState } from 'react';
import { Search, Filter, Mail, Phone, MoreHorizontal, MessageSquare, Star, User, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import CustomerDrawer from './_components/CustomerDrawer';

// --- Mock Data ---

const customersData = [
    {
        id: 1,
        name: 'Aziz Rakhimov',
        phone: '+998 90 123 45 67',
        avatar: 'A',
        totalSpent: '12,450,000',
        lastOrder: '2 kun oldin',
        rating: 5,
        products: ['kombinatsiya', 'plyonka', 'karobka'],
    },
    {
        id: 2,
        name: 'Malika Karimova',
        phone: '+998 93 987 65 43',
        avatar: 'M',
        totalSpent: '4,200,000',
        lastOrder: '5 kun oldin',
        rating: 4,
        products: ['plyonka'],
    },
    {
        id: 3,
        name: 'Bekzod Aliyev',
        phone: '+998 99 555 44 33',
        avatar: 'B',
        totalSpent: '850,000',
        lastOrder: '1 oy oldin',
        rating: 3,
        products: ['paddon'],
    },
    {
        id: 4,
        name: 'Sofia Kim',
        phone: '+998 90 777 88 99',
        avatar: 'S',
        totalSpent: '25,000,000',
        lastOrder: 'Kecha',
        rating: 5,
        products: ['kombinatsiya', 'plyonka', 'karobka', 'paddon'],
    },
    {
        id: 5,
        name: 'Jahongir Ortikov',
        phone: '+998 97 111 22 33',
        avatar: 'J',
        totalSpent: '1,500,000',
        lastOrder: '3 kun oldin',
        rating: 4,
        products: ['karobka'],
    },
];

export default function CustomersPage() {
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'plyonka' | 'paddon' | 'karobka' | 'vip'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

    // Smart Filtering Logic
    const filteredCustomers = customersData.filter((customer) => {
        const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.phone.includes(searchQuery);

        let matchesFilter = true;
        if (selectedFilter === 'plyonka') matchesFilter = customer.products.includes('plyonka');
        if (selectedFilter === 'paddon') matchesFilter = customer.products.includes('paddon');
        if (selectedFilter === 'karobka') matchesFilter = customer.products.includes('karobka');
        if (selectedFilter === 'vip') matchesFilter = customer.products.includes('kombinatsiya'); // Combo/VIP logic

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6">
            {/* Header & Smart Segments */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Mijozlar Bazasi (CRM)</h1>
                    <p className="text-slate-500 text-sm mt-1">Jami {customersData.length} ta aktiv mijoz</p>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                    <button
                        onClick={() => setSelectedFilter('all')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedFilter === 'all' ? 'bg-slate-800 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-gray-50 border border-gray-200'}`}
                    >
                        Barchasi
                    </button>
                    <button
                        onClick={() => setSelectedFilter('plyonka')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedFilter === 'plyonka' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-white text-slate-600 hover:bg-gray-50 border border-gray-200'}`}
                    >
                        Plyonka
                    </button>
                    <button
                        onClick={() => setSelectedFilter('paddon')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedFilter === 'paddon' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-white text-slate-600 hover:bg-gray-50 border border-gray-200'}`}
                    >
                        Paddon
                    </button>
                    <button
                        onClick={() => setSelectedFilter('karobka')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedFilter === 'karobka' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-white text-slate-600 hover:bg-gray-50 border border-gray-200'}`}
                    >
                        Karobka
                    </button>
                    <button
                        onClick={() => setSelectedFilter('vip')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedFilter === 'vip' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-600 ring-offset-2' : 'bg-white text-slate-600 hover:bg-gray-50 border border-gray-200'}`}
                    >
                        💎 VIP / Combo
                    </button>
                </div>
            </div>

            {/* Smart Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Ism yoki telefon orqali qidirish..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" className="flex-1 md:flex-none">
                        <Filter className="w-4 h-4 mr-2" />
                        Filtrlar
                    </Button>
                    <Button className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Mail className="w-4 h-4 mr-2" />
                        Ommaviy Rassilka
                    </Button>
                </div>
            </div>

            {/* Advanced List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Mijoz</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Aloqa</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Xaridlar</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Mahsulotlar</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Reyting</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Amallar</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredCustomers.map((customer) => (
                            <tr
                                key={customer.id}
                                onClick={() => setSelectedCustomer(customer)}
                                className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border-2 border-white shadow-sm group-hover:border-blue-200 transition-colors">
                                            {customer.avatar}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{customer.name}</p>
                                            <p className="text-xs text-slate-400">ID: #{1000 + customer.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                                            <Phone size={14} className="text-emerald-500" />
                                            {customer.phone}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-blue-500 hover:underline">
                                            <MessageSquare size={12} />
                                            Telegram
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-black text-slate-800">{customer.totalSpent}</span>
                                        <span className="text-[10px] text-slate-400">Oxirgi: {customer.lastOrder}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1">
                                        {customer.products.map((prod, i) => {
                                            if (prod === 'kombinatsiya') return null; // Logic is handled by VIP calculation usually, but showing other items
                                            return (
                                                <Badge
                                                    key={i}
                                                    variant="secondary"
                                                    className={`text-[10px] px-1.5 py-0.5 ${prod === 'plyonka' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                        prod === 'paddon' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                            'bg-orange-50 text-orange-600 border-orange-100'
                                                        }`}
                                                >
                                                    {prod}
                                                </Badge>
                                            );
                                        })}
                                        {customer.products.includes('kombinatsiya') && (
                                            <Badge className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 border-emerald-200">
                                                VIP
                                            </Badge>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-0.5">
                                        <Star size={14} className="fill-amber-400 text-amber-400" />
                                        <span className="font-bold text-slate-700 ml-1">{customer.rating}.0</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors" aria-label="Amallar">
                                        <MoreHorizontal size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Customer Drawer */}
            <CustomerDrawer
                isOpen={!!selectedCustomer}
                onClose={() => setSelectedCustomer(null)}
                customer={selectedCustomer}
            />
        </div>
    );
}
