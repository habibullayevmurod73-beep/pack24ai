// Catch-all — barcha noma'lum URL'lar uchun (main)/not-found.tsx ga yo'naltiradi
import { notFound } from 'next/navigation';

export default function CatchAll() {
    notFound();
}
