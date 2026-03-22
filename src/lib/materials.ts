import { Material } from './types';

export const materials: Material[] = [
    {
        id: 'e-flute',
        name: 'E-Flute (3 qavatli - 1.5mm)',
        thickness: 1.5,
        color: '#d2b48c',
        pricePerSqMeter: 7000
    },
    {
        id: 'b-flute',
        name: 'B-Flute (3 qavatli - 3mm)',
        thickness: 3.0,
        color: '#c19a6b',
        pricePerSqMeter: 7000
    },
    {
        id: 'eb-flute',
        name: 'EB-Flute (5 qavatli - 4.5mm)',
        thickness: 4.5,
        color: '#a08050',
        pricePerSqMeter: 11000
    },
];

export const defaultMaterial = materials[0];
