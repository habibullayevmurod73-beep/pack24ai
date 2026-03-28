'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/store/useCartStore';
import { useCurrencySafe } from '@/lib/contexts/CurrencyContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import {
    CreditCard, Smartphone, Truck, MapPin, User,
    Phone, ChevronRight, Shield, CheckCircle, Loader2,
    Package, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

// ─── To'lov usullari ───────────────────────────────────────────────────────
const PAYMENT_METHODS = [
    {
        id: 'click',
        name: 'Click',
        logo: '🔵',
        color: 'border-blue-200 hover:border-blue-500',
        activeColor: 'border-blue-500 bg-blue-50',
        desc: 'Click ilovasi yoki bank kartasi orqali',
    },
    {
        id: 'payme',
        name: 'Payme',
        logo: '🟢',
        color: 'border-green-200 hover:border-green-500',
        activeColor: 'border-green-500 bg-green-50',
        desc: 'Payme ilovasi yoki bank kartasi orqali',
    },
    {
        id: 'cash',
        name: "Naqd pul",
        logo: '💵',
        color: 'border-gray-200 hover:border-gray-400',
        activeColor: 'border-gray-500 bg-gray-50',
        desc: 'Yetkazib berishda to\'lash',
    },
];

const DELIVERY_METHODS = [
    { id: 'courier', label: "Kuryer yetkazib berish", price: 20000, icon: Truck, time: "1-2 kun" },
    { id: 'pickup',  label: "O'zingiz olib ketish",   price: 0,     icon: MapPin, time: "Bugun" },
];

export default function CheckoutPage() {
    const { items, clearCart } = useCartStore();
    const { format } = useCurrencySafe();
    const { language } = useLanguage();
    const router = useRouter();

    const [payMethod, setPayMethod]     = useState('click');
    const [delivery, setDelivery]       = useState('courier');
    const [name, setName]               = useState('');
    const [phone, setPhone]             = useState('');
    const [address, setAddress]         = useState('');
    const [comment, setComment]         = useState('');
    const [placing, setPlacing]         = useState(false);
    const [step, setStep]               = useState<'form' | 'payment' | 'success'>('form');
    const [payUrl, setPayUrl]           = useState('');
    const [orderId, setOrderId]         = useState<number | null>(null);

    const t = (uz: string, ru: string) => language === 'ru' ? ru : uz;

    const deliveryFee = DELIVERY_METHODS.find(d => d.id === delivery)?.price ?? 0;
    const subtotal    = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
    const total       = subtotal + deliveryFee;

    // Real-time telefon validatsiya
    const phoneRegexRT = /^\+998[0-9]{9}$/;
    const isPhoneValid = phone.trim() === '' || phoneRegexRT.test(phone.replace(/\s/g, ''));
    const isPhoneFull  = phoneRegexRT.test(phone.replace(/\s/g, ''));

    useEffect(() => {
        if (items.length === 0 && step === 'form') {
            router.push('/catalog');
        }
    }, [items, step, router]);

    const handleOrder = async () => {
        if (!name.trim())    { toast.error(t("Ismingizni kiriting", "Введите имя")); return; }
        if (!phone.trim())   { toast.error(t("Telefon raqamini kiriting", "Введите телефон")); return; }
        const phoneRegex = /^\+998[0-9]{9}$/;
        if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
            toast.error(t("Telefon formati: +998901234567", "Формат телефона: +998901234567"));
            return;
        }
        if (delivery === 'courier' && !address.trim()) {
            toast.error(t("Yetkazish manzilini kiriting", "Введите адрес доставки")); return;
        }

        setPlacing(true);
        try {
            // 1) Create order via API
            const orderRes = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName:    name,
                    contactPhone:    phone,
                    shippingAddress: address,
                    comment,
                    deliveryMethod:  delivery,
                    paymentMethod:   payMethod,
                    status:          'new',
                    totalAmount:     total,
                    items: items.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
                }),
            });

            if (!orderRes.ok) throw new Error('Order failed');
            const order = await orderRes.json();
            setOrderId(order.id);

            // 2) If online payment — get URL
            if (payMethod === 'click' || payMethod === 'payme') {
                const payRes = await fetch(`/api/payment/${payMethod}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderId: order.id, amount: total }),
                });
                const payData = await payRes.json();
                if (payData.payUrl) {
                    setPayUrl(payData.payUrl);
                    setStep('payment');
                    clearCart();
                    return;
                }
            }

            // Cash payment — success immediately
            clearCart();
            setStep('success');
        } catch (e) {
            toast.error(t("Xatolik yuz berdi", "Произошла ошибка"));
            console.error(e);
        } finally {
            setPlacing(false);
        }
    };

    // ── SUCCESS ──────────────────────────────────────────────────────────────
    if (step === 'success') {
        return (
            <div className="min-h-screen bg-[#f5f6fa] flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-lg">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                        <CheckCircle size={40} className="text-emerald-500" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
                        {t("Buyurtma qabul qilindi! 🎉", "Заказ принят! 🎉")}
                    </h1>
                    <p className="text-gray-500 text-sm mb-2">
                        {t("Buyurtma raqami", "Номер заказа")}: <span className="font-mono font-bold text-gray-800">#{orderId}</span>
                    </p>
                    <p className="text-gray-400 text-sm mb-8">
                        {t("Tez orada operator siz bilan bog'lanadi", "Скоро оператор с вами свяжется")}
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Link href="/profile" className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-blue-700 transition-colors">
                            {t("Buyurtmalarim", "Мои заказы")}
                        </Link>
                        <Link href="/catalog" className="border border-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                            {t("Katalog", "Каталог")}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ── PAYMENT REDIRECT ──────────────────────────────────────────────────────
    if (step === 'payment' && payUrl) {
        return (
            <div className="min-h-screen bg-[#f5f6fa] flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-lg">
                    <div className="text-4xl mb-4">
                        {payMethod === 'click' ? '🔵' : '🟢'}
                    </div>
                    <h2 className="text-xl font-extrabold text-gray-900 mb-2">
                        {payMethod === 'click' ? 'Click' : 'Payme'} {t("orqali to'lash", "оплата")}
                    </h2>
                    <p className="text-gray-500 text-sm mb-2">{t("Jami", "Итого")}: <strong>{format(total)}</strong></p>
                    <p className="text-gray-400 text-xs mb-6">
                        {t("To'lov sahifasiga o'tish uchun tugmani bosing", "Нажмите кнопку для перехода на страницу оплаты")}
                    </p>
                    <a
                        href={payUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`block w-full py-3.5 rounded-xl font-bold text-white text-sm transition-colors ${payMethod === 'click' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                        {t("To'lov sahifasiga o'tish", "Перейти к оплате")} →
                    </a>
                    <button
                        onClick={() => { setStep('success'); }}
                        className="mt-3 text-xs text-gray-400 hover:text-gray-600"
                    >
                        {t("To'lovni keyinroq amalga oshirish", "Оплатить позже")}
                    </button>
                </div>
            </div>
        );
    }

    // ── FORM ──────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#f5f6fa] py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/cart" className="p-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                        <ArrowLeft size={16} className="text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-extrabold text-gray-900">{t("Buyurtma rasmiylashtirish", "Оформление заказа")}</h1>
                        <p className="text-xs text-gray-400">{items.length} {t("ta mahsulot", "товаров")}</p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* LEFT: Form */}
                    <div className="flex-1 space-y-5">
                        {/* Contact info */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <User size={16} className="text-blue-500" /> {t("Bog'lanish ma'lumotlari", "Контактные данные")}
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="checkout-name" className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">{t("Ism Familiya", "Имя и Фамилия")} *</label>
                                    <div className="relative">
                                        <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            id="checkout-name"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                                            placeholder={t("Ismingizni kiriting", "Введите имя")}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="checkout-phone" className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                                        {t("Telefon", "Телефон")} *
                                        {isPhoneFull && <span className="ml-2 text-emerald-500">✓</span>}
                                    </label>
                                    <div className="relative">
                                        <Phone size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isPhoneValid ? 'text-gray-400' : 'text-red-400'}`} />
                                        <input
                                            id="checkout-phone"
                                            value={phone}
                                            onChange={e => setPhone(e.target.value)}
                                            type="tel"
                                            className={`w-full border rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none transition-colors ${
                                                !isPhoneValid
                                                    ? 'border-red-300 focus:border-red-400 bg-red-50/30'
                                                    : isPhoneFull
                                                    ? 'border-emerald-300 focus:border-emerald-400'
                                                    : 'border-gray-200 focus:border-blue-400'
                                            }`}
                                            placeholder="+998901234567"
                                        />
                                    </div>
                                    {!isPhoneValid && phone.length > 4 && (
                                        <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                                            ⚠ {t("+998XXXXXXXXX formatida kiriting", "Формат: +998XXXXXXXXX")}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Delivery */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Truck size={16} className="text-blue-500" /> {t("Yetkazib berish", "Доставка")}
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-3 mb-4">
                                {DELIVERY_METHODS.map(d => (
                                    <button
                                        key={d.id}
                                        type="button"
                                        onClick={() => setDelivery(d.id)}
                                        className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${delivery === d.id ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-300'}`}
                                    >
                                        <d.icon size={18} className={delivery === d.id ? 'text-blue-600' : 'text-gray-400'} />
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{d.label}</p>
                                            <p className="text-xs text-gray-400">{d.time} · {d.price > 0 ? format(d.price) : t("Bepul", "Бесплатно")}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            {delivery === 'courier' && (
                                <div>
                                    <label htmlFor="checkout-address" className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">{t("Yetkazish manzili", "Адрес доставки")} *</label>
                                    <div className="relative">
                                        <MapPin size={14} className="absolute left-3 top-3 text-gray-400" />
                                        <textarea
                                            id="checkout-address"
                                            value={address}
                                            onChange={e => setAddress(e.target.value)}
                                            rows={2}
                                            className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 resize-none"
                                            placeholder={t("Toshkent sh., Chilonzor t., Bunyodkor ko'ch. 12", "Ташкент, ул. Бунёдкор, 12")}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Payment */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <CreditCard size={16} className="text-blue-500" /> {t("To'lov usuli", "Способ оплаты")}
                            </h2>
                            <div className="grid sm:grid-cols-3 gap-3">
                                {PAYMENT_METHODS.map(pm => (
                                    <button
                                        key={pm.id}
                                        type="button"
                                        onClick={() => setPayMethod(pm.id)}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${payMethod === pm.id ? pm.activeColor : pm.color + ' border-gray-100'}`}
                                    >
                                        <span className="text-2xl">{pm.logo}</span>
                                        <span className="font-bold text-sm text-gray-800">{pm.name}</span>
                                        <span className="text-[10px] text-gray-400 text-center">{pm.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Comment */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">{t("Izoh (ixtiyoriy)", "Комментарий (необязательно)")}</label>
                            <textarea
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                rows={2}
                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 resize-none"
                                placeholder={t("Qo'shimcha ma'lumot...", "Дополнительная информация...")}
                            />
                        </div>
                    </div>

                    {/* RIGHT: Summary */}
                    <div className="lg:w-80 flex-shrink-0">
                        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm sticky top-20">
                            <h2 className="font-bold text-gray-800 mb-4">{t("Buyurtma xulosasi", "Сводка заказа")}</h2>

                            <div className="space-y-3 mb-4">
                                {items.map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shrink-0">
                                            {item.image
                                                ? <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                                : <Package size={14} className="m-auto mt-2 text-gray-300" />
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-gray-800 truncate">{item.name}</p>
                                            <p className="text-[10px] text-gray-400">{item.quantity} × {format(item.price)}</p>
                                        </div>
                                        <p className="text-xs font-bold text-gray-900 shrink-0">{format(item.price * item.quantity)}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>{t("Mahsulotlar", "Товары")}</span>
                                    <span>{format(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>{t("Yetkazib berish", "Доставка")}</span>
                                    <span>{deliveryFee > 0 ? format(deliveryFee) : <span className="text-emerald-600 font-semibold">{t("Bepul", "Бесплатно")}</span>}</span>
                                </div>
                                <div className="flex justify-between font-extrabold text-gray-900 text-base pt-1 border-t border-gray-100">
                                    <span>{t("Jami", "Итого")}</span>
                                    <span>{format(total)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleOrder}
                                disabled={placing}
                                className="mt-5 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl text-sm transition-colors shadow-lg shadow-blue-200"
                            >
                                {placing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                {placing ? t("Joylashtirilmoqda...", "Оформление...") : t("Buyurtma berish", "Оформить заказ")}
                            </button>

                            <div className="flex items-center justify-center gap-2 mt-3 text-[10px] text-gray-400">
                                <Shield size={11} />
                                {t("Xavfsiz to'lov · SSL himoyasi", "Безопасная оплата · SSL защита")}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
