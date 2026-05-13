import { prisma } from '@/lib/prisma';
import { DriverStatus } from '@prisma/client';
import { createBotEvent } from '@/lib/telegram/botEvents';
import { normalizeStaffPhone } from '@/lib/telegram/botAccessRequests';

// 5-raqamli unikal kod generatsiya
export async function generateDriverCode(): Promise<string> {
    for (let i = 0; i < 20; i++) {
        const code = String(Math.floor(10000 + Math.random() * 90000)); // 10000-99999
        const existsDrv = await prisma.driver.findUnique({ where: { registrationCode: code } });
        const existsSup = await prisma.supervisor.findUnique({ where: { registrationCode: code } });
        if (!existsDrv && !existsSup) return code;
    }
    throw new Error('Kod generatsiya qilib bo\'lmadi');
}

export async function getDrivers(params: {
    supervisorId?: string | null;
    pointId?: string | null;
    status?: string | null;
}) {
    const where: Record<string, unknown> = {};
    if (params.supervisorId) where.supervisorId = Number(params.supervisorId);
    if (params.pointId) where.pointId = Number(params.pointId);
    if (params.status) where.status = params.status;

    const [drivers, supervisorPhones] = await Promise.all([
        prisma.driver.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                supervisor: true,
                point: true,
                _count: { select: { collections: true, assignedRequests: true } },
            },
        }),
        prisma.supervisor.findMany({ select: { phone: true } }),
    ]);

    const supPhoneSet = new Set(supervisorPhones.map((s) => s.phone));
    return drivers.map((d) => ({ ...d, isSupervisor: supPhoneSet.has(d.phone) }));
}

export async function createDriver(data: {
    name: string;
    phone: string;
    telegramId?: string | null;
    telegramName?: string | null;
    supervisorId?: string | number | null;
    pointId?: string | number | null;
    vehicleInfo?: string | null;
    status?: string | null;
}) {
    if (!data.name?.trim() || !data.phone?.trim()) {
        throw new Error('VALIDATION_ERROR: Ism va telefon majburiy');
    }

    const registrationCode = await generateDriverCode();

    const driver = await prisma.driver.create({
        data: {
            name: data.name.trim(),
            phone: normalizeStaffPhone(data.phone.trim()),
            telegramId: data.telegramId || null,
            telegramName: data.telegramName || null,
            supervisorId: data.supervisorId ? Number(data.supervisorId) : null,
            pointId: data.pointId ? Number(data.pointId) : null,
            vehicleInfo: data.vehicleInfo || null,
            status: (data.status as DriverStatus) || DriverStatus.active,
            registrationCode,
        },
        include: { supervisor: true, point: true },
    });

    await createBotEvent({
        sourceBot: 'platform',
        eventType: 'driver.created',
        entityType: 'driver',
        entityId: driver.id,
        severity: 'success',
        title: 'Driver qo\'shildi',
        message: `${driver.name} admin panel orqali tizimga qo'shildi.`,
        driverId: driver.id,
        supervisorId: driver.supervisorId ?? undefined,
        pointId: driver.pointId ?? undefined,
        notifyAdmins: true,
    });

    return driver;
}
