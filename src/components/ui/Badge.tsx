import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'success' | 'warning' | 'error' | 'neutral' | 'info' | 'secondary';
}

export const Badge = ({ className, variant = 'neutral', ...props }: BadgeProps) => {
    const variants = {
        success: "bg-green-50 text-green-700 border border-green-100",
        warning: "bg-amber-50 text-amber-700 border border-amber-100",
        error: "bg-red-50 text-red-700 border border-red-100",
        neutral: "bg-gray-50 text-gray-600 border border-gray-100",
        info: "bg-blue-50 text-blue-700 border border-blue-100",
        secondary: "bg-slate-100 text-slate-700 border border-slate-200"
    };

    return (
        <span
            className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                variants[variant],
                className
            )}
            {...props}
        />
    );
};
