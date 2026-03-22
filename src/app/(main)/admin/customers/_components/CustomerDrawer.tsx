'use client';

import { X, Phone, Mail, MapPin, Calendar, CreditCard, ShoppingBag, Play, Pause, AlertCircle, Plus, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface CustomerDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    customer: any;
}

export default function CustomerDrawer({ isOpen, onClose, customer }: CustomerDrawerProps) {
    if (!isOpen || !customer) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity"
                onClick={onClose}
            ></div>

            {/* Drawer */}
            <div className="fixed inset-y-0 right-0 w-full sm:w-[500px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-100 flex flex-col">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-sm">
                            {customer.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">{customer.name}</h2>
                            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                <Phone size={14} /> {customer.phone}
                            </div>
                            <div className="flex items-center gap-1 mt-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        size={14}
                                        className={star <= customer.rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}
                                    />
                                ))}
                                <span className="text-xs font-bold text-slate-700 ml-1">({customer.rating}.0)</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-slate-600 border border-transparent hover:border-gray-200 hover:shadow-sm" aria-label="Yopish">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* CRM Smart Insights */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                            <p className="text-xs font-semibold text-emerald-800 uppercase mb-1">Jami Xarid</p>
                            <h3 className="text-xl font-black text-emerald-600">{customer.totalSpent}</h3>
                        </div>
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                            <p className="text-xs font-semibold text-blue-800 uppercase mb-1">Keyingi Xarid</p>
                            <div className="flex items-center gap-2">
                                <Calendar size={18} className="text-blue-500" />
                                <h3 className="text-lg font-bold text-blue-600">3 kundan so'ng</h3>
                            </div>
                        </div>
                    </div>

                    {/* Order History */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                            <ShoppingBag size={16} /> Buyurtmalar Tarixi
                        </h3>
                        <div className="space-y-4 relative before:absolute before:left-[19px] before:top-2 before:bottom-0 before:w-0.5 before:bg-gray-100">
                            {[1, 2, 3].map((_, i) => (
                                <div key={i} className="relative pl-10">
                                    <div className="absolute left-0 top-1 w-10 h-10 flex items-center justify-center">
                                        <div className="w-3 h-3 bg-white border-2 border-emerald-500 rounded-full z-10"></div>
                                    </div>
                                    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:border-emerald-200 transition-colors cursor-pointer">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-slate-800">#ORD-202{4 - i}</span>
                                            <Badge variant={i === 0 ? "success" : "secondary"}>{i === 0 ? "Yetkazildi" : "Tugallangan"}</Badge>
                                        </div>
                                        <p className="text-sm text-slate-600 mb-2">350 dona Gofra Karobka, 20 dona Skotch</p>
                                        <div className="flex justify-between items-center text-xs text-slate-400 border-t border-gray-50 pt-2">
                                            <span>12 Oktyabr, 2024</span>
                                            <span className="font-bold text-slate-700">1,250,000 so'm</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Call Logs & Audio */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                            <Phone size={16} /> Qo'ng'iroqlar Logi
                        </h3>
                        <div className="space-y-3">
                            <div className="bg-slate-50 rounded-xl p-3 border border-gray-100">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                            <Play size={10} fill="currentColor" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-700">Kiruvchi qo'ng'iroq</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400">Kecha, 14:30</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2 overflow-hidden">
                                    <div className="bg-emerald-500 w-1/3 h-full rounded-full"></div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex gap-1">
                                        <span className="text-[9px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-100">Narx shikoyati</span>
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-500">02:14</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Admin Notes */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                            <AlertCircle size={16} /> Eslatmalar
                        </h3>
                        <textarea
                            className="w-full h-24 bg-yellow-50/50 border border-yellow-200 rounded-xl p-3 text-sm text-slate-700 focus:ring-2 focus:ring-yellow-400/20 outline-none resize-none placeholder:text-yellow-700/30"
                            placeholder="Mijoz haqida muhim eslatma..."
                            defaultValue="Mijoz har oyning 5-sanasida to'lov qiladi. Skotch bo'yicha chegirma so'ragan."
                        ></textarea>
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-100 bg-white grid grid-cols-2 gap-3">
                    <Button variant="outline" className="w-full">
                        <Mail className="w-4 h-4 mr-2" />
                        SMS Yozish
                    </Button>
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Yang Buyurtma
                    </Button>
                </div>
            </div>
        </>
    );
}
