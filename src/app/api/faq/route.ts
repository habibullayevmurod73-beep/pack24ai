import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { name, question } = await req.json();
        if (!name?.trim() || !question?.trim()) {
            return NextResponse.json({ error: 'Name and question required' }, { status: 400 });
        }
        // Save to BotEvent as a support question
        await prisma.botEvent.create({
            data: {
                sourceBot: 'platform',
                eventType: 'faq_question',
                severity: 'info',
                title: `FAQ: ${name}`,
                message: `FAQ savol: ${name} — ${question}`,
                status: 'new_',
            },
        });
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('FAQ submit error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
