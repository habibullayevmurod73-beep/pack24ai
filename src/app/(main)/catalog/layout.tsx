'use client';

// Catalog layout — sodda wrapper, sidebar page.tsx ichida boshqariladi
export default function CatalogLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {children}
            </div>
        </div>
    );
}
