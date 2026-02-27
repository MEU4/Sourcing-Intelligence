import { useMemo } from 'react';
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    ZAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import type { AppData } from '../types';

interface MOQLeadTimeChartProps {
    data: AppData;
}

export default function MOQLeadTimeChart({ data }: MOQLeadTimeChartProps) {
    const { filteredData, suppliers } = useMemo(() => {
        if (!data.rawBids) return { filteredData: [], suppliers: [] };

        // Using DDP Price vs MOQ, bubble size is volume, grouped by supplier
        const validData = data.rawBids.filter(b =>
            typeof b['DDP Price (per 1000 Units)'] === 'number' &&
            typeof b['MOQ x 1000 Units'] === 'number' &&
            b['DDP Price (per 1000 Units)'] > 0
        ).map(b => ({
            ...b,
            lotDesc: b['Article Description']?.substring(0, 15),
            supplier: b['Bidder Name'] || 'Unknown'
        }));

        const uniqueSuppliers = Array.from(new Set(validData.map(d => d.supplier)));

        return { filteredData: validData, suppliers: uniqueSuppliers };
    }, [data]);

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

    if (!filteredData.length) return <div className="flex h-full items-center justify-center text-slate-400">No MOQ data available</div>;

    return (
        <div className="h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                        type="number"
                        dataKey="MOQ x 1000 Units"
                        name="MOQ"
                        axisLine={{ stroke: '#cbd5e1' }}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        tickLine={false}
                    >
                        <text x={200} y={30} fill="#64748b" fontSize={12} textAnchor="middle">MOQ (k Units)</text>
                    </XAxis>
                    <YAxis
                        type="number"
                        dataKey="DDP Price (per 1000 Units)"
                        name="Price"
                        axisLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        tickLine={false}
                        tickFormatter={(value) => `€${value}`}
                    />
                    <ZAxis
                        type="number"
                        dataKey="Indicative 2027 Demand Volume x 1000 Units"
                        name="Volume"
                        range={[50, 400]}
                    />
                    <Tooltip
                        cursor={{ strokeDasharray: '3 3' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        formatter={(value: any, name: any) => {
                            if (name === "Price") return [`€${value}`, name];
                            return [value, name];
                        }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />

                    {suppliers.map((supplier, idx) => (
                        <Scatter
                            key={supplier}
                            name={supplier}
                            data={filteredData.filter(d => d.supplier === supplier)}
                            fill={colors[idx % colors.length]}
                            opacity={0.8}
                        />
                    ))}
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
}

