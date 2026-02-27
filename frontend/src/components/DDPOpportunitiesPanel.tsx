import { useMemo } from 'react';
import { Truck } from 'lucide-react';
import type { AppData } from '../types';
import { formatCurrency } from '../utils/calculations';

interface DDPOpportunitiesPanelProps {
    data: AppData;
}

export default function DDPOpportunitiesPanel({ data }: DDPOpportunitiesPanelProps) {
    const ddpBids = useMemo(() => {
        if (!data.rawBids) return [];

        // Find bids where Incoterms starts with DDP
        const ddp = data.rawBids.filter(b => b['Incoterms']?.toUpperCase().startsWith('DDP'));

        // Calculate a "saving vs non-ddp" for visual interest
        return ddp.map(bid => {
            const lotId = bid['Lot ID'] || bid['Article Description'];
            const allBidsForLot = data.rawBids.filter(b => (b['Lot ID'] || b['Article Description']) === lotId);
            const nonDdpBids = allBidsForLot.filter(b => !b['Incoterms']?.toUpperCase().startsWith('DDP'));

            let savingVsNonDdp = 0;
            if (nonDdpBids.length > 0) {
                // Average non-DDP price
                const avgNonDdp = nonDdpBids.reduce((acc, b) => acc + (b['DDP Price (per 1000 Units)'] || 0), 0) / nonDdpBids.length;
                savingVsNonDdp = avgNonDdp - (bid['DDP Price (per 1000 Units)'] || 0);
            } else {
                // Try historic
                if (bid['Historic Price'] && typeof bid['Historic Price'] === 'number') {
                    savingVsNonDdp = bid['Historic Price'] - (bid['DDP Price (per 1000 Units)'] || 0);
                }
            }

            return {
                ...bid,
                savingVsNonDdp
            };
        }).sort((a, b) => b.savingVsNonDdp - a.savingVsNonDdp);
    }, [data]);

    if (ddpBids.length === 0) {
        return null;
    }

    return (
        <div className="glass p-6 rounded-2xl border-l-4 border-l-blue-500 mb-8 bg-blue-50/50">
            <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                    <Truck size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800">DDP Opportunities</h3>
                    <p className="text-sm text-slate-600 max-w-3xl">
                        <span className="font-semibold text-blue-700 block mb-1">AI Insight:</span>
                        "DDP (Delivered Duty Paid) bids eliminate intermediate storage and handling costs.
                        Prioritising these suppliers can simplify logistics and reduce hidden supply chain expenses."
                    </p>
                </div>
            </div>

            <div className="overflow-x-auto mt-4 rounded-xl border border-blue-100">
                <table className="min-w-full bg-white text-left text-sm">
                    <thead className="bg-blue-50/80">
                        <tr>
                            <th className="px-4 py-3 font-semibold text-slate-600">Supplier</th>
                            <th className="px-4 py-3 font-semibold text-slate-600">Lot</th>
                            <th className="px-4 py-3 font-semibold text-slate-600">Site</th>
                            <th className="px-4 py-3 font-semibold text-slate-600">DDP Price</th>
                            <th className="px-4 py-3 font-semibold text-slate-600 text-right">Av. Saving vs DAP</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-50">
                        {ddpBids.slice(0, 5).map((bid, idx) => (
                            <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                                <td className="px-4 py-3 font-medium text-slate-800">{bid['Bidder Name']}</td>
                                <td className="px-4 py-3 text-slate-600" title={bid['Article Description']}>
                                    {(bid['Lot ID'] || bid['Article Description']).substring(0, 20)}
                                </td>
                                <td className="px-4 py-3 text-slate-600">{bid['Production site location'] || 'Unknown'}</td>
                                <td className="px-4 py-3 font-medium text-slate-800">{formatCurrency(bid['DDP Price (per 1000 Units)'] || 0)}</td>
                                <td className="px-4 py-3 text-right">
                                    <span className={`font-medium ${bid.savingVsNonDdp > 0 ? 'text-green-600' : 'text-slate-500'}`}>
                                        {bid.savingVsNonDdp > 0 ? '+' : ''}{formatCurrency(bid.savingVsNonDdp)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {ddpBids.length > 5 && (
                    <div className="bg-white px-4 py-2 border-t border-blue-50 text-xs text-center text-slate-400">
                        Showing top 5 of {ddpBids.length} DDP bids
                    </div>
                )}
            </div>
        </div>
    );
}
