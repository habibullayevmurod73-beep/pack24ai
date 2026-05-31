import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, phone, email, message, vacancyTitle } = body;
        if (!name?.trim() || !phone?.trim()) {
            return NextResponse.json({ error: 'Name and phone required' }, { status: 400 });
        }
        await prisma.botEvent.create({
            data: {
                sourceBot: 'platform',
                eventType: 'vacancy_application',
                severity: 'info',
                title: `Vakansiya: ${vacancyTitle}`,
                message: `Vakansiya ariza: ${vacancyTitle} | ${name} | ${phone} | ${email || '-'} | ${message || '-'}`,
                status: 'new_',
            },
        });
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Vacancy apply error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
