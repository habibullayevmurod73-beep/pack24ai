import {
    RecycleRequestStatus,
    RecyclePaymentStatus as RecycleCollectionPaymentStatus,
    DriverStatus,
} from '@prisma/client';

// Re-export Prisma enums for backward compatibility
export { RecycleRequestStatus, DriverStatus };
export type { RecycleCollectionPaymentStatus };

export const recycleRequestStatuses = Object.values(RecycleRequestStatus);
export const recycleCollectionPaymentStatuses = Object.values(RecycleCollectionPaymentStatus);
export const driverStatuses = Object.values(DriverStatus);

export const activeSupervisorRequestStatuses: ReadonlyArray<RecycleRequestStatus> = [
    RecycleRequestStatus.new_,
    RecycleRequestStatus.dispatched,
    RecycleRequestStatus.assigned,
    RecycleRequestStatus.en_route,
    RecycleRequestStatus.arrived,
    RecycleRequestStatus.collecting,
];

const recycleRequestTransitions: Record<RecycleRequestStatus, ReadonlyArray<RecycleRequestStatus>> = {
    [RecycleRequestStatus.new_]:       [RecycleRequestStatus.dispatched, RecycleRequestStatus.assigned, RecycleRequestStatus.cancelled],
    [RecycleRequestStatus.dispatched]: [RecycleRequestStatus.assigned, RecycleRequestStatus.cancelled],
    [RecycleRequestStatus.assigned]:   [RecycleRequestStatus.en_route, RecycleRequestStatus.cancelled],
    [RecycleRequestStatus.en_route]:   [RecycleRequestStatus.arrived, RecycleRequestStatus.cancelled],
    [RecycleRequestStatus.arrived]:    [RecycleRequestStatus.collecting, RecycleRequestStatus.cancelled],
    [RecycleRequestStatus.collecting]: [RecycleRequestStatus.collected, RecycleRequestStatus.cancelled],
    [RecycleRequestStatus.collected]:  [RecycleRequestStatus.confirmed, RecycleRequestStatus.completed, RecycleRequestStatus.disputed, RecycleRequestStatus.cancelled],
    [RecycleRequestStatus.confirmed]:  [RecycleRequestStatus.completed, RecycleRequestStatus.disputed],
    [RecycleRequestStatus.completed]:  [],
    [RecycleRequestStatus.cancelled]:  [],
    [RecycleRequestStatus.disputed]:   [RecycleRequestStatus.completed, RecycleRequestStatus.cancelled],
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
