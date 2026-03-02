import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import type { AppData } from '../types';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface StrategyExpertChatboxProps {
    data: AppData;
}

const SUGGESTED_PROMPTS = [
    'Which supplier has the best overall price?',
    'What are the top 3 quick wins?',
    'Compare DDP vs DAP opportunities',
    'What is our negotiation leverage?',
];

export default function StrategyExpertChatbox({ data }: StrategyExpertChatboxProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMessages([]);
    }, [data]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const buildSystemPrompt = () => {
        const suppliers = Array.from(new Set(data.rawBids.map(b => b['Bidder Name']).filter(Boolean)));
        const sampleBids = data.rawBids.slice(0, 30).map(b => ({
            supplier: b['Bidder Name'],
            lot: b['Lot ID'] || b['Article Description'],
            ddpPrice: b['DDP Price (per 1000 Units)'],
            historicPrice: b['Historic Price'],
            incoterms: b['Incoterms'],
            volume: b['Indicative 2027 Demand Volume x 1000 Units'],
            country: b['Country'],
            incumbent: b['Incumbent - Status'],
        }));

        return `You are a world-class strategic sourcing expert helping a procurement team analyse supplier bids.

Here is the sourcing data context:
- Suppliers in the bid: ${suppliers.join(', ')}
- Total bid rows: ${data.rawBids.length}
- Sample bid data: ${JSON.stringify(sampleBids, null, 2)}

Answer questions concisely and with expert-level insight. Focus on actionable recommendations, savings opportunities, and negotiation tactics. Be direct and specific.`;
    };

    const sendMessage = async (text: string) => {
        if (!text.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', content: text };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 1000,
                    system: buildSystemPrompt(),
                    messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
                }),
            });

            if (response.ok) {
                const result = await response.json();
                const reply = result.content?.map((c: any) => c.text || '').join('') || 'No response received.';
                setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: 'Sorry, I could not connect to the AI service. Please check your API configuration.'
                }]);
            }
        } catch {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, the AI service is currently unavailable. Please try again later.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#00C4FF] hover:bg-[#00a8d9] text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                    <MessageCircle size={22} />
                    <span className="font-semibold text-sm">Strategy Expert</span>
                </button>
            )}

            {/* Chat Panel */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-50 w-[400px] h-[520px] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in slide-in-from-bottom-4 duration-300">
                    {/* Header */}
                    <div className="bg-[#00C4FF] px-4 py-3 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="bg-white/20 p-1.5 rounded-lg">
                                <Sparkles size={18} className="text-white" />
                            </div>
                            <div>
                                <p className="font-bold text-white text-sm">Strategy Expert</p>
                                <p className="text-white/80 text-xs">Powered by Claude AI</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/80 hover:text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto bg-white p-4 space-y-3">
                        {messages.length === 0 && (
                            <div>
                                <p className="text-sm text-slate-500 text-center mb-4">Ask me anything about your sourcing data</p>
                                <div className="space-y-2">
                                    {SUGGESTED_PROMPTS.map((prompt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => sendMessage(prompt)}
                                            className="w-full text-left text-xs px-3 py-2 rounded-lg bg-[#FF32A0]/10 text-[#FF32A0] hover:bg-[#FF32A0]/20 border border-[#FF32A0]/20 transition-colors font-medium"
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                                        msg.role === 'user'
                                            ? 'bg-[#00C4FF] text-white rounded-br-sm'
                                            : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                                    }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-100 px-4 py-3 rounded-xl rounded-bl-sm">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="bg-white border-t border-slate-200 p-3 flex gap-2 flex-shrink-0">
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                            placeholder="Ask about your sourcing data..."
                            className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00C4FF]/30 focus:border-[#00C4FF]"
                        />
                        <button
                            onClick={() => sendMessage(input)}
                            disabled={isLoading || !input.trim()}
                            className="bg-[#00C4FF] hover:bg-[#00a8d9] disabled:opacity-40 text-white p-2 rounded-lg transition-colors"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
