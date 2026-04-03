/**
 * NextAuth v4 konfiguratsiyasi
 * Foydalanuvchi telefon raqami orqali kiradi.
 */
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions } from 'next-auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

function hashPassword(password: string): string {
    return crypto
        .createHash('sha256')
        .update(password + (process.env.AUTH_SECRET ?? ''))
        .digest('hex');
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                phone: { label: 'Telefon', type: 'text' },
                password: { label: 'Parol', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.phone || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { phone: credentials.phone },
                });

                if (!user || !user.isActive) return null;

                const isValid = hashPassword(credentials.password) === user.passwordHash;
                if (!isValid) return null;

                const userWithEmail = user as typeof user & { email?: string | null };
                return {
                    id: String(user.id),
                    name: user.name,
                    email: userWithEmail.email ?? user.phone, // email optional field, fallback to phone
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                const dbUser = await prisma.user.findUnique({
                    where: { id: Number(user.id) },
                    select: { role: true, phone: true },
                });
                token.role = dbUser?.role ?? 'user';
                token.phone = dbUser?.phone ?? '';
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as Record<string, unknown>).role = token.role;
                (session.user as Record<string, unknown>).phone = token.phone;
                (session.user as Record<string, unknown>).id = token.sub;
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
