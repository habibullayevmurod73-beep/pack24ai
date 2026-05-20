export interface ReportData {
    summary: {
        totalOrders: number;
        newOrders: number;
        totalRevenue: number;
        periodOrders: number;
        periodRevenue: number;
        completedOrders: number;
        conversionRate: number;
        aov: number;
        cancelRate: number;
        repeatRate: number;
        cancelledOrders: number;
        peakHour: number;
    };
    trends: {
        ordersGrowth: number;
        revenueGrowth: number;
        conversionChange: number;
    };
    topProducts: {
        productId: number;
        name: string;
        image: string | null;
        price: number;
        totalSold: number;
        orderCount: number;
    }[];
    ordersByStatus: { status: string; _count: { status: number } }[];
    dailyRevenue: { date: string; revenue: number; orders: number }[];
    funnelData: {
        draft: number;
        new: number;
        processing: number;
        shipping: number;
        delivered: number;
        cancelled: number;
    } | null;
    regionSales: { region: string; orders: number; revenue: number }[];
    botReports: {
        customer: {
            uniqueUsers: number;
            totalRequests: number;
            pickupRequests: number;
            selfDeliveryRequests: number;
            confirmedRequests: number;
            disputedRequests: number;
        };
        driver: {
            totalCollections: number;
            totalWeight: number;
            totalAmount: number;
            pendingPayments: number;
        };
        admin: {
            assignedRequests: number;
            completedRequests: number;
            approvedPaymentsCount: number;
            approvedPaymentsAmount: number;
        };
        topDrivers: {
            driverId: number;
            name: string;
            phone: string;
            isOnline: boolean;
            status: string;
            collections: number;
            totalWeight: number;
            totalAmount: number;
        }[];
        topSupervisors: {
            supervisorId: number;
            name: string;
            phone: string;
            assignedRequests: number;
            completedRequests: number;
            approvedPaymentsCount: number;
            approvedPaymentsAmount: number;
        }[];
    };
    period: number;
}

export const STATUS_MAP: Record<string, { label: string; color: string }> = {
    new:        { label: 'Yangi',       color: '#3b82f6' },
    processing: { label: 'Jarayonda',   color: '#8b5cf6' },
    shipping:   { label: "Yo'lda",      color: '#f59e0b' },
    delivered:  { label: 'Yetkazildi',  color: '#10b981' },
    cancelled:  { label: 'Bekor',       color: '#ef4444' },
    draft:      { label: 'Draft',       color: '#9ca3af' },
};

export const EXPORT_TYPES = [
    { type: 'orders', label: '📦 Buyurtmalar (CSV)' },
    { type: 'products', label: '🏷️ Mahsulotlar (CSV)' },
    { type: 'customers', label: '👥 Mijozlar (CSV)' },
    { type: 'recycling', label: '♻️ Makulatura (CSV)' },
    { type: 'bot_drivers', label: '🚚 Bot: Top haydovchilar (CSV)' },
    { type: 'bot_supervisors', label: '👷 Bot: Top masullar (CSV)' },
] as const;
