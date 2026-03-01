import { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LabelList
} from 'recharts';
import type { AppData } from '../types';

interface SupplierSpendChartProps {
    data: AppData;
}

export default function SupplierSpendChart({ data }: SupplierSpendChartProps) {
    const chartData = useMemo(() => {
        if (!data.rawBids) return [];

        const suppliers = Array.from(new Set(data.rawBids.map(b => b['Bidder Name']).filter(Boolean))) as string[];

        return suppliers.map(supplier => {
            const supplierBids = data.rawBids.filter(b => b['Bidder Name'] === supplier);

            const historicSpend = supplierBids.reduce((acc, b) => {
                const price = typeof b['Historic Price'] === 'number' ? b['Historic Price'] : 0;
                const volume = b['Indicative 2027 Demand Volume x 1000 Units'] || 0;
                return acc + price * volume;
            }, 0);

            const projectedSpend = supplierBids.reduce((acc, b) => {
                const price = b['DDP Price (per 1000 Units)'] || 0;
                const volume = b['Indicative 2027 Demand Volume x 1000 Units'] || 0;
                return acc + price * volume;
            }, 0);

            return {
                supplier: supplier.substring(0, 12),
                'Historic Spend': Math.round(historicSpend),
                '2027 Projected': Math.round(projectedSpend),
            };
        }).filter(d => d['Historic Spend'] > 0 || d['2027 Projected'] > 0);
    }, [data]);

    const formatValue = (value: number) => {
        if (value >= 1000000) return `€${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `€${(value / 1000).toFixed(0)}k`;
        return `€${value}`;
    };

    if (!chartData.length) return null;

    return (
        <div className="h-[400px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 30, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                        dataKey="supplier"
                        tick={{ fill: '#64748b', fontSize: 13 }}
                        axisLine={{ stroke: '#cbd5e1' }}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={formatValue}
                    />
                    <Tooltip
                        cursor={{ fill: '#f1f5f9' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        formatter={(value: any) => [formatValue(value), undefined]}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="Historic Spend" fill="#9600FF" radius={[4, 4, 0, 0]} maxBarSize={50}>
                        <LabelList dataKey="Historic Spend" position="top" formatter={formatValue} style={{ fontSize: 11, fill: '#64748b' }} />
                    </Bar>
                    <Bar dataKey="2027 Projected" fill="#00C4FF" radius={[4, 4, 0, 0]} maxBarSize={50}>
                        <LabelList dataKey="2027 Projected" position="top" formatter={formatValue} style={{ fontSize: 11, fill: '#64748b' }} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
