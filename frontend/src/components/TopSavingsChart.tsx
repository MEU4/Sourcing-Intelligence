import { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import type { AppData } from '../types';

interface TopSavingsChartProps {
    data: AppData;
}

export default function TopSavingsChart({ data }: TopSavingsChartProps) {
    const chartData = useMemo(() => {
        if (!data.rawBids) return [];

        const uniqueLots = Array.from(new Set(data.rawBids.map(b => b['Lot ID'] || b['Article Description'])));

        const savingsByLot = uniqueLots.map(lotId => {
            const lotBids = data.rawBids.filter(b => (b['Lot ID'] || b['Article Description']) === lotId);
            const articleDescription = lotBids[0]['Article Description'] || 'Unknown';
            const volumeK = lotBids[0]['Indicative 2027 Demand Volume x 1000 Units'] || 0;

            const incumbentBid = lotBids.find(b => b['Incumbent - Status']?.toLowerCase() === 'incumbent');

            let baselinePrice = 0;
            if (incumbentBid && incumbentBid['DDP Price (per 1000 Units)']) {
                baselinePrice = incumbentBid['DDP Price (per 1000 Units)'];
            } else {
                const bidWithHistoric = lotBids.find(b => typeof b['Historic Price'] === 'number' && b['Historic Price'] > 0);
                if (bidWithHistoric) {
                    baselinePrice = bidWithHistoric['Historic Price']!;
                } else {
                    baselinePrice = lotBids.reduce((acc, b) => acc + (b['DDP Price (per 1000 Units)'] || 0), 0) / lotBids.length;
                }
            }

            const validDdpBids = lotBids.filter(b => typeof b['DDP Price (per 1000 Units)'] === 'number' && b['DDP Price (per 1000 Units)'] > 0);
            let bestPrice = baselinePrice;

            if (validDdpBids.length > 0) {
                bestPrice = Math.min(...validDdpBids.map(b => b['DDP Price (per 1000 Units)']));
            }

            const savingPerUnit = baselinePrice - bestPrice;
            const totalSavingEur = savingPerUnit * volumeK;
            const savingPercentage = baselinePrice > 0 ? (savingPerUnit / baselinePrice) * 100 : 0;

            return {
                name: articleDescription.substring(0, 20) + (articleDescription.length > 20 ? '...' : ''),
                savingEur: Math.max(0, totalSavingEur),
                savingPercentage
            };
        });

        // Sort by largest negative/positive saving, keeping only top 10
        return savingsByLot
            .filter(item => item.savingEur > 0)
            .sort((a, b) => b.savingEur - a.savingEur)
            .slice(0, 10);
    }, [data]);

    if (!chartData.length) return <div className="flex h-full items-center justify-center text-slate-400">No savings data available</div>;

    return (
        <div className="h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    layout="vertical"
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                    <XAxis
                        type="number"
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        axisLine={{ stroke: '#cbd5e1' }}
                        tickLine={false}
                        tickFormatter={(value) => `€${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
                    />
                    <YAxis
                        dataKey="name"
                        type="category"
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={120}
                    />
                    <Tooltip
                        cursor={{ fill: '#f1f5f9' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        formatter={(value: any) => [`€${value.toLocaleString()}`, 'Total Saving']}
                    />
                    <Bar
                        dataKey="savingEur"
                        radius={[0, 4, 4, 0]}
                        maxBarSize={30}
                    >
                        {chartData.map((entry, index) => {
                            // Color map based on percentage saving
                            let color = '#22c55e'; // green (>20%)
                            if (entry.savingPercentage < 10) color = '#ef4444'; // red (<10%)
                            else if (entry.savingPercentage <= 20) color = '#eab308'; // amber (10-20%)

                            return <Cell key={`cell-${index}`} fill={color} />;
                        })}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
