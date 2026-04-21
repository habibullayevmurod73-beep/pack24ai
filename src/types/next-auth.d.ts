import NextAuth, { DefaultSession } from 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: DefaultSession['user'] & {
            id: string;
            phone: string;
            role: string;
        };
    }

    interface User {
        role?: string;
        phone?: string;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        role?: string;
        phone?: string;
    }
}
