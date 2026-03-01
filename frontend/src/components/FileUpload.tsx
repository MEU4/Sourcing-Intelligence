import { useState, useCallback } from 'react';
import { UploadCloud, FileSpreadsheet, Zap, BarChart2, Lightbulb } from 'lucide-react';
import * as XLSX from 'xlsx';

interface FileUploadProps {
    onDataParsed: (data: any) => void;
}

export default function FileUpload({ onDataParsed }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const processFile = async (file: File) => {
        if (!file.name.endsWith('.xlsx')) {
            setError("Please use a valid .xlsx file. Other formats are not supported.");
            return;
        }
        setError(null);
        setIsProcessing(true);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });

            const rawBidsSheet = workbook.Sheets['Raw Bids'];
            const roundLotBidsSheet = workbook.Sheets['Round Lot Bids'];

            if (!rawBidsSheet || !roundLotBidsSheet) {
                setError("This file format isn't recognised. Missing 'Raw Bids' or 'Round Lot Bids' sheet.");
                setIsProcessing(false);
                return;
            }

            const rawBids = XLSX.utils.sheet_to_json(rawBidsSheet);
            const roundLotBids = XLSX.utils.sheet_to_json(roundLotBidsSheet);

            if (rawBids.length === 0) {
                setError("No bid data found in this file.");
                setIsProcessing(false);
                return;
            }

            try {
                const apiUrl = import.meta.env.VITE_API_URL || '/api/analyze';
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ rawBids, roundLotBids })
                });

                let geminiData = null;
                if (response.ok) {
                    geminiData = await response.json();
                } else {
                    console.warn("Gemini API failed or unavailable. Continuing with local data only.");
                }

                onDataParsed({ rawBids, roundLotBids, geminiData });
                setIsProcessing(false);
            } catch {
                console.warn("Backend unavailable. Continuing with local data only.");
                onDataParsed({ rawBids, roundLotBids, geminiData: null });
                setIsProcessing(false);
            }

        } catch (err: any) {
            console.error(err);
            setError("Error parsing file. Please check the format.");
            setIsProcessing(false);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFile(e.target.files[0]);
        }
    };

    if (isProcessing) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-16 h-16 border-4 border-[#00C4FF]/30 border-t-[#00C4FF] rounded-full animate-spin mb-6" />
                <p className="text-xl font-bold text-slate-800 mb-2">Analysing your sourcing data...</p>
                <p className="text-slate-500 text-sm">Gemini AI is reading your bid file and generating strategic insights</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">

            {/* Hero Section */}
            <div className="text-center mb-14">
                <div className="inline-flex items-center gap-2 bg-[#00C4FF]/10 text-[#00C4FF] text-xs font-semibold px-4 py-2 rounded-full mb-6 border border-[#00C4FF]/20">
                    <Sparkles size={14} />
                    Powered by Gemini AI
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-5 leading-tight">
                    Transform Supplier Bids into<br />
                    <span className="text-[#00C4FF]">Strategic Advantage</span>
                </h2>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                    Upload your bidding analysis file and let AI uncover savings opportunities, negotiation leverage,
                    and strategic insights — in seconds.
                </p>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-[#00C4FF]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <FileSpreadsheet size={24} className="text-[#00C4FF]" />
                    </div>
                    <h3 className="font-bold text-slate-800 mb-2">Instant Bid Analysis</h3>
                    <p className="text-sm text-slate-500">AI reads and interprets your entire supplier bid file automatically</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-[#46D000]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Lightbulb size={24} className="text-[#46D000]" />
                    </div>
                    <h3 className="font-bold text-slate-800 mb-2">Strategic Insights</h3>
                    <p className="text-sm text-slate-500">Uncover quick wins, savings opportunities and negotiation strategies</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-[#9600FF]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <BarChart2 size={24} className="text-[#9600FF]" />
                    </div>
                    <h3 className="font-bold text-slate-800 mb-2">Visual Intelligence</h3>
                    <p className="text-sm text-slate-500">Interactive charts comparing suppliers, spend, prices and opportunities</p>
                </div>
            </div>

            {/* Upload Area */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 ${
                    isDragging
                        ? 'border-[#00C4FF] bg-[#00C4FF]/5 scale-[1.01]'
                        : 'border-slate-200 bg-white hover:border-[#00C4FF]/50 hover:shadow-md'
                }`}
            >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${isDragging ? 'bg-[#00C4FF]/10' : 'bg-slate-100'}`}>
                    <UploadCloud size={28} className={isDragging ? 'text-[#00C4FF]' : 'text-slate-400'} strokeWidth={1.5} />
                </div>
                <p className="text-slate-700 font-semibold mb-1">Drag & drop your Excel file here</p>
                <p className="text-sm text-slate-400 mb-6">Must be a .xlsx with 'Raw Bids' and 'Round Lot Bids' sheets</p>

                <label className="cursor-pointer inline-flex items-center gap-2 bg-[#00C4FF] hover:bg-[#00a8d9] text-white px-6 py-3 rounded-xl font-semibold shadow-sm transition-all hover:shadow-md">
                    <FileSpreadsheet size={18} />
                    Upload Bidding Analysis File
                    <input
                        type="file"
                        accept=".xlsx"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </label>

                <p className="text-xs text-slate-400 mt-4">Your data is processed securely and never stored</p>
            </div>

            {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-center text-sm font-medium">
                    {error}
                </div>
            )}
        </div>
    );
}

// Need to add missing import
function Sparkles({ size }: { size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3L13.5 8.5L19 10L13.5 11.5L12 17L10.5 11.5L5 10L10.5 8.5L12 3Z"/>
            <path d="M5 3L5.5 5L7 5.5L5.5 6L5 8L4.5 6L3 5.5L4.5 5L5 3Z"/>
            <path d="M19 14L19.5 16L21 16.5L19.5 17L19 19L18.5 17L17 16.5L18.5 16L19 14Z"/>
        </svg>
    );
}
