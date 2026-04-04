export default function AdminLoading() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center bg-[#f8fafc]">
            <div className="flex flex-col items-center gap-5">
                {/* Spinner with inner P24 badge */}
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 border-r-blue-300 border-b-transparent border-l-transparent animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                            <span className="text-[9px] font-black text-blue-600">P24</span>
                        </div>
                    </div>
                </div>

                {/* Skeleton bars */}
                <div className="space-y-2 w-48">
                    <div className="h-2 bg-slate-100 rounded-full animate-pulse w-full" />
                    <div className="h-2 bg-slate-100 rounded-full animate-pulse w-3/4" />
                    <div className="h-2 bg-slate-100 rounded-full animate-pulse w-11/12" />
                </div>

                <p className="text-xs font-medium text-slate-400 animate-pulse tracking-wide">
                    Tizim yuklanmoqda...
                </p>
            </div>
        </div>
    );
}
