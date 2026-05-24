import { test, expect } from '@playwright/test';

/**
 * Admin login critical path E2E.
 *
 * Tekshiradi:
 *   - login sahifa ochiladi
 *   - noto'g'ri parolda xato ko'rinadi
 *   - to'g'ri parol bilan dashboard'ga o'tadi va auth cookie o'rnatiladi
 *
 * Sirlarni env'dan oladi: ADMIN_USERNAME, ADMIN_PASSWORD.
 * CI'da bu ikkita secret repo secrets'ga qo'shilishi kerak (yoki test-only flow).
 */

const adminUser = process.env.ADMIN_USERNAME ?? 'admin';
const adminPass = process.env.ADMIN_PASSWORD ?? '';

test.describe('Admin login', () => {
    test('login sahifa ochiladi', async ({ page }) => {
        await page.goto('/admin/login');
        await expect(page).toHaveURL(/\/admin\/login/);
        // ID selector — header'dagi "Login" linki bilan chalkashmaslik uchun
        await expect(page.locator('#admin-login')).toBeVisible();
        await expect(page.locator('#admin-password')).toBeVisible();
    });

    test('noto\'g\'ri parol — xato ko\'rinadi', async ({ page }) => {
        await page.goto('/admin/login');
        await page.locator('#admin-login').fill('admin');
        await page.locator('#admin-password').fill('certainly-wrong-password-xyz');

        const loginResponse = page.waitForResponse(
            (r) => r.url().includes('/api/admin/login') && r.request().method() === 'POST',
            { timeout: 30_000 },
        );
        await page.getByRole('button', { name: /(kirish|login|войти)/i }).click();
        const res = await loginResponse;
        expect(res.status()).toBe(401);

        await expect(page.getByText(/Login yoki parol/i)).toBeVisible({
            timeout: 5_000,
        });
        // URL hali login'da
        await expect(page).toHaveURL(/\/admin\/login/);
    });

    test('to\'g\'ri parol — admin dashboard ochiladi', async ({ page }) => {
        test.skip(!adminPass, 'ADMIN_PASSWORD env yo\'q — bu test o\'tkazib yuborildi');

        await page.goto('/admin/login');
        await page.locator('#admin-login').fill(adminUser);
        await page.locator('#admin-password').fill(adminPass);
        await page.getByRole('button', { name: /(kirish|login|войти)/i }).click();

        await page.waitForURL(/\/admin(\/|$)/, { timeout: 15_000 });
        // Auth cookie tekshiruvi
        const cookies = await page.context().cookies();
        const adminCookie = cookies.find((c) => c.name === 'pack24_admin_auth');
        expect(adminCookie).toBeTruthy();
        expect(adminCookie?.httpOnly).toBe(true);
    });
});
