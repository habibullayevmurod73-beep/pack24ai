import { prisma } from '@/lib/prisma';

export async function getPoints() {
    return prisma.recyclePoint.findMany({
        orderBy: { id: 'asc' }
    });
}

export async function createPoint(data: {
    regionUz: string;
    cityUz: string;
    phone: string;
    regionRu?: string;
    cityRu?: string;
    address?: string;
    lat?: string | number;
    lng?: string | number;
    status?: string;
    color?: string;
}) {
    if (!data.regionUz || !data.cityUz || !data.phone) {
        throw new Error('VALIDATION_ERROR: Asosiy maydonlar to\'ldirilmagan');
    }

    return prisma.recyclePoint.create({
        data: {
            regionUz: data.regionUz,
            regionRu: data.regionRu || data.regionUz,
            cityUz: data.cityUz,
            cityRu: data.cityRu || data.cityUz,
            phone: data.phone,
            address: data.address || null,
            lat: data.lat ? Number(data.lat) : null,
            lng: data.lng ? Number(data.lng) : null,
            status: data.status || 'planned',
            color: data.color || 'bg-blue-500',
        }
    });
}
