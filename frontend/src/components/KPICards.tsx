import { useMemo } from 'react';
import { TrendingDown, Euro, PiggyBank, Target } from 'lucide-react';
import type { AppData } from '../types';
import { calculateKPIMetrics, formatCurrency, formatPercent } from '../utils/calculations';

interface KPICardsProps {
    data: AppData;
}

export default function KPICards({ data }: KPICardsProps) {
    const metrics = useMemo(() => calculateKPIMetrics(data), [data]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            {/* Current Spend */}
            <div className="glass-card p-6 flex items-start justify-between group hover:shadow-lg transition-all">
                <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Total Current Spend</p>
                    <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(metrics.currentSpend)}</h3>
                </div>
                <div className="p-3 bg-slate-100 text-slate-500 rounded-xl group-hover:scale-110 group-hover:bg-slate-200 transition-all">
                    <Euro size={24} />
                </div>
            </div>

            {/* Optimised Spend */}
            <div className="glass-card p-6 flex items-start justify-between group hover:shadow-lg transition-all border-l-4 border-l-primary-500">
                <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Optimised Spend</p>
                    <h3 className="text-2xl font-bold text-primary-700">{formatCurrency(metrics.optimisedSpend)}</h3>
                </div>
                <div className="p-3 bg-primary-50 text-primary-600 rounded-xl group-hover:scale-110 group-hover:bg-primary-100 transition-all">
                    <Target size={24} />
                </div>
            </div>

            {/* Savings Opportunity */}
            <div className="glass-card p-6 flex items-start justify-between group hover:shadow-lg transition-all border-l-4 border-l-success-500">
                <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Savings Opportunity</p>
                    <h3 className="text-2xl font-bold text-success-600">{formatCurrency(metrics.savings)}</h3>
                </div>
                <div className="p-3 bg-success-50 text-success-600 rounded-xl group-hover:scale-110 group-hover:bg-success-100 transition-all">
                    <PiggyBank size={24} />
                </div>
            </div>

            {/* Savings % */}
            <div className="glass-card p-6 flex items-start justify-between group hover:shadow-lg transition-all border-l-4 border-l-success-500">
                <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Savings %</p>
                    <h3 className="text-2xl font-bold text-success-600">{formatPercent(metrics.savingsPercentage)}</h3>
                </div>
                <div className="p-3 bg-success-50 text-success-600 rounded-xl group-hover:scale-110 group-hover:bg-success-100 transition-all">
                    <TrendingDown size={24} />
                </div>
            </div>
        </div>
    );
}
