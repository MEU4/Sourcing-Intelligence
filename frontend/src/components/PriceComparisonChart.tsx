import { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import type { AppData } from '../types';

interface PriceComparisonChartProps {
    data: AppData;
}

export default function PriceComparisonChart({ data }: PriceComparisonChartProps) {
    const chartData = useMemo(() => {
        // Pivot data to format: { lot: 'Item 1', 'Supplier A': 120, 'Supplier B': 110, Historic: 130 }
        if (!data.rawBids) return [];

        const uniqueLots = Array.from(new Set(data.rawBids.map(b => b['Article Description'] || b['Lot ID'])));

        return uniqueLots.map(lot => {
            const lotBids = data.rawBids.filter(b => (b['Article Description'] || b['Lot ID']) === lot);
            const dataPoint: any = { lot: lot.substring(0, 15) + (lot.length > 15 ? '...' : '') };

            let historicAdded = false;

            lotBids.forEach(bid => {
                const supplierName = bid['Bidder Name'] || 'Unknown';
                dataPoint[supplierName] = bid['DDP Price (per 1000 Units)'] || 0;

                if (!historicAdded && bid['Historic Price'] && typeof bid['Historic Price'] === 'number') {
                    dataPoint['Historic'] = bid['Historic Price'];
                    historicAdded = true;
                }
            });

            return dataPoint;
        });
    }, [data]);

    const suppliers = useMemo(() => {
        if (!data.rawBids) return [];
        return Array.from(new Set(data.rawBids.map(b => b['Bidder Name']).filter(Boolean)));
    }, [data]);

    // Tailwind friendly colors
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

    if (!chartData.length) return null;

    return (
        <div className="h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                        dataKey="lot"
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        axisLine={{ stroke: '#cbd5e1' }}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `€${value}`}
                    />
                    <Tooltip
                        cursor={{ fill: '#f1f5f9' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        formatter={(value: any) => [`€${value}`, undefined]}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />

                    {suppliers.map((supplier, idx) => (
                        <Bar
                            key={supplier}
                            dataKey={supplier as string}
                            fill={colors[idx % colors.length]}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={40}
                        />
                    ))}
                    {/* Add a reference bar or separate bar for Historic if we had to */}
                    {chartData.some(d => d['Historic']) && (
                        <Bar
                            dataKey="Historic"
                            fill="#94a3b8"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={40}
                        />
                    )}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
