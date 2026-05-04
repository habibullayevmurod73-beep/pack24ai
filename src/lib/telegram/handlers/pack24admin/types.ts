export type Pack24AdminSession = {
    step: 'phone' | 'menu';
};

export type AccessIdentity =
    | { kind: 'db'; id: number; name: string; phone: string; telegramId: string | null; registrationCode: string | null; isActive: boolean }
    | { kind: 'static'; id: null; name: string; phone: null; telegramId: string; registrationCode: null; isActive: true };
