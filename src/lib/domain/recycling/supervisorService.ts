import { prisma } from '@/lib/prisma';
import { createBotEvent } from '@/lib/telegram/botEvents';
import { normalizeStaffPhone } from '@/lib/telegram/botAccessRequests';

// 5-raqamli unikal kod generatsiya
export async function generateSupervisorCode(): Promise<string> {
    for (let i = 0; i < 20; i++) {
        const code = String(Math.floor(10000 + Math.random() * 90000)); // 10000-99999
        const existsSup = await prisma.supervisor.findUnique({ where: { registrationCode: code } });
        const existsDrv = await prisma.driver.findUnique({ where: { registrationCode: code } });
        if (!existsSup && !existsDrv) return code;
    }
    throw new Error('Kod generatsiya qilib bo\'lmadi');
}

export async function getSupervisors() {
    return prisma.supervisor.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            point: true,
            _count: { select: { drivers: true, requests: true } },
        },
    });
}

export async function createSupervisor(data: {
    name: string;
    phone: string;
    telegramId?: string | null;
    telegramName?: string | null;
    pointId?: string | number | null;
    isActive?: boolean;
}) {
    if (!data.name?.trim() || !data.phone?.trim()) {
        throw new Error('VALIDATION_ERROR: Ism va telefon majburiy');
    }

    const registrationCode = await generateSupervisorCode();

    const supervisor = await prisma.supervisor.create({
        data: {
            name: data.name.trim(),
            phone: normalizeStaffPhone(data.phone.trim()),
            telegramId: data.telegramId || null,
            telegramName: data.telegramName || null,
            pointId: data.pointId ? Number(data.pointId) : null,
            isActive: data.isActive ?? true,
            registrationCode,
        },
        include: { point: true },
    });

    await createBotEvent({
        sourceBot: 'platform',
        eventType: 'supervisor.created',
        entityType: 'supervisor',
        entityId: supervisor.id,
        severity: 'success',
        title: 'Admin/Supervisor qo\'shildi',
        message: `${supervisor.name} admin panel orqali tizimga qo'shildi.`,
        supervisorId: supervisor.id,
        pointId: supervisor.pointId ?? undefined,
        notifyAdmins: true,
    });

    return supervisor;
}
