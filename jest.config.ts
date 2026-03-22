import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
    // next.config.ts va .env fayllar joyi
    dir: './',
});

const config: Config = {
    coverageProvider: 'v8',
    testEnvironment: 'jsdom',

    // har bir test faylidagi setup
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],


    // TypeScript transformatsiyasi
    moduleNameMapper: {
        '@/(.*)': '<rootDir>/src/$1',
    },

    // test fayllarini qidirish
    testMatch: [
        '**/__tests__/**/*.[jt]s?(x)',
        '**/?(*.)+(spec|test).[jt]s?(x)',
    ],

    // coverage
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/app/**/layout.tsx',
        '!src/app/**/page.tsx',
    ],
};

export default createJestConfig(config);
