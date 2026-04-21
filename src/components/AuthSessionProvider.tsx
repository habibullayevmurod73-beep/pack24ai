'use client';

import { ReactNode, useEffect } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import {
    sessionUserToStoreUser,
    useAuthStore,
} from '@/lib/store/useAuthStore';

function AuthSessionBridge() {
    const { data, status } = useSession();
    const setSessionUser = useAuthStore((state) => state.setSessionUser);

    useEffect(() => {
        if (status === 'authenticated' && data?.user) {
            setSessionUser(sessionUserToStoreUser(data.user));
            return;
        }

        if (status === 'unauthenticated') {
            setSessionUser(null);
        }
    }, [data?.user, setSessionUser, status]);

    return null;
}

export default function AuthSessionProvider({ children }: { children: ReactNode }) {
    return (
        <SessionProvider refetchOnWindowFocus={false}>
            <AuthSessionBridge />
            {children}
        </SessionProvider>
    );
}
