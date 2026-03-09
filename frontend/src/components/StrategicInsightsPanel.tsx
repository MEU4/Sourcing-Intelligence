import { useState, useEffect } from 'react';
import { Sparkles, Zap, TrendingUp, MessageSquare, BarChart2, Compass, AlertTriangle, RefreshCw } from 'lucide-react';
import type { AppData } from '../types';

interface StrategicInsightsPanelProps {
    data: AppData;
}

interface InsightSection {
    title: string;
    icon: React.ReactNode;
    borderColor: string;
    bgColor: string;
    iconBg: string;
    iconColor: string;
    content: string[];
}

interface GeminiInsights {
    quick_wins: string[];
    savings_opportunities: string[];
    negotiation_strategies: string[];
    category_insight: string;
    strategic_approach: string;
    risk_assessment: string[];
}

export default function StrategicInsightsPanel({ data }: StrategicInsightsPanelProps) {
    const [insights, setInsights] = useState<GeminiInsights | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateInsights = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Build a compact summary of the data to send to the API
            const suppliers = Array.from(new Set(data.rawBids.map(b => b['Bidder Name']).filter(Boolean)));
            const lots = Array.from(new Set(data.rawBids.map(b => b['Lot ID'] || b['Article Description']).filter(Boolean)));

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

            const prompt = `You are a world-class strategic sourcing expert. Analyse this supplier bid data and provide structured insights.

Data summary:
- Suppliers: ${suppliers.join(', ')}
- Lots/Materials: ${lots.slice(0, 20).join(', ')}
- Sample bids: ${JSON.stringify(sampleBids, null, 2)}

Respond ONLY with a valid JSON object (no markdown, no backticks) with this exact structure:
{
  "quick_wins": ["insight 1", "insight 2", "insight 3"],
  "savings_opportunities": ["opportunity 1", "opportunity 2", "opportunity 3"],
  "negotiation_strategies": ["strategy 1", "strategy 2", "strategy 3"],
  "category_insight": "A single paragraph about the overall category market dynamics and supplier landscape.",
  "strategic_approach": "A single paragraph recommending the overall sourcing strategy.",
  "risk_assessment": ["risk 1", "risk 2", "risk 3"]
}`;

           const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        rawBids: data.rawBids,
        roundLotBids: data.roundLotBids,
    }),
});

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const result = await response.json();
            const text = result.content?.map((c: any) => c.text || '').join('') || '';

            // Clean and parse JSON
            const cleaned = text.replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(cleaned);
            setInsights(parsed);
        } catch (err: any) {
            console.error('AI analysis error:', err);
            setError('Failed to generate AI analysis. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-generate on mount
    useEffect(() => {
        generateInsights();
    }, [data]);

    const sections: InsightSection[] = [
        {
            title: 'Quick Wins',
            icon: <Zap size={20} />,
            borderColor: 'border-l-[#46D000]',
            bgColor: 'bg-green-50/60',
            iconBg: 'bg-green-100',
            iconColor: 'text-green-700',
            content: insights?.quick_wins || ['Analysing your data for quick wins...'],
        },
        {
            title: 'Savings Opportunities',
            icon: <TrendingUp size={20} />,
            borderColor: 'border-l-[#00C4FF]',
            bgColor: 'bg-sky-50/60',
            iconBg: 'bg-sky-100',
            iconColor: 'text-sky-700',
            content: insights?.savings_opportunities || ['Identifying ranked savings opportunities...'],
        },
        {
            title: 'Negotiation Strategies',
            icon: <MessageSquare size={20} />,
            borderColor: 'border-l-[#F13A3C]',
            bgColor: 'bg-red-50/60',
            iconBg: 'bg-red-100',
            iconColor: 'text-red-700',
            content: insights?.negotiation_strategies || ['Generating supplier-specific negotiation tactics...'],
        },
        {
            title: 'Strategic Category Insight',
            icon: <BarChart2 size={20} />,
            borderColor: 'border-l-[#9600FF]',
            bgColor: 'bg-purple-50/60',
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-700',
            content: insights?.category_insight ? [insights.category_insight] : ['Analysing market and supplier landscape...'],
        },
        {
            title: 'Strategic Approach',
            icon: <Compass size={20} />,
            borderColor: 'border-l-[#FF32A0]',
            bgColor: 'bg-pink-50/60',
            iconBg: 'bg-pink-100',
            iconColor: 'text-pink-700',
            content: insights?.strategic_approach ? [insights.strategic_approach] : ['Generating recommended sourcing strategy...'],
        },
        {
            title: 'Risk Assessment',
            icon: <AlertTriangle size={20} />,
            borderColor: 'border-l-[#FFB200]',
            bgColor: 'bg-amber-50/60',
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-700',
            content: insights?.risk_assessment || ['Evaluating risk ratings per recommendation...'],
        },
    ];

    return (
        <div className="glass-card p-8 mb-8 border-t-4 border-t-[#00C4FF]">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="bg-[#00C4FF] text-white p-2.5 rounded-xl shadow-md">
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Strategic Sourcing Intelligence Report</h3>
                        <p className="text-sm text-slate-500">AI-generated analysis powered by Claude</p>
                    </div>
                </div>
                <button
                    onClick={generateInsights}
                    disabled={isLoading}
                    className="flex items-center gap-2 text-sm font-medium bg-[#00C4FF]/10 text-[#00C4FF] hover:bg-[#00C4FF]/20 disabled:opacity-50 px-4 py-2 rounded-lg transition-colors"
                >
                    <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                    {isLoading ? 'Analysing...' : 'Regenerate'}
                </button>
            </div>

            {isLoading && (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-12 h-12 border-4 border-[#00C4FF]/30 border-t-[#00C4FF] rounded-full animate-spin mb-4" />
                    <p className="text-slate-500 text-sm">Claude AI is analysing your sourcing data...</p>
                </div>
            )}

            {error && !isLoading && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm text-center mb-6">
                    {error}
                </div>
            )}

            {!isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sections.map((section, idx) => (
                        <div
                            key={idx}
                            className={`rounded-xl border-l-4 ${section.borderColor} ${section.bgColor} p-5 shadow-sm hover:shadow-md transition-all`}
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <div className={`p-1.5 rounded-lg ${section.iconBg} ${section.iconColor}`}>
                                    {section.icon}
                                </div>
                                <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide">{section.title}</h4>
                            </div>
                            <ul className="space-y-2">
                                {section.content.map((item, i) => (
                                    <li key={i} className="text-sm text-slate-700 leading-relaxed flex items-start gap-2">
                                        <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-slate-400" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
