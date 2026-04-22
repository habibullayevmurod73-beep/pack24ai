export const recycleRequestStatuses = [
    'new',
    'dispatched',
    'assigned',
    'en_route',
    'arrived',
    'collecting',
    'collected',
    'confirmed',
    'completed',
    'cancelled',
    'disputed',
] as const;

export type RecycleRequestStatus = (typeof recycleRequestStatuses)[number];

export const recycleCollectionPaymentStatuses = [
    'pending',
    'paid_to_driver',
    'paid_to_customer',
    'paid_both',
    'completed',
] as const;

export type RecycleCollectionPaymentStatus = (typeof recycleCollectionPaymentStatuses)[number];

export const driverStatuses = [
    'active',
    'inactive',
    'on_route',
    'busy',
] as const;

export type DriverStatus = (typeof driverStatuses)[number];

export const activeSupervisorRequestStatuses: ReadonlyArray<RecycleRequestStatus> = [
    'new',
    'dispatched',
    'assigned',
    'en_route',
    'arrived',
    'collecting',
];

const recycleRequestTransitions: Record<RecycleRequestStatus, ReadonlyArray<RecycleRequestStatus>> = {
    new: ['dispatched', 'assigned', 'cancelled'],
    dispatched: ['assigned', 'cancelled'],
    assigned: ['en_route', 'cancelled'],
    en_route: ['arrived', 'cancelled'],
    arrived: ['collecting', 'cancelled'],
    collecting: ['collected', 'cancelled'],
    collected: ['confirmed', 'completed', 'disputed', 'cancelled'],
    confirmed: ['completed', 'disputed'],
    completed: [],
    cancelled: [],
    disputed: ['completed', 'cancelled'],
};

export function canTransitionRecycleRequestStatus(
    from: RecycleRequestStatus,
    to: RecycleRequestStatus
): boolean {
    return recycleRequestTransitions[from]?.includes(to) ?? false;
}

export function isRecycleCollectionPaymentStatus(
    value: string
): value is RecycleCollectionPaymentStatus {
    return recycleCollectionPaymentStatuses.includes(
        value as RecycleCollectionPaymentStatus
    );
}
