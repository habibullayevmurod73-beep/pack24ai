
'use client';

import { usePathname } from 'next/navigation';
import AIConsultant from './AIConsultant';

export default function GlobalAIWrapper() {
    const pathname = usePathname();

    // Hide global AI on the configurator page because it has its own context-aware instance
    if (pathname === '/configurator') {
        return null;
    }

    return <AIConsultant />;
}
