/**
 * NextAuth v4 konfiguratsiyasi
 * Foydalanuvchi telefon raqami orqali kiradi.
 */
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions } from 'next-auth';
import { prisma } from '@/lib/prisma';
import {
    isValidPhone,
    normalizePhone,
    verifyPassword,
} from '@/lib/userAuth';

export const authOptions: NextAuthOptions = {
    providers: [
        // ── 1. Parol bilan kirish (oddiy) ─────────────────────────────
        CredentialsProvider({
            id: 'credentials',
            name: 'credentials',
            credentials: {
                phone: { label: 'Telefon', type: 'text' },
                password: { label: 'Parol', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.phone || !credentials?.password) return null;

                const phone = normalizePhone(credentials.phone);
                if (!isValidPhone(phone)) return null;

                const user = await prisma.user.findUnique({ where: { phone } });
                if (!user || !user.isActive) return null;

                const input = credentials.password.trim();

                const passwordCheck = await verifyPassword(input, user.passwordHash);
                if (!passwordCheck.valid) return null;

                if (passwordCheck.needsRehash && passwordCheck.nextHash) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { passwordHash: passwordCheck.nextHash },
                    });
                }

                return {
                    id: String(user.id),
                    name: user.name,
                    email: user.email ?? null,
                    role: user.role,
                    phone: user.phone,
                };
            },
        }),

        // ── 2. Telegram OTP bilan kirish ──────────────────────────────
        CredentialsProvider({
            id: 'telegram-otp',
            name: 'telegram-otp',
            credentials: {
                phone: { label: 'Telefon', type: 'text' },
                otp:   { label: 'OTP Kod', type: 'text' },
            },
            async authorize(credentials) {
                if (!credentials?.phone || !credentials?.otp) return null;

                const phone = normalizePhone(credentials.phone);
                if (!isValidPhone(phone)) return null;

                const user = await prisma.user.findUnique({ where: { phone } });
                if (!user || !user.isActive) return null;

                const otp = credentials.otp.trim();

                // OTP mavjud va muddati o'tmagan bo'lishi kerak
                if (!user.otpCode || !user.otpExpiry) return null;
                if (new Date() > user.otpExpiry) return null;
                if (user.otpAttempts >= 5) return null;

                if (user.otpCode !== otp) {
                    // Noto'g'ri urinish — hisoblagichni oshirish
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { otpAttempts: { increment: 1 } },
                    });
                    return null;
                }

                // ✅ To'g'ri — OTP ni o'chirib tashlash
                await prisma.user.update({
                    where: { id: user.id },
                    data: { otpCode: null, otpExpiry: null, otpAttempts: 0 },
                });

                return {
                    id: String(user.id),
                    name: user.name,
                    email: user.email ?? null,
                    role: user.role,
                    phone: user.phone,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as { role?: string }).role ?? 'user';
                token.phone = (user as { phone?: string }).phone ?? '';
                token.name = user.name;
                token.email = user.email;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as Record<string, unknown>).role = token.role;
                (session.user as Record<string, unknown>).phone = token.phone;
                (session.user as Record<string, unknown>).id = token.sub;
                session.user.name = token.name ?? session.user.name;
                session.user.email = token.email ?? session.user.email;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 kun
    },
    secret: process.env.AUTH_SECRET,
};

export default NextAuth(authOptions);
