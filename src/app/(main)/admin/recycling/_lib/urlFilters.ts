import { urlHasBotEventFeedParams } from '@/lib/platform/botEventFeedUrl';
import type { AdminRecyclingTab } from './types';

const REQUEST_TAB_STATUS_VALUES = new Set([
    'all', 'new', 'dispatched', 'en_route', 'arrived', 'collecting', 'collected',
    'confirmed', 'completed', 'disputed', 'cancelled', 'processing', 'assigned',
]);

const ALLOWED_TABS = new Set<AdminRecyclingTab>([
    'dashboard', 'map', 'points', 'requests', 'supervisors', 'drivers',
    'collections', 'finance', 'payouts', 'complaints', 'journal', 'bot-events',
]);

function readPositiveQueryInt(params: URLSearchParams, key: string) {
    const raw = params.get(key);
    const parsed = raw ? Number(raw) : NaN;
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function readRequestStatusFromParams(params: URLSearchParams): string {
    const raw = params.get('requestStatus')?.trim() ?? '';
    if (!raw || raw === 'all') return 'all';
    if (REQUEST_TAB_STATUS_VALUES.has(raw)) return raw;
    return 'all';
}

export type RecyclingInitialFilters = {
    activeTab: AdminRecyclingTab;
    requestSearch: string;
    requestFilter: string;
    selectedPointId: number | null;
    selectedSupervisorId: number | null;
    selectedDriverId: number | null;
};

export function readInitialRecyclingFilters(): RecyclingInitialFilters {
    if (typeof window === 'undefined') {
        return {
            activeTab: 'dashboard',
            requestSearch: '',
            requestFilter: 'all',
            selectedPointId: null,
            selectedSupervisorId: null,
            selectedDriverId: null,
        };
    }

    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    const requestId = params.get('requestId')?.trim() ?? '';

    if (urlHasBotEventFeedParams(params)) {
        return {
            activeTab: 'bot-events',
            requestSearch: requestId,
            requestFilter: readRequestStatusFromParams(params),
            selectedPointId: readPositiveQueryInt(params, 'pointId'),
            selectedSupervisorId: readPositiveQueryInt(params, 'supervisorId'),
            selectedDriverId: readPositiveQueryInt(params, 'driverId'),
        };
    }

    const hasExplicitTab = Boolean(tab && ALLOWED_TABS.has(tab as AdminRecyclingTab));

    if (!hasExplicitTab) {
        const stRaw = params.get('requestStatus')?.trim() ?? '';
        const impliedRequests =
            (stRaw && stRaw !== 'all' && REQUEST_TAB_STATUS_VALUES.has(stRaw)) || Boolean(requestId);
        if (impliedRequests) {
            return {
                activeTab: 'requests',
                requestSearch: requestId,
                requestFilter: readRequestStatusFromParams(params),
                selectedPointId: readPositiveQueryInt(params, 'pointId'),
                selectedSupervisorId: readPositiveQueryInt(params, 'supervisorId'),
                selectedDriverId: readPositiveQueryInt(params, 'driverId'),
            };
        }
    }

    return {
        activeTab: hasExplicitTab ? (tab as AdminRecyclingTab) : 'dashboard',
        requestSearch: requestId,
        requestFilter: readRequestStatusFromParams(params),
        selectedPointId: readPositiveQueryInt(params, 'pointId'),
        selectedSupervisorId: readPositiveQueryInt(params, 'supervisorId'),
        selectedDriverId: readPositiveQueryInt(params, 'driverId'),
    };
}
