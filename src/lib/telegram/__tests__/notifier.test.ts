jest.mock('../botManager', () => {
    const sendMessage = jest.fn().mockRejectedValue(new Error('400: Bad Request: chat not found'));
    return {
        getDriverBot: jest.fn().mockResolvedValue({ telegram: { sendMessage } }),
        getAdminBot: jest.fn().mockResolvedValue({ telegram: { sendMessage } }),
        getPack24AdminBot: jest.fn().mockResolvedValue({ telegram: { sendMessage } }),
        getCustomerBot: jest.fn().mockResolvedValue(null),
    };
});

const mockCreateBotEvent = jest.fn().mockResolvedValue({ id: 1 });

jest.mock('../botEvents', () => ({
    createBotEvent: (...args: unknown[]) => mockCreateBotEvent(...args),
}));

jest.mock('@/lib/prisma', () => ({
    prisma: { telegramConfig: { findFirst: jest.fn().mockResolvedValue(null) } },
}));

import { notifyDriver, notifyAdmin, notifyPack24Admin } from '../notifier';

describe('notifier dm_undelivered audit', () => {
    beforeEach(() => {
        mockCreateBotEvent.mockClear();
    });

    it('notifyDriver logs dm_undelivered on failure', async () => {
        await notifyDriver('12345', 'test message');
        expect(mockCreateBotEvent).toHaveBeenCalledWith(
            expect.objectContaining({
                eventType: 'driver.dm_undelivered',
                severity: 'warning',
                payload: expect.objectContaining({ channel: 'driver', chatId: '12345' }),
            }),
        );
    });

    it('notifyAdmin logs dm_undelivered on failure', async () => {
        await notifyAdmin('67890', 'test message');
        expect(mockCreateBotEvent).toHaveBeenCalledWith(
            expect.objectContaining({
                eventType: 'admin.dm_undelivered',
            }),
        );
    });

    it('notifyPack24Admin logs dm_undelivered on failure', async () => {
        await notifyPack24Admin('11111', 'test message');
        expect(mockCreateBotEvent).toHaveBeenCalledWith(
            expect.objectContaining({
                eventType: 'pack24admin.dm_undelivered',
            }),
        );
    });
});
