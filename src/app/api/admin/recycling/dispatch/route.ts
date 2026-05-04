import { NextRequest, NextResponse } from 'next/server';
import {
    readEnum,
    readJsonObject,
    readNumber,
    readOptionalNumber,
    readOptionalString,
    RequestValidationError,
} from '@/lib/requestValidation';
import {
    DISPATCH_ACTIONS,
    dispatchToSupervisor,
    assignDriver,
    driverEnRoute,
    driverArrived,
    startCollecting,
    markCompleted,
    cancelRequest,
} from '@/lib/domain/recycling/dispatchService';

export async function POST(req: NextRequest) {
    try {
        const body = await readJsonObject(req);
        const action = readEnum(body.action, 'action', DISPATCH_ACTIONS);
        const requestId = readNumber(body.requestId, 'requestId');
        const supervisorId = readOptionalNumber(body.supervisorId, 'supervisorId');
        const driverId = readOptionalNumber(body.driverId, 'driverId');
        const note = readOptionalString(body.note, 'note');

        if (!Number.isInteger(requestId) || requestId <= 0) {
            throw new RequestValidationError('requestId musbat butun son bo\'lishi kerak');
        }

        let updated;

        switch (action) {
            case 'dispatch_to_supervisor':
                if (!supervisorId) return NextResponse.json({ error: 'supervisorId majburiy' }, { status: 400 });
                updated = await dispatchToSupervisor(requestId, supervisorId);
                break;
            case 'assign_driver':
                if (!driverId) return NextResponse.json({ error: 'driverId majburiy' }, { status: 400 });
                updated = await assignDriver(requestId, driverId);
                break;
            case 'driver_en_route':
                updated = await driverEnRoute(requestId);
                break;
            case 'driver_arrived':
                updated = await driverArrived(requestId);
                break;
            case 'start_collecting':
                updated = await startCollecting(requestId);
                break;
            case 'mark_completed':
                updated = await markCompleted(requestId, note);
                break;
            case 'cancel_request':
                updated = await cancelRequest(requestId, note);
                break;
            default:
                return NextResponse.json({ error: 'Noto\'g\'ri action' }, { status: 400 });
        }

        return NextResponse.json(updated);

    } catch (error) {
        if (error instanceof RequestValidationError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        
        if (error instanceof Error) {
            if (error.message === 'REQUEST_NOT_FOUND') return NextResponse.json({ error: 'Ariza topilmadi' }, { status: 404 });
            if (error.message === 'SUPERVISOR_NOT_FOUND') return NextResponse.json({ error: 'Masul topilmadi' }, { status: 404 });
            if (error.message === 'DRIVER_NOT_FOUND') return NextResponse.json({ error: 'Haydovchi topilmadi' }, { status: 404 });
        }

        console.error('[Dispatch POST]', error);
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}
