import { Sparkles, Zap, TrendingUp, MessageSquare, BarChart2, Compass, AlertTriangle } from 'lucide-react';
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

export default function StrategicInsightsPanel({ data }: StrategicInsightsPanelProps) {
    const gemini = data?.geminiData;

    // Build sections from Gemini data or show placeholders
    const sections: InsightSection[] = [
        {
            title: 'Quick Wins',
            icon: <Zap size={20} />,
            borderColor: 'border-l-[#46D000]',
            bgColor: 'bg-green-50/60',
            iconBg: 'bg-green-100',
            iconColor: 'text-green-700',
            content: gemini?.quick_wins || gemini?.strategic_insights?.slice(0, 2) || ['Upload a file and run AI analysis to see quick wins.'],
        },
        {
            title: 'Savings Opportunities',
            icon: <TrendingUp size={20} />,
            borderColor: 'border-l-[#00C4FF]',
            bgColor: 'bg-sky-50/60',
            iconBg: 'bg-sky-100',
            iconColor: 'text-sky-700',
            content: gemini?.savings_opportunities || gemini?.strategic_insights?.slice(2, 4) || ['AI will identify ranked savings opportunities here.'],
        },
        {
            title: 'Negotiation Strategies',
            icon: <MessageSquare size={20} />,
            borderColor: 'border-l-[#F13A3C]',
            bgColor: 'bg-red-50/60',
            iconBg: 'bg-red-100',
            iconColor: 'text-red-700',
            content: gemini?.negotiation_strategies || gemini?.strategic_insights?.slice(4, 6) || ['Supplier-specific negotiation tactics will appear here.'],
        },
        {
            title: 'Strategic Category Insight',
            icon: <BarChart2 size={20} />,
            borderColor: 'border-l-[#9600FF]',
            bgColor: 'bg-purple-50/60',
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-700',
            content: gemini?.category_insight ? [gemini.category_insight] : gemini?.strategic_insights?.slice(6, 8) || ['Market and supplier landscape analysis will appear here.'],
        },
        {
            title: 'Strategic Approach',
            icon: <Compass size={20} />,
            borderColor: 'border-l-[#FF32A0]',
            bgColor: 'bg-pink-50/60',
            iconBg: 'bg-pink-100',
            iconColor: 'text-pink-700',
            content: gemini?.strategic_approach ? [gemini.strategic_approach] : gemini?.strategic_insights?.slice(8, 10) || ['Recommended sourcing strategy will be generated here.'],
        },
        {
            title: 'Risk Assessment',
            icon: <AlertTriangle size={20} />,
            borderColor: 'border-l-[#FFB200]',
            bgColor: 'bg-amber-50/60',
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-700',
            content: gemini?.risk_assessment || gemini?.strategic_insights?.slice(10) || ['Risk ratings per recommendation will appear here.'],
        },
    ];

    return (
        <div className="glass-card p-8 mb-8 border-t-4 border-t-[#00C4FF]">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-[#00C4FF] text-white p-2.5 rounded-xl shadow-md">
                    <Sparkles size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-900">Strategic Sourcing Intelligence Report</h3>
                    <p className="text-sm text-slate-500">AI-generated analysis powered by Gemini</p>
                </div>
            </div>

            {/* 6 sections in 2-column grid */}
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
        </div>
    );
}
