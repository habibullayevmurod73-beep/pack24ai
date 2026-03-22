"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { translations, Language, materialTranslations } from '../translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    tm: (key: string) => string; // Translate material
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguage] = useState<Language>('uz');

    const t = (key: string): string => {
        return translations[language][key] || key;
    };

    const tm = (key: string): string => {
        return materialTranslations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, tm }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
