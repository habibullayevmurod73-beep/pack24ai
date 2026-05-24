export default function SectionSkeleton({ height = 320 }: { height?: number }) {
    return (
        <div
            className="mx-auto max-w-7xl px-4 py-8 animate-pulse"
            style={{ minHeight: height }}
        >
            <div className="h-8 w-48 bg-gray-200 rounded-lg mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="h-40 bg-gray-200 rounded-xl" />
                <div className="h-40 bg-gray-200 rounded-xl" />
                <div className="h-40 bg-gray-200 rounded-xl" />
            </div>
        </div>
    );
}
