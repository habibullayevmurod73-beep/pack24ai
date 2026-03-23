import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

function hashPassword(password: string): string {
    // MUHIM: qavs operator precedence uchun zarur
    return crypto
        .createHash('sha256')
        .update(password + (process.env.AUTH_SECRET ?? ''))
        .digest('hex');
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Credentials({
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
                    where: { phone: credentials.phone as string },
                });

                if (!user || !user.isActive) return null;

                const isValid = hashPassword(credentials.password as string) === user.passwordHash;
                if (!isValid) return null;

                return {
                    id: String(user.id),
                    name: user.name,
                    email: user.phone, // NextAuth email o'rniga phone
                    role: user.role,
                };
            },
        }),
    ],
    callbacks: {
        jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                token.phone = user.email; // phone ni email o'rniga saqladik
            }
            return token;
        },
        session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).phone = token.phone;
                (session.user as any).id = token.sub;
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
});
