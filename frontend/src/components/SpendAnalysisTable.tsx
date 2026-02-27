import { useMemo, useState } from 'react';
import type { AppData } from '../types';
import { formatCurrency } from '../utils/calculations';
import { ArrowUpDown } from 'lucide-react';

interface SpendAnalysisTableProps {
    data: AppData;
}

export default function SpendAnalysisTable({ data }: SpendAnalysisTableProps) {
    const [sortField, setSortField] = useState<string>('savingsEur');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const tableData = useMemo(() => {
        if (!data.rawBids) return [];

        const uniqueLots = Array.from(new Set(data.rawBids.map(b => b['Lot ID'] || b['Article Description'])));

        return uniqueLots.map(lotId => {
            const lotBids = data.rawBids.filter(b => (b['Lot ID'] || b['Article Description']) === lotId);
            const articleDescription = lotBids[0]['Article Description'] || 'Unknown';
            const volumeK = lotBids[0]['Indicative 2027 Demand Volume x 1000 Units'] || 0;
            const moq = lotBids[0]['MOQ x 1000 Units'] || 0;

            const incumbentBid = lotBids.find(b => b['Incumbent - Status']?.toLowerCase() === 'incumbent');

            let baselinePrice = 0;
            let baselineSupplier = 'Multiple/Unknown';

            if (incumbentBid && incumbentBid['DDP Price (per 1000 Units)']) {
                baselinePrice = incumbentBid['DDP Price (per 1000 Units)'];
                baselineSupplier = incumbentBid['Bidder Name'];
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
            let bestSupplier = baselineSupplier;
            let incoterms = incumbentBid ? incumbentBid['Incoterms'] : lotBids[0]['Incoterms'];

            if (validDdpBids.length > 0) {
                validDdpBids.sort((a, b) => a['DDP Price (per 1000 Units)'] - b['DDP Price (per 1000 Units)']);
                bestPrice = validDdpBids[0]['DDP Price (per 1000 Units)'];
                bestSupplier = validDdpBids[0]['Bidder Name'];
                incoterms = validDdpBids[0]['Incoterms'];
            }

            const savingPerUnit = baselinePrice - bestPrice;
            const totalSavingEur = savingPerUnit * volumeK;
            const savingPercentage = baselinePrice > 0 ? (savingPerUnit / baselinePrice) * 100 : 0;

            return {
                lotId,
                articleDescription,
                volumeK,
                bestPrice,
                bestSupplier,
                baselinePrice,
                savingPerUnit,
                totalSavingEur,
                savingPercentage,
                incoterms,
                moq
            };
        });
    }, [data]);

    const sortedData = useMemo(() => {
        return [...tableData].sort((a: any, b: any) => {
            const aValue = a[sortField];
            const bValue = b[sortField];

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }

            return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        });
    }, [tableData, sortField, sortDirection]);

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc'); // Default to desc when changing field
        }
    };

    const renderSortHeader = (label: string, field: string) => (
        <th
            className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-50 transition-colors"
            onClick={() => handleSort(field)}
        >
            <div className="flex items-center gap-1">
                {label}
                <ArrowUpDown size={14} className={sortField === field ? 'text-primary-500' : 'text-slate-300'} />
            </div>
        </th>
    );

    return (
        <div className="w-full">
            <table className="min-w-full bg-white text-left shadow-sm rounded-lg overflow-hidden">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                        {renderSortHeader('Lot ID', 'lotId')}
                        {renderSortHeader('Description', 'articleDescription')}
                        {renderSortHeader('Vol (k)', 'volumeK')}
                        {renderSortHeader('Best Price', 'bestPrice')}
                        {renderSortHeader('Supplier', 'bestSupplier')}
                        {renderSortHeader('Base Price', 'baselinePrice')}
                        {renderSortHeader('Save/Unit', 'savingPerUnit')}
                        {renderSortHeader('Total Save', 'totalSavingEur')}
                        {renderSortHeader('Incoterms', 'incoterms')}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {sortedData.map((row, idx) => (
                        <tr
                            key={`${row.lotId}-${idx}`}
                            className={`hover:bg-slate-50 transition-colors ${row.savingPercentage > 10 ? 'bg-warning-50 hover:bg-warning-100' : ''}`}
                        >
                            <td className="px-4 py-3 text-sm font-medium text-slate-900">{row.lotId}</td>
                            <td className="px-4 py-3 text-sm text-slate-700 max-w-[200px] truncate" title={row.articleDescription}>
                                {row.articleDescription}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-700">{row.volumeK.toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm font-semibold text-primary-700">{formatCurrency(row.bestPrice)}</td>
                            <td className="px-4 py-3 text-sm text-slate-700">{row.bestSupplier}</td>
                            <td className="px-4 py-3 text-sm text-slate-500">{formatCurrency(row.baselinePrice)}</td>
                            <td className="px-4 py-3 text-sm text-success-600">{formatCurrency(row.savingPerUnit)}</td>
                            <td className="px-4 py-3 text-sm font-bold text-success-600">{formatCurrency(row.totalSavingEur)}</td>
                            <td className="px-4 py-3 text-sm text-slate-500">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${row.incoterms?.toUpperCase() === 'DDP' ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {row.incoterms || 'N/A'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
