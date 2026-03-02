import KPICards from './KPICards';
import SpendAnalysisTable from './SpendAnalysisTable';
import TopSavingsChart from './TopSavingsChart';
import SupplierSpendChart from './SupplierSpendChart';
import DDPOpportunitiesPanel from './DDPOpportunitiesPanel';
import StrategicInsightsPanel from './StrategicInsightsPanel';
import StrategyExpertChatbox from './StrategyExpertChatbox';
import type { AppData } from '../types';

interface DashboardProps {
    data: AppData;
    onReset: () => void;
}

export default function Dashboard({ data, onReset }: DashboardProps) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Analysis Dashboard</h2>
                    <p className="text-slate-500 mt-1">Found {data.rawBids.length} rows in Raw Bids and {data.roundLotBids.length} in Round Lot Bids</p>
                </div>
                <button
                    onClick={onReset}
                    className="text-sm font-medium bg-white border border-slate-300 shadow-sm hover:bg-slate-50 px-4 py-2 rounded-lg transition-colors"
                >
                    Upload New File
                </button>
            </div>

            {/* KPI Cards */}
            <KPICards data={data} />

            {/* Supplier Spend Comparison Chart */}
            <div className="glass-card p-6 mb-8">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Supplier Spend Comparison: Historical vs 2027</h3>
                <SupplierSpendChart data={data} />
            </div>

            <div className="glass-card p-6 mb-8 min-h-[400px]">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Top Savings by Material</h3>
                <TopSavingsChart data={data} />
            </div>

            {/* AI Strategic Insights - at the bottom */}
            <StrategicInsightsPanel data={data} />

            {/* DDP Opportunities - between AI report and Spend Analysis */}
            <DDPOpportunitiesPanel data={data} />

            {/* Spend Analysis Table */}
            <div className="glass-card p-6 mb-8 overflow-x-auto">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Spend Analysis Overview</h3>
                <SpendAnalysisTable data={data} />
            </div>

            {/* Strategy Expert Chatbox - floating bottom right */}
            <StrategyExpertChatbox data={data} />
        </div>
    );
}
