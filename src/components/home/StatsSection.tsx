'use client';

import { useAnimatedCounter } from '@/lib/hooks/useAnimatedCounter';
import { useLanguage } from '@/lib/contexts/LanguageContext';

const STATS = [
    { target: 5000,  suffix: '+',  label: { uz: 'Faol mijoz',             ru: 'Активных клиентов' } },
    { target: 40,    suffix: '+',  label: { uz: 'Mahsulot kategoriyasi',   ru: 'Категорий товаров' } },
    { target: 1500,  suffix: '+',  label: { uz: 'Mahsulot turi',           ru: 'Видов продуктов' } },
    { target: 98,    suffix: '%',  label: { uz: 'Mijoz qoniqishi',         ru: 'Удовлетворённость' } },
];

function StatCard({ target, suffix, label }: { target: number; suffix: string; label: string }) {
    const { value, ref } = useAnimatedCounter(target);
    return (
        <div ref={ref}>
            <p className="text-4xl lg:text-5xl font-black text-white mb-2">
                {value.toLocaleString()}{suffix}
            </p>
            <p className="text-emerald-200 text-sm font-medium">{label}</p>
        </div>
    );
}

export default function StatsSection() {
    const { language } = useLanguage();
    const isRu = language === 'ru';

    return (
        <section className="bg-gradient-to-r from-[#0c2340] to-[#1a4a7c] py-14">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <h2 className="text-2xl lg:text-3xl font-extrabold text-white mb-2">
                        {isRu ? 'Pack24 в цифрах' : 'Pack24 raqamlarda'}
                    </h2>
                    <p className="text-blue-200/70 text-sm">
                        {isRu ? 'Наши достижения — ваше доверие' : "Bizning yutuqlarimiz sizning ishonchingiz"}
                    </p>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                    {STATS.map((s) => (
                        <StatCard
                            key={s.target}
                            target={s.target}
                            suffix={s.suffix}
                            label={isRu ? s.label.ru : s.label.uz}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
