
'use client';

import { BrainCircuit, Sliders, MessageSquare, Save } from 'lucide-react';

export default function AIControlPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">AI Model Settings</h2>
                <button className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-colors">
                    <Save size={18} />
                    <span>Save Configuration</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Model Card */}
                <div className="bg-white p-6 rounded-2xl border-2 border-emerald-500 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 bg-emerald-50 rounded-bl-2xl">
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Active</span>
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                            <BrainCircuit size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900">Antigravity GPT-4</h3>
                            <p className="text-slate-500 text-sm">Fine-tuned for Sales</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Temperature</span>
                            <span className="font-bold text-slate-900">0.7</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="bg-emerald-500 h-2 rounded-full w-[70%]"></div>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">Optimal for creative but accurate product descriptions.</p>
                    </div>
                </div>

                {/* Prompt Styles */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-indigo-100 transition-colors">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                            <MessageSquare size={24} />
                        </div>
                        <h3 className="font-bold text-lg text-slate-900">Response Style</h3>
                    </div>
                    <div className="space-y-3">
                        {['Professional Consultant', 'Friendly Assistant', 'Technical Expert'].map((style, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer">
                                <div className={`w-4 h-4 rounded-full border-2 ${i === 0 ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'}`}></div>
                                <span className="font-medium text-slate-700">{style}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Usage Limits */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-orange-100 transition-colors">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                            <Sliders size={24} />
                        </div>
                        <h3 className="font-bold text-lg text-slate-900">Usage Limits</h3>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-500">Daily Tokens</span>
                                <span className="font-bold text-slate-900">45%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="bg-orange-400 h-2 rounded-full w-[45%]"></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-500">Concurrent Chats</span>
                                <span className="font-bold text-slate-900">12/50</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="bg-blue-400 h-2 rounded-full w-[24%]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Console */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white font-mono text-sm leading-relaxed overflow-hidden">
                <div className="flex items-center gap-2 mb-4 text-slate-400 border-b border-slate-700 pb-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    <span className="ml-2">System Logs</span>
                </div>
                <p className="opacity-70">[10:42:12] Generating response for Session #8832...</p>
                <p className="text-emerald-400">[10:42:14] Response generated successfully (240ms)</p>
                <p className="opacity-70">[10:43:05] User updated box dimensions: 20x30x10</p>
                <p className="text-blue-400">[10:43:06] Recalculating price estimate...</p>
                <div className="mt-2 animate-pulse">_</div>
            </div>
        </div>
    );
}
