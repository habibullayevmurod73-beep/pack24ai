import { useEffect, useRef, useState } from 'react';

/**
 * Viewport ga kirganda target raqamgacha animatsiyali hisoblaydi.
 * Cubic ease-out bilan.
 */
export function useAnimatedCounter(
    target: number,
    duration = 1800,
    startOnView = true
) {
    const [value, setValue] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const started = useRef(false);

    useEffect(() => {
        if (!startOnView) { animateTo(); return; }
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !started.current) {
                    started.current = true;
                    animateTo();
                }
            },
            { threshold: 0.4 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();

        function animateTo() {
            let start: number | null = null;
            const step = (ts: number) => {
                if (!start) start = ts;
                const progress = Math.min((ts - start) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                setValue(Math.floor(eased * target));
                if (progress < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        }
    }, [target, duration, startOnView]);

    return { value, ref };
}
