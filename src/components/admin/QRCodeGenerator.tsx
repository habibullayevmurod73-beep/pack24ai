import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from '@/lib/utils';

interface QRCodeGeneratorProps {
    value: string;
    size?: number;
    className?: string;
    showLabel?: boolean;
}

export default function QRCodeGenerator({ value, size = 128, className, showLabel = true }: QRCodeGeneratorProps) {
    return (
        <div className={cn("flex flex-col items-center gap-2", className)}>
            <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                <QRCodeSVG value={value} size={size} level="H" />
            </div>
            {showLabel && (
                <div className="text-center">
                    <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Smart ID</p>
                    <p className="text-xs font-bold text-slate-700 font-mono">{value.split('/').pop()?.split('?id=')[1] || value}</p>
                </div>
            )}
        </div>
    );
}
