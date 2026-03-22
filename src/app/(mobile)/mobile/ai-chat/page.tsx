'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Bot, User } from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export default function AIChatPage() {
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Assalomu alaykum! Men Pack24 AI yordamchisiman. Sizga qadoqlash, narxlar yoki buyurtmalar bo\'yicha qanday yordam bera olaman?'
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))
                })
            });

            if (!res.ok) throw new Error('Network error');

            const data = await res.json();
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.content
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error(error);
            // Optionally add an error message to the chat
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#F9FAFB]">
            {/* Header */}
            <div className="bg-white p-4 flex items-center gap-3 shadow-sm sticky top-0 z-10 border-b border-gray-100">
                <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-full" aria-label="Orqaga">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-gray-900">Pack24 AI</h1>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-xs text-green-600 font-medium">Online</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-gray-200' : 'bg-blue-100'
                            }`}>
                            {msg.role === 'user' ? (
                                <User className="w-5 h-5 text-gray-500" />
                            ) : (
                                <Bot className="w-5 h-5 text-blue-600" />
                            )}
                        </div>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-tr-none'
                                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                            }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <Bot className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white p-4 border-t border-gray-100 sticky bottom-0 pb-safe-area-inset-bottom">
                <div className="flex gap-2 bg-gray-50 p-1.5 rounded-full border border-gray-200 focus-within:ring-2 ring-blue-500/20 transition-all">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Savolingizni yozing..."
                        className="flex-1 bg-transparent px-4 py-2 text-sm focus:outline-none placeholder:text-gray-400"
                        disabled={loading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || loading}
                        className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
                        aria-label="Yuborish"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// Add CSS utility for safe area if not present (optional, usually handled by viewport meta)
