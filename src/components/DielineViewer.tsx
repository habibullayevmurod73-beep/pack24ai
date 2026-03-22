"use client";

import React from 'react';

interface Props {
  l: number;
  w: number;
  h: number;
}

export const DielineViewer: React.FC<Props> = ({ l, w, h }) => {
  const s = 0.5; // Vizual masshtab (SVG sig'ishi uchun)
  const flap = w / 2; // Quloq balandligi
  const glueFlap = 35; // Yopishtirish tili (35mm)

  // Jami o'lchamlar
  const totalWidth = (l * 2 + w * 2 + glueFlap) * s;
  const totalHeight = (h + flap * 2) * s;

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 overflow-auto">
      <h3 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-widest">2D Chizma (Dieline)</h3>
      <div className="flex justify-center">
        <svg 
          width={totalWidth + 40} 
          height={totalHeight + 40} 
          viewBox={`-20 -20 ${totalWidth + 40} ${totalHeight + 40}`}
          fill="none" 
          stroke="currentColor"
        >
          {/* Panellar guruhi */}
          <g className="text-blue-600" strokeWidth="1.5">
            {/* L1 Panel */}
            <rect x={0} y={flap * s} width={l * s} height={h * s} />
            <rect x={0} y={0} width={l * s} height={flap * s} strokeDasharray="4" />
            <rect x={0} y={(flap + h) * s} width={l * s} height={flap * s} strokeDasharray="4" />
            
            {/* W1 Panel */}
            <rect x={l * s} y={flap * s} width={w * s} height={h * s} />
            <rect x={l * s} y={0} width={w * s} height={flap * s} strokeDasharray="4" />
            <rect x={l * s} y={(flap + h) * s} width={w * s} height={flap * s} strokeDasharray="4" />

            {/* L2 Panel */}
            <rect x={(l + w) * s} y={flap * s} width={l * s} height={h * s} />
            <rect x={(l + w) * s} y={0} width={l * s} height={flap * s} strokeDasharray="4" />
            <rect x={(l + w) * s} y={(flap + h) * s} width={l * s} height={flap * s} strokeDasharray="4" />

            {/* W2 Panel */}
            <rect x={(l * 2 + w) * s} y={flap * s} width={w * s} height={h * s} />
            <rect x={(l * 2 + w) * s} y={0} width={w * s} height={flap * s} strokeDasharray="4" />
            <rect x={(l * 2 + w) * s} y={(flap + h) * s} width={w * s} height={flap * s} strokeDasharray="4" />

            {/* Yopishtirish tili (Glue flap) */}
            <path 
                d={`M ${(l*2+w*2)*s} ${(flap + 10)*s} 
                   L ${(l*2+w*2+glueFlap)*s} ${(flap + 15)*s} 
                   L ${(l*2+w*2+glueFlap)*s} ${(flap + h - 15)*s} 
                   L ${(l*2+w*2)*s} ${(flap + h - 10)*s}`} 
                stroke="currentColor" 
            />
          </g>

          {/* O'lcham matnlari */}
          <g fill="#94a3b8" fontSize="10" fontWeight="bold" stroke="none" textAnchor="middle">
            <text x={(l/2)*s} y={(flap + h/2)*s}>L1: {l}</text>
            <text x={(l + w/2)*s} y={(flap + h/2)*s}>W1: {w}</text>
            <text x={(l*1.5 + w)*s} y={(flap + h/2)*s}>L2: {l}</text>
            <text x={(l*2 + w*1.5)*s} y={(flap + h/2)*s}>W2: {w}</text>
          </g>
        </svg>
      </div>
    </div>
  );
};