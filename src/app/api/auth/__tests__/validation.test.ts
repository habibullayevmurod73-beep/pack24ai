/**
 * Auth API unit testlari (birlashtirilgan)
 */

describe('Auth validatsiya qoidalari', () => {
    // Login validatsiya mantiqini test qilish
    describe('login validatsiya', () => {
        function validateLogin(phone: string, password: string) {
            if (!phone || !password) return 'Telefon va parol kiritilishi shart';
            if (phone.replace(/\D/g, '').length < 9) return "Telefon raqam noto'g'ri";
            if (password.length < 6) return 'Parol juda qisqa';
            return null;
        }

        it('bo\'sh maydon uchun xato qaytarishi kerak', () => {
            expect(validateLogin('', '')).toBe('Telefon va parol kiritilishi shart');
        });

        it('qisqa telefon uchun xato qaytarishi kerak', () => {
            expect(validateLogin('123', 'password123')).toBe("Telefon raqam noto'g'ri");
        });

        it('to\'g\'ri ma\'lumotlar uchun null qaytarishi kerak', () => {
            expect(validateLogin('+998901234567', 'password123')).toBeNull();
        });
    });

    // Register validatsiya mantiqini test qilish
    describe('register validatsiya', () => {
        function validateRegister(name: string, phone: string, password: string) {
            if (!name || !phone || !password) return 'Barcha maydonlar to\'ldirilishi shart';
            if (name.trim().length < 2) return 'Ism juda qisqa';
            if (phone.replace(/\D/g, '').length < 9) return "Telefon raqam noto'g'ri";
            if (password.length < 6) return 'Parol kamida 6 belgidan iborat bo\'lishi kerak';
            return null;
        }

        it('bo\'sh ism uchun xato', () => {
            expect(validateRegister('', '+998901234567', 'pass123')).toBeTruthy();
        });

        it('1 ta belgidan iborat ism uchun xato', () => {
            expect(validateRegister('A', '+998901234567', 'pass123')).toBe('Ism juda qisqa');
        });

        it('5 belgidan iborat parol uchun xato', () => {
            expect(validateRegister('Ali', '+998901234567', '123')).toBe('Parol kamida 6 belgidan iborat bo\'lishi kerak');
        });

        it('to\'g\'ri ma\'lumotlar uchun null', () => {
            expect(validateRegister('Alibek', '+998901234567', 'secure123')).toBeNull();
        });
    });
});
