/** @jest-environment node */

const getServerSessionMock = jest.fn();
const findUniqueMock = jest.fn();

jest.mock('next-auth', () => ({
    __esModule: true,
    default: jest.fn(),
    getServerSession: (...args: unknown[]) => getServerSessionMock(...args),
}));

jest.mock('@/lib/prisma', () => ({
    prisma: {
        user: {
            findUnique: (...args: unknown[]) => findUniqueMock(...args),
        },
    },
}));

import { GET } from '@/app/api/eco/stats/route';

describe('GET /api/eco/stats', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('sessiya bo\'lmasa 401 qaytaradi', async () => {
        getServerSessionMock.mockResolvedValue(null);

        const response = await GET();

        expect(response.status).toBe(401);
        await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' });
    });

    it('session user id bilan userni topadi', async () => {
        getServerSessionMock.mockResolvedValue({
            user: { id: '42', phone: '+998901234567', role: 'user' },
        });
        findUniqueMock.mockResolvedValue({
            ecoPoints: 12,
            totalRecycledWeight: 25,
            recycleRequests: [],
        });

        const response = await GET();
        const payload = await response.json();

        expect(findUniqueMock).toHaveBeenCalledWith({
            where: { id: 42 },
            include: {
                recycleRequests: {
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                },
            },
        });
        expect(payload.points).toBe(12);
        expect(payload.totalWeight).toBe(25);
    });
});
