"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../lib/contexts/LanguageContext';
import { useAI } from '../lib/hooks/useAI';
import { BoxModel, BoxDimensions, Material } from '../lib/types';

type Message = {
    id: number;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
};

interface AIConsultantProps {
    model?: BoxModel;
    dims?: BoxDimensions;
    totalPrice?: number;
    unitPrice?: number;
    material?: Material;
    quantity?: number;
}

export default function AIConsultant({ model, dims, totalPrice, unitPrice, material, quantity }: AIConsultantProps) {
    const { t, language } = useLanguage();
    const { generateResponse, isTyping } = useAI();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: language === 'uz' ? 'Assalomu alaykum! Men Pack24 AI maslahatchisiman. Sizga qanday yordam bera olaman?' :
                language === 'ru' ? 'Здравствуйте! Я AI-консультант Pack24. Чем могу помочь?' :
                    'Hello! I am Pack24 AI Assistant. How can I help you?',
            sender: 'ai',
            timestamp: new Date()
        }
    ]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen, isTyping]);

    const handleSend = async (textArg?: string) => {
        const textToSend = textArg || input;
        if (!textToSend.trim()) return;

        const userMsg: Message = {
            id: Date.now(),
            text: textToSend,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Generate AI Response using Hook
        const aiResponseText = await generateResponse(userMsg.text, {
            model,
            dims,
            totalPrice,
            unitPrice,
            language,
            material,
            quantity
        });

        const aiMsg: Message = {
            id: Date.now() + 1,
            text: aiResponseText,
            sender: 'ai',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMsg]);
    };

    const suggestions = [
        { label: language === 'uz' ? 'Narx' : language === 'ru' ? 'Цена' : 'Price', text: language === 'uz' ? 'Narxi qancha?' : language === 'ru' ? 'Сколько стоит?' : 'How much?' },
        { label: language === 'uz' ? 'To\'lov' : language === 'ru' ? 'Оплата' : 'Payment', text: language === 'uz' ? 'Qanday to\'lov turlari bor?' : language === 'ru' ? 'Как оплатить?' : 'Payment methods?' },
        { label: language === 'uz' ? 'Pechat' : language === 'ru' ? 'Печать' : 'Printing', text: language === 'uz' ? 'Pechat turlari qanday?' : language === 'ru' ? 'Какая печать?' : 'Printing types?' },
        { label: 'MOQ', text: language === 'uz' ? 'Minimal buyurtma qancha?' : language === 'ru' ? 'Какой минимальный заказ?' : 'What is MOQ?' }
    ];

    return (
        <>
            {/* FLOATING BUTTON */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? "Close AI Chat" : "Open AI Chat"}
                className={`fixed bottom-6 right-6 z-[60] p-4 rounded-full shadow-2xl shadow-blue-500/30 transition-all duration-500 hover:scale-110 active:scale-95 flex items-center justify-center
                    ${isOpen ? 'bg-red-500 rotate-90' : 'bg-gradient-to-r from-blue-600 to-indigo-600 animate-bounce-subtle'}
                `}
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                    </svg>
                )}
            </button>

            {/* CHAT WINDOW */}
            {isOpen && (
                <div className="fixed bottom-24 right-4 md:right-6 w-[90vw] md:w-[400px] h-[600px] max-h-[80vh] rounded-[32px] overflow-hidden z-[60] flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-300 shadow-2xl shadow-blue-900/20 border border-white/40 ring-1 ring-black/5 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-5 flex items-center gap-4 shadow-lg shrink-0">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30 shadow-inner">
                            <span className="text-2xl">🤖</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-xl tracking-tight">Pack24 AI</h3>
                            <div className="flex items-center gap-1.5 opacity-90">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                <p className="text-blue-50 text-xs font-medium">Online Consultant</p>
                            </div>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scroll-smooth">
                        <div className="text-center text-xs text-gray-400 my-2 font-medium">Bugun, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>

                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm transition-all duration-200 hover:shadow-md ${msg.sender === 'user'
                                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white self-end rounded-tr-none'
                                    : 'bg-white/80 backdrop-blur-sm border border-gray-100 text-gray-800 self-start rounded-tl-none'
                                    }`}
                            >
                                {msg.text}
                                <div className={`text-[10px] mt-1 opacity-70 flex justify-end ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="self-start bg-white/80 backdrop-blur-sm border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1.5 items-center h-[52px]">
                                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggestions Chips */}
                    <div className="bg-white/40 backdrop-blur-sm p-3 flex gap-2 overflow-x-auto no-scrollbar shrink-0 border-t border-white/20">
                        {suggestions.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => handleSend(s.text)}
                                className="whitespace-nowrap px-4 py-2 bg-white/60 hover:bg-white border border-blue-100 rounded-full text-xs font-medium text-blue-700 shadow-sm hover:shadow transition-all active:scale-95"
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white/60 backdrop-blur-md border-t border-gray-100/50 flex gap-3 shrink-0 pb-6 md:pb-4">
                        <div className="flex-1 relative group">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder={language === 'uz' ? "Savolingizni yozing..." : "Type your message..."}
                                className="w-full bg-white border border-gray-200 focus:border-blue-500 rounded-2xl pl-5 pr-4 py-3 text-sm outline-none transition-all shadow-sm group-hover:shadow-md focus:shadow-blue-500/10"
                            />
                        </div>
                        <button
                            onClick={() => handleSend()}
                            disabled={!input.trim()}
                            aria-label="Send message"
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-2xl shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center aspect-square"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 translate-x-0.5 -translate-y-0.5">
                                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

