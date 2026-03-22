'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Pack24 Error]:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
        </div>

        {/* Text */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Xatolik yuz berdi
        </h1>
        <p className="text-gray-500 mb-2 text-sm">
          Sahifani yuklashda muammo bo'ldi. Qayta urinib ko'ring.
        </p>
        {error?.digest && (
          <p className="text-xs text-gray-400 mb-6 font-mono bg-gray-50 rounded-lg px-3 py-2 inline-block">
            Xato kodi: {error.digest}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
          >
            <RefreshCcw size={16} />
            Qayta urinish
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-2.5 rounded-xl transition-colors"
          >
            <Home size={16} />
            Bosh sahifa
          </Link>
        </div>
      </div>
    </div>
  );
}
