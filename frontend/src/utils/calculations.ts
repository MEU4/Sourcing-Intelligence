import type { AppData } from '../types';

export interface KPIMetrics {
    currentSpend: number;
    optimisedSpend: number;
    savings: number;
    savingsPercentage: number;
}

export function calculateKPIMetrics(data: AppData): KPIMetrics {
    const { rawBids } = data;

    if (!rawBids || rawBids.length === 0) {
        return { currentSpend: 0, optimisedSpend: 0, savings: 0, savingsPercentage: 0 };
    }

    // 1. Calculate Current Spend
    // Strategy: For each unique lot, find the incumbent's DDP price or use Historical Price
    const uniqueLots = Array.from(new Set(rawBids.map(b => b['Lot ID'] || b['Article Description'])));

    let currentSpend = 0;
    let optimisedSpend = 0;

    uniqueLots.forEach(lotId => {
        const bidsForLot = rawBids.filter(b => (b['Lot ID'] || b['Article Description']) === lotId);
        if (bidsForLot.length === 0) return;

        // We assume demand volume is the same across all bids for the same lot
        const volumeK = bidsForLot[0]['Indicative 2027 Demand Volume x 1000 Units'] || 0;

        // Find incumbent bid to get current price, or use historic price if available on any bid
        const incumbentBid = bidsForLot.find(b => b['Incumbent - Status']?.toLowerCase() === 'incumbent');

        let baselinePrice = 0;
        if (incumbentBid && incumbentBid['DDP Price (per 1000 Units)']) {
            baselinePrice = incumbentBid['DDP Price (per 1000 Units)'];
        } else {
            // Try to find a historic price from any of the bids for this lot
            const bidWithHistoric = bidsForLot.find(b => typeof b['Historic Price'] === 'number' && b['Historic Price'] > 0);
            if (bidWithHistoric) {
                baselinePrice = bidWithHistoric['Historic Price']!;
            } else {
                // Fallback: average of bids if no historic/incumbent
                baselinePrice = bidsForLot.reduce((acc, b) => acc + (b['DDP Price (per 1000 Units)'] || 0), 0) / bidsForLot.length;
            }
        }

        currentSpend += baselinePrice * volumeK;

        // Find Lowest DDP Price for Optimised Spend
        const validDdpBids = bidsForLot.filter(b => typeof b['DDP Price (per 1000 Units)'] === 'number' && b['DDP Price (per 1000 Units)'] > 0);
        let bestPrice = baselinePrice; // default to baseline if no valid competitive bids

        if (validDdpBids.length > 0) {
            bestPrice = Math.min(...validDdpBids.map(b => b['DDP Price (per 1000 Units)']));
        }

        optimisedSpend += bestPrice * volumeK;
    });

    const savings = currentSpend - optimisedSpend;
    const savingsPercentage = currentSpend > 0 ? (savings / currentSpend) * 100 : 0;

    return {
        currentSpend,
        optimisedSpend,
        savings,
        savingsPercentage
    };
}

export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

export function formatPercent(value: number): string {
    return new Intl.NumberFormat('en-IE', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value / 100);
}
