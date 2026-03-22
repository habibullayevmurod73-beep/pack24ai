import { PackageSearch, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sahifa topilmadi',
  description: 'Siz izlagan sahifa mavjud emas.',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Big 404 */}
        <div className="relative mb-8">
          <p className="text-[120px] font-black text-gray-100 leading-none select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center shadow-sm">
              <PackageSearch className="w-10 h-10 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Text */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Sahifa topilmadi
        </h1>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
          Siz izlagan sahifa o'chirilgan, ko'chirilgan yoki hech qachon mavjud bo'lmagan.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
          >
            <Home size={16} />
            Bosh sahifaga qaytish
          </Link>
          <Link
            href="/catalog"
            className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-2.5 rounded-xl transition-colors"
          >
            <ArrowLeft size={16} />
            Katalogga o'tish
          </Link>
        </div>

        {/* Suggested links */}
        <div className="mt-10 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider font-semibold">
            Foydali havolalar
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { label: 'Mahsulotlar', href: '/catalog' },
              { label: 'Konfigurator', href: '/configurator' },
              { label: 'Yetkazib berish', href: '/delivery' },
              { label: 'Kontaktlar', href: '/contacts' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
