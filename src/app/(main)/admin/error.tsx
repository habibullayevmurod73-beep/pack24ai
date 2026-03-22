'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Pack24 Admin Error]:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-slate-800 mb-2">
          Xatolik yuz berdi
        </h1>
        <p className="text-slate-500 text-sm mb-4">
          Bu sahifani yuklashda muammo chiqdi.
        </p>
        {error?.digest && (
          <p className="text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2 inline-block font-mono mb-6">
            Kod: {error.digest}
          </p>
        )}
        <div className="flex gap-3 justify-center mt-4">
          <button
            onClick={reset}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
          >
            <RefreshCcw size={14} />
            Qayta yuklash
          </button>
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
          >
            <LayoutDashboard size={14} />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
