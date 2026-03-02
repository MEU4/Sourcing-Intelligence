export interface RawBid {
    'Bidder Name': string;
    'Lot ID': string;
    'Article Description': string;
    'Indicative 2027 Demand Volume x 1000 Units': number;
    'Incoterms': string;
    'DDP Price (per 1000 Units)': number;
    'Tinplate (per 1000 Units)': number;
    'Conversion (per 1000 Units)': number;
    'Historic Price'?: number;
    'MOQ x 1000 Units': number;
    'Production Batch Size x 1000 Units': number;
    'Lead time for re-occuring items (Calendar Days)': number;
    'Currency': string;
    'Country': string;
    'Production site location': string;
    'Incumbent - Status': string;
}

export interface RoundLotBid {
    'Bidder': string;
    'Lot': string;
    'Article Description': string;
    'Rank': number;
    'Bid Value': number;
    'Adjusted Bid Value': number;
    'Round': string;
}

export interface GeminiAnalysisResponse {
    negotiation_opportunities: {
        material_lot: string;
        current_supplier: string;
        best_alternative: string;
        price_gap_eur: number | string;
        price_gap_percentage: number | string;
        recommended_action: string;
        priority: "High" | "Medium" | "Low";
    }[];
    strategic_insights: string[];
    ddp_summary: string;
    top_savings_materials: {
        material_name: string;
        savings_eur: number | string;
        savings_percentage: number;
        tier: "green" | "amber" | "red";
    }[];
}

export interface AppData {
    rawBids: any[];
    roundLotBids: any[];
    geminiData?: any;
}
}


