'use client';

import React, { useState } from 'react';
import {
    CheckCircle2,
    Clock,
    AlertCircle,
    Package,
    Truck,
    Factory,
    Filter,
    Search,
    MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

// Mock Data for Tasks
const initialTasks = [
    {
        id: 'TSK-2093',
        title: 'Order #1024 Qadoqlash',
        department: 'warehouse',
        assignee: 'Faxriyor (Omborchi)',
        status: 'in_progress',
        priority: 'high',
        deadline: 'Bugun, 18:00',
        description: '350 dona Gofra Karobka (30x30x30). Plyonka bilan o\'rash kerak.'
    },
    {
        id: 'TSK-2094',
        title: 'Xomashyo Qabul Qilish',
        department: 'warehouse',
        assignee: 'Faxriyor (Omborchi)',
        status: 'pending',
        priority: 'normal',
        deadline: 'Ertaga, 10:00',
        description: 'Xitoydan kelgan 5 tonna granulani tushirish.'
    },
    {
        id: 'TSK-2095',
        title: 'Order #1025 Yetkazib Berish',
        department: 'logistics',
        assignee: 'Azizov B. (Yandex)',
        status: 'pending',
        priority: 'high',
        deadline: 'Bugun, 20:00',
        description: 'Mijoz: Alisher O. Manzil: Chilonzor 19-kvartal.'
    },
    {
        id: 'TSK-2096',
        title: 'X-Pack Ishlab Chiqarish',
        department: 'production',
        assignee: 'X-Pack (Hamkor)',
        status: 'in_progress',
        priority: 'normal',
        deadline: '15.01.2025',
        progress: 60,
        description: 'B2B Buyurtma #5002. 10,000 dona maxsus logotipli karobka.'
    }
];

export default function TasksPage() {
    const [tasks, setTasks] = useState(initialTasks);
    const [filter, setFilter] = useState('all');

    const filteredTasks = tasks.filter(task => filter === 'all' || task.department === filter);

    const getDepartmentIcon = (dept: string) => {
        switch (dept) {
            case 'warehouse': return <Package size={16} className="text-indigo-600" />;
            case 'logistics': return <Truck size={16} className="text-orange-600" />;
            case 'production': return <Factory size={16} className="text-amber-600" />;
            default: return <CheckCircle2 size={16} />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <Badge variant="secondary">Kutilmoqda</Badge>;
            case 'in_progress': return <Badge variant="warning">Jarayonda</Badge>;
            case 'completed': return <Badge variant="success">Bajarildi</Badge>;
            default: return <Badge>Noma'lum</Badge>;
        }
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto min-h-screen bg-slate-50/50">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Vazifalar Markazi (ERP)</h1>
                    <p className="text-slate-500 text-sm mt-1">Ombor, Logistika va Ishlab chiqarish jarayonlari nazorati</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="bg-white">
                        <Filter className="w-4 h-4 mr-2" /> Filtrlash
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200">
                        + Yangi Vazifa
                    </Button>
                </div>
            </div>

            {/* Department Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-2">
                {[
                    { id: 'all', label: 'Barcha Bo\'limlar' },
                    { id: 'warehouse', label: 'Omborxona', icon: Package },
                    { id: 'logistics', label: 'Logistika', icon: Truck },
                    { id: 'production', label: 'Ishlab Chiqarish', icon: Factory },
                ].map((dept) => (
                    <button
                        key={dept.id}
                        onClick={() => setFilter(dept.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${filter === dept.id
                            ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-200'
                            : 'text-slate-500 hover:bg-white/60 hover:text-slate-700'
                            }`}
                    >
                        {dept.icon && <dept.icon size={16} className={filter === dept.id ? 'text-indigo-600' : ''} />}
                        {dept.label}
                    </button>
                ))}
            </div>

            {/* Kanban / Task Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

                {/* To Do Column */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2">
                            <Clock size={18} className="text-slate-400" />
                            Kutilmoqda
                            <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full">{filteredTasks.filter(t => t.status === 'pending').length}</span>
                        </h3>
                    </div>
                    {filteredTasks.filter(t => t.status === 'pending').map((task) => (
                        <TaskCard key={task.id} task={task} getDepartmentIcon={getDepartmentIcon} />
                    ))}
                </div>

                {/* In Progress Column */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
                            Jarayonda
                            <span className="bg-indigo-100 text-indigo-600 text-xs px-2 py-0.5 rounded-full">{filteredTasks.filter(t => t.status === 'in_progress').length}</span>
                        </h3>
                    </div>
                    {filteredTasks.filter(t => t.status === 'in_progress').map((task) => (
                        <TaskCard key={task.id} task={task} getDepartmentIcon={getDepartmentIcon} />
                    ))}
                </div>

                {/* Completed (Just a summary or last few) */}
                <div className="flex flex-col gap-4 opacity-80 hover:opacity-100 transition-opacity">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2">
                            <CheckCircle2 size={18} className="text-emerald-500" />
                            Bajarildi
                        </h3>
                    </div>
                    {/* Mock completed task */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3 opacity-60">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                                <span className="bg-emerald-50 p-1.5 rounded-lg text-emerald-600">
                                    <Package size={14} />
                                </span>
                                <span className="text-xs font-bold text-gray-500">WAREHOUSE</span>
                            </div>
                        </div>
                        <h4 className="font-bold text-slate-800 line-through decoration-slate-400">Ertalabki Inventarizatsiya</h4>
                    </div>
                </div>

            </div>
        </div>
    );
}

function TaskCard({ task, getDepartmentIcon }: { task: any, getDepartmentIcon: any }) {
    return (
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden">
            {task.priority === 'high' && <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-red-500/10 to-transparent -mr-8 -mt-8 rounded-full blur-xl pointer-events-none"></div>}

            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <span className={`p-1.5 rounded-lg ${task.department === 'warehouse' ? 'bg-indigo-50 text-indigo-600' :
                        task.department === 'logistics' ? 'bg-orange-50 text-orange-600' :
                            'bg-amber-50 text-amber-600'
                        }`}>
                        {getDepartmentIcon(task.department)}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{task.id}</span>
                </div>
                {task.priority === 'high' && (
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                )}
            </div>

            <h4 className="font-bold text-slate-800 mb-2 leading-snug">{task.title}</h4>
            <p className="text-xs text-slate-500 mb-4 line-clamp-2">{task.description}</p>

            {task.progress && (
                <div className="mb-4">
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                        <span>Jarayon</span>
                        <span className="font-bold">{task.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full transition-all duration-500 w-[var(--progress)]" style={{ '--progress': `${task.progress}%` } as React.CSSProperties}></div>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 border border-white shadow-sm">
                        {task.assignee.charAt(0)}
                    </div>
                    <span className="text-xs text-slate-500 truncate max-w-[80px]">{task.assignee.split(' ')[0]}</span>
                </div>
                <div className={`text-[10px] px-2 py-1 rounded-md font-medium ${task.deadline.includes('Bugun') ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                    {task.deadline}
                </div>
            </div>
        </div>
    );
}
