// ═══════════════════════════════════════════════════════════════════════════════
// Pack24 — Global Constants & Enums
// Magic string'lar o'rniga loyiha bo'ylab foydalanish uchun
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Buyurtma statuslari ─────────────────────────────────────────────────────
export enum OrderStatus {
    DRAFT = 'draft',
    NEW = 'new',
    PROCESSING = 'processing',
    SHIPPING = 'shipping',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled',
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
    [OrderStatus.DRAFT]: '⚪ Qoralama',
    [OrderStatus.NEW]: '🔵 Yangi',
    [OrderStatus.PROCESSING]: '🟡 Jarayonda',
    [OrderStatus.SHIPPING]: '🚚 Yo\'lda',
    [OrderStatus.DELIVERED]: '✅ Yetkazildi',
    [OrderStatus.CANCELLED]: '🔴 Bekor',
};

// ─── Qayta ishlash ariza statuslari ──────────────────────────────────────────
export enum RecycleStatus {
    NEW = 'new',
    DISPATCHED = 'dispatched',
    ASSIGNED = 'assigned',
    EN_ROUTE = 'en_route',
    ARRIVED = 'arrived',
    COLLECTING = 'collecting',
    COLLECTED = 'collected',
    CONFIRMED = 'confirmed',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    DISPUTED = 'disputed',
}

export const RECYCLE_STATUS_LABELS: Record<RecycleStatus, string> = {
    [RecycleStatus.NEW]: '🔵 Yangi',
    [RecycleStatus.DISPATCHED]: '📤 Yo\'naltirildi',
    [RecycleStatus.ASSIGNED]: '👤 Tayinlandi',
    [RecycleStatus.EN_ROUTE]: '🚚 Yo\'lda',
    [RecycleStatus.ARRIVED]: '📍 Yetib keldi',
    [RecycleStatus.COLLECTING]: '📦 Yig\'ilmoqda',
    [RecycleStatus.COLLECTED]: '✅ Yig\'ildi',
    [RecycleStatus.CONFIRMED]: '💚 Tasdiqlandi',
    [RecycleStatus.COMPLETED]: '🟢 Bajarildi',
    [RecycleStatus.CANCELLED]: '🔴 Bekor',
    [RecycleStatus.DISPUTED]: '⚠️ Bahsli',
};

// ─── Haydovchi statuslari ────────────────────────────────────────────────────
export enum DriverStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    ON_ROUTE = 'on_route',
    BUSY = 'busy',
}

// ─── To'lov statuslari ──────────────────────────────────────────────────────
export enum PaymentStatus {
    PENDING = 'pending',
    PAID_TO_DRIVER = 'paid_to_driver',
    PAID_TO_CUSTOMER = 'paid_to_customer',
    PAID_BOTH = 'paid_both',
    COMPLETED = 'completed',
}

// ─── Mijoz turlari ──────────────────────────────────────────────────────────
export enum CustomerType {
    INDIVIDUAL = 'individual',
    CORPORATE = 'corporate',
    WHOLESALE = 'wholesale',
    DEALER = 'dealer',
}

export enum CustomerGroup {
    STANDARD = 'standard',
    VIP = 'vip',
    NEW = 'new',
    INACTIVE = 'inactive',
    BLOCKED = 'blocked',
}

// ─── Mahsulot statuslari ────────────────────────────────────────────────────
export enum ProductStatus {
    ACTIVE = 'active',
    DRAFT = 'draft',
    ARCHIVED = 'archived',
}

// ─── Pickup usullari ────────────────────────────────────────────────────────
export enum PickupType {
    BASE = 'base',       // O'zi olib keladi
    PICKUP = 'pickup',   // Mashina chaqirish
}

// ─── Foydalanuvchi rollari ───────────────────────────────────────────────────
export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
}

// ─── WorkOrder statuslari ───────────────────────────────────────────────────
export enum WorkOrderStatus {
    PLANNED = 'planned',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    PAUSED = 'paused',
    CANCELLED = 'cancelled',
}

export enum WorkOrderPriority {
    LOW = 'low',
    NORMAL = 'normal',
    HIGH = 'high',
    URGENT = 'urgent',
}

export enum WorkOrderStageType {
    GOFRA = 'gofra',
    PECHAT = 'pechat',
    YIGUV = 'yiguv',
    QC = 'qc',
}

// ─── Umumiy aktiv statuslar (recycling) ──────────────────────────────────────
export const ACTIVE_RECYCLE_STATUSES = [
    RecycleStatus.DISPATCHED,
    RecycleStatus.ASSIGNED,
    RecycleStatus.EN_ROUTE,
    RecycleStatus.ARRIVED,
    RecycleStatus.COLLECTING,
] as const;

export const DRIVER_ACTIVE_STATUSES = [
    RecycleStatus.ASSIGNED,
    RecycleStatus.EN_ROUTE,
    RecycleStatus.ARRIVED,
    RecycleStatus.COLLECTING,
] as const;
