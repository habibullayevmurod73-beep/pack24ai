// Server Component — 'use client' kerak emas
export default function Loading() {
    return (
        <div className="min-h-[70vh] flex items-center justify-center p-8">
            <div className="flex flex-col items-center gap-6">
                {/* Pack24 spinner */}
                <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 border-r-blue-300 border-b-transparent border-l-transparent animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[11px] font-black text-gray-800 tracking-tighter">
                            P<span className="text-blue-600">24</span>
                        </span>
                    </div>
                </div>

                {/* Skeleton lines */}
                <div className="space-y-3 w-56">
                    <div className="h-3 bg-gray-100 rounded-full animate-pulse w-2/3" />
                    <div className="h-3 bg-gray-100 rounded-full animate-pulse w-full" />
                    <div className="h-3 bg-gray-100 rounded-full animate-pulse w-4/5" />
                </div>

                <p className="text-xs text-gray-400 font-medium animate-pulse">
                    Yuklanmoqda...
                </p>
            </div>
        </div>
    );
}
