import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();
        const lastUserMessage = messages[messages.length - 1];

        // --- MOCK LOGIC START ---
        // In a real app, you would use openai.chat.completions.create here.
        // const completion = await openai.chat.completions.create({ ... })

        let aiResponse = "Kechirasiz, men hozircha to'liq ishga tushmadim.";

        if (lastUserMessage.content.toLowerCase().includes('salom')) {
            aiResponse = "Assalomu alaykum! Men Pack24 AI yordamchisiman. Sizga qanday yordam bera olaman?";
        } else if (lastUserMessage.content.toLowerCase().includes('narx')) {
            aiResponse = "Mahsulotlar narxi turlicha. Iltimos, aniqroq mahsulot nomini ayting yoki katalogni ko'ring.";
        } else {
            aiResponse = "Tushunarli. Savolingiz bo'yicha operator bilan bog'lanishni tavsiya qilaman. Profil sahifasida 'Operator' tugmasini bosing.";
        }

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        return NextResponse.json({
            role: 'assistant',
            content: aiResponse
        });
        // --- MOCK LOGIC END ---

    } catch (error) {
        console.error('AI Chat Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
