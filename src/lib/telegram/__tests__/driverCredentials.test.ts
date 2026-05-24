import { generateReadablePassword, formatDriverCredentialsMessage } from '../driverCredentials';

jest.mock('../registrationCodes', () => ({
    generateUniqueTelegramRegistrationCode: jest.fn().mockResolvedValue('48291'),
}));

jest.mock('@/lib/prisma', () => ({
    prisma: {
        driver: { update: jest.fn() },
    },
}));

describe('driverCredentials', () => {
    it('generateReadablePassword produces 8-char password without ambiguous chars', () => {
        const p = generateReadablePassword();
        expect(p).toHaveLength(8);
        expect(p).not.toMatch(/[0OlI1]/);
    });

    it('formatDriverCredentialsMessage includes phone, password, code, supervisor', () => {
        const msg = formatDriverCredentialsMessage({
            name: 'Ali',
            phone: '+998901234567',
            code: '48291',
            password: 'AbCdEfGh',
            supervisorName: 'Abror',
            pointRegion: 'Toshkent',
            pointCity: 'Toshkent sh.',
        });
        expect(msg).toContain('Ali');
        expect(msg).toContain('+998901234567');
        expect(msg).toContain('AbCdEfGh');
        expect(msg).toContain('48291');
        expect(msg).toContain('Abror');
        expect(msg).toContain('Toshkent');
    });
});
