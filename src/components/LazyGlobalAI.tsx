'use client';

import dynamic from 'next/dynamic';

const GlobalAIWrapper = dynamic(() => import('./GlobalAIWrapper'), {
    ssr: false,
    loading: () => null,
});

export default function LazyGlobalAI() {
    return <GlobalAIWrapper />;
}
