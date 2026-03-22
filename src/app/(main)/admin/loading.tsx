export default function AdminLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-[#f8fafc]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
          <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        </div>
        <p className="text-sm font-medium text-slate-400 animate-pulse">
          Tizim yuklanmoqda...
        </p>
      </div>
    </div>
  );
}
