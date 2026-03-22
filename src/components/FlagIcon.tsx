import React from 'react';
import { Language } from '../lib/translations';

export const FlagIcon = ({ lang }: { lang: Language }) => {
    const className = "w-6 h-4 rounded shadow-sm object-cover border border-gray-100";
    switch (lang) {
        case 'uz':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 125" className={className}>
                    <rect width="250" height="125" fill="#1eb53a" />
                    <rect width="250" height="83.3" fill="#0099b5" />
                    <rect y="41.6" width="250" height="41.6" fill="#ce1126" />
                    <rect y="42.6" width="250" height="39.6" fill="#fff" />
                    <circle cx="45" cy="25" r="10" fill="#fff" />
                    <circle cx="53" cy="25" r="9" fill="#0099b5" />
                </svg>
            );
        case 'ru':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" className={className}>
                    <rect width="900" height="600" fill="#fff" />
                    <rect y="200" width="900" height="400" fill="#0039a6" />
                    <rect y="400" width="900" height="200" fill="#d52b1e" />
                </svg>
            );
        case 'en': // UK Flag for English
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" className={className}>
                    <clipPath id="t"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" /></clipPath>
                    <path d="M0,0 v30 h60 v-30 z" fill="#00247d" />
                    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
                    <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#cf142b" strokeWidth="4" />
                    <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
                    <path d="M30,0 v30 M0,15 h60" stroke="#cf142b" strokeWidth="6" />
                </svg>
            );
        case 'qr': // Karakalpakstan
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 125" className={className}>
                    <rect width="250" height="125" fill="#1eb53a" />
                    <rect width="250" height="83.3" fill="#0099b5" />
                    <rect y="41.6" width="250" height="41.6" fill="#fabc02" />
                    <rect y="42.6" width="250" height="39.6" fill="#fabc02" />
                    <rect y="41.6" width="250" height="2" fill="#ce1126" />
                    <rect y="81.2" width="250" height="2" fill="#ce1126" />
                    <circle cx="45" cy="25" r="10" fill="#fff" />
                    <circle cx="53" cy="25" r="9" fill="#0099b5" />
                </svg>
            );
        case 'zh':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" className={className}>
                    <rect width="900" height="600" fill="#de2910" />
                    <path d="M125.8,111l20,49.2l49.2,20L145.8,200l20.1,51.5l-49.2-20L65.2,251.6l20.1-51.5l-51.5-20l51.5-20L65.2,111H125.8z" fill="#ffde00" />
                </svg>
            );
        case 'tr':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" className={className}>
                    <rect width="1200" height="800" fill="#e30a17" />
                    <circle cx="444" cy="400" r="200" fill="#fff" />
                    <circle cx="470" cy="400" r="160" fill="#e30a17" />
                    <polygon points="575,400 655,425 615,502 615,297 655,374" fill="#fff" transform="rotate(270 565 400)" />
                    <path d="M720 400 l 50 -15 l -30 -40 l 50 15 l 50 -15 l -30 40 l 30 40 l -50 -15 l -50 15 Z" fill="#fff" />
                </svg>
            );
        default:
            return <div className={className + " bg-gray-200"} />;
    }
};
