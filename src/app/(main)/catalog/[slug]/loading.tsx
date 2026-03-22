// Catalog category page loading skeleton
export default function CatalogSlugLoading() {
    return (
        <div className="font-sans animate-pulse">
            {/* Breadcrumb skeleton */}
            <div className="flex items-center gap-2 mb-5">
                <div className="h-3 bg-gray-200 rounded-full w-20" />
                <div className="h-3 bg-gray-100 rounded-full w-3" />
                <div className="h-3 bg-gray-200 rounded-full w-16" />
                <div className="h-3 bg-gray-100 rounded-full w-3" />
                <div className="h-3 bg-gray-200 rounded-full w-32" />
            </div>

            <div className="flex gap-6">
                {/* Filter sidebar skeleton (desktop) */}
                <div className="hidden lg:block w-56 xl:w-64 flex-shrink-0">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
                        <div className="h-4 bg-gray-200 rounded-full w-24" />
                        <div className="h-3 bg-gray-100 rounded-full w-full" />
                        <div className="h-8 bg-gray-100 rounded-xl" />
                        <div className="space-y-2 mt-4">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-gray-100 rounded" />
                                    <div className="h-3 bg-gray-100 rounded-full flex-1" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main content skeleton */}
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <div className="h-6 bg-gray-200 rounded-full w-48 mb-2" />
                            <div className="h-3 bg-gray-100 rounded-full w-24" />
                        </div>
                        <div className="flex gap-2">
                            <div className="h-9 bg-gray-100 rounded-xl w-36" />
                            <div className="h-9 bg-gray-100 rounded-xl w-28" />
                            <div className="h-9 bg-gray-100 rounded-xl w-20" />
                        </div>
                    </div>

                    {/* Product grid skeleton */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                                <div className="h-44 bg-gradient-to-br from-gray-100 to-gray-50" />
                                <div className="p-4 space-y-2">
                                    <div className="h-3 bg-gray-200 rounded-full w-full" />
                                    <div className="h-3 bg-gray-100 rounded-full w-2/3" />
                                    <div className="flex justify-between items-center mt-3">
                                        <div className="h-5 bg-blue-100 rounded-full w-24" />
                                        <div className="h-8 bg-blue-100 rounded-xl w-20" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
