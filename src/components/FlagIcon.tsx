import React from 'react';
import { Language } from '../lib/translations';

export const FlagIcon = ({ lang }: { lang: Language }) => {
    const cn = "w-6 h-4 rounded shadow-sm object-cover border border-gray-100 inline-block";
    switch (lang) {
        // ── O'zbekiston ──────────────────────────────────────────────────────
        case 'uz':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 125" className={cn}>
                    <rect width="250" height="125" fill="#1eb53a" />
                    <rect width="250" height="83.3" fill="#0099b5" />
                    <rect y="41.6" width="250" height="41.6" fill="#ce1126" />
                    <rect y="42.6" width="250" height="39.6" fill="#fff" />
                    <circle cx="45" cy="25" r="10" fill="#fff" />
                    <circle cx="53" cy="25" r="9" fill="#0099b5" />
                </svg>
            );
        // ── Rossiya ──────────────────────────────────────────────────────────
        case 'ru':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" className={cn}>
                    <rect width="900" height="200" fill="#fff" />
                    <rect y="200" width="900" height="200" fill="#0039a6" />
                    <rect y="400" width="900" height="200" fill="#d52b1e" />
                </svg>
            );
        // ── Buyuk Britaniya (English) ─────────────────────────────────────────
        case 'en':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" className={cn}>
                    <clipPath id="t"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" /></clipPath>
                    <path d="M0,0 v30 h60 v-30 z" fill="#00247d" />
                    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
                    <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#cf142b" strokeWidth="4" />
                    <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
                    <path d="M30,0 v30 M0,15 h60" stroke="#cf142b" strokeWidth="6" />
                </svg>
            );
        // ── Qoraqalpog'iston ──────────────────────────────────────────────────
        case 'qr':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 125" className={cn}>
                    <rect width="250" height="125" fill="#0099b5" />
                    <rect y="40" width="250" height="45" fill="#fff" />
                    <rect y="85" width="250" height="40" fill="#1eb53a" />
                    <rect y="39" width="250" height="2" fill="#ce1126" />
                    <rect y="84" width="250" height="2" fill="#ce1126" />
                    <circle cx="45" cy="20" r="10" fill="#fff" />
                    <circle cx="53" cy="20" r="9" fill="#0099b5" />
                </svg>
            );
        // ── Xitoy ────────────────────────────────────────────────────────────
        case 'zh':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" className={cn}>
                    <rect width="900" height="600" fill="#de2910" />
                    <polygon points="75,30 90,75 130,75 100,100 112,145 75,120 38,145 50,100 20,75 60,75"
                        fill="#ffde00" />
                    <polygon points="150,10 158,35 184,35 163,50 171,75 150,60 129,75 137,50 116,35 142,35"
                        fill="#ffde00" transform="scale(0.4) translate(750,50)" />
                </svg>
            );
        // ── Turkiya ───────────────────────────────────────────────────────────
        case 'tr':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" className={cn}>
                    <rect width="1200" height="800" fill="#e30a17" />
                    <circle cx="425" cy="400" r="200" fill="#fff" />
                    <circle cx="475" cy="400" r="160" fill="#e30a17" />
                    <polygon points="583,400 643,382 643,418" fill="#fff"
                        transform="rotate(-18,583,400) translate(20,0)" />
                    <polygon points="623,400 763,355 763,445" fill="#fff" />
                </svg>
            );
        // ── Tojikiston ────────────────────────────────────────────────────────
        case 'tg':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" className={cn}>
                    <rect width="900" height="200" fill="#cc0000" />
                    <rect y="200" width="900" height="200" fill="#fff" />
                    <rect y="400" width="900" height="200" fill="#006600" />
                    {/* Korona */}
                    <polygon points="450,140 440,200 460,200" fill="#f8c300" transform="translate(0,-50)" />
                    <rect x="430" y="155" width="40" height="8" fill="#f8c300" />
                </svg>
            );
        // ── Qozog'iston ───────────────────────────────────────────────────────
        case 'kk':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" className={cn}>
                    <rect width="900" height="600" fill="#00AFCA" />
                    <circle cx="450" cy="300" r="80" fill="#F5C518" />
                    <circle cx="450" cy="300" r="65" fill="#00AFCA" />
                    {/* Quyosh nuri */}
                    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => (
                        <line key={i}
                            x1={450 + 70 * Math.cos(deg * Math.PI / 180)}
                            y1={300 + 70 * Math.sin(deg * Math.PI / 180)}
                            x2={450 + 90 * Math.cos(deg * Math.PI / 180)}
                            y2={300 + 90 * Math.sin(deg * Math.PI / 180)}
                            stroke="#F5C518" strokeWidth="6" />
                    ))}
                </svg>
            );
        // ── Turkmaniston ──────────────────────────────────────────────────────
        case 'tk':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" className={cn}>
                    <rect width="900" height="600" fill="#1a7a1a" />
                    <rect x="100" y="0" width="140" height="600" fill="#8B1A1A" />
                    {/* Gul naqshlari */}
                    {[60, 160, 260, 360, 460, 560].map((y, i) => (
                        <circle key={i} cx="170" cy={y} r="20" fill="#fff" opacity="0.6" />
                    ))}
                    <circle cx="550" cy="300" r="60" fill="#fff" />
                    <circle cx="550" cy="300" r="45" fill="#1a7a1a" />
                </svg>
            );
        // ── Afg'oniston (Dari/Pashto) ─────────────────────────────────────────
        case 'fa':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" className={cn}>
                    <rect width="300" height="600" fill="#000" />
                    <rect x="300" y="0" width="300" height="600" fill="#D32011" />
                    <rect x="600" y="0" width="300" height="600" fill="#009A44" />
                    {/* Markaziy emblem */}
                    <circle cx="450" cy="300" r="70" fill="#fff" opacity="0.9" />
                    <text x="450" y="315" textAnchor="middle" fontSize="40" fill="#D32011">☪</text>
                </svg>
            );
        default:
            return <div className={cn + " bg-gray-200"} />;
    }
};
