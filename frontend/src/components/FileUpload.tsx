import { useState, useCallback } from 'react';
import { UploadCloud, FileSpreadsheet } from 'lucide-react';
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

            // Small delay just for UX processing feeling
            setTimeout(() => {
                onDataParsed({ rawBids, roundLotBids });
                setIsProcessing(false);
            }, 1000);

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

    return (
        <div className="max-w-3xl mx-auto mt-16 md:mt-24">
            <div className="text-center mb-10">
                <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                    Upload Bidding Analysis
                </h2>
                <p className="text-lg text-slate-500">
                    Drop your procurement analysis file here, and we'll extract insights using Gemini AI.
                </p>
            </div>

            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`glass-card p-12 text-center relative overflow-hidden transition-all duration-300 transform rounded-2xl border-2 border-dashed ${isDragging ? 'border-primary-500 bg-primary-50 scale-[1.02]' : 'border-slate-300 hover:border-primary-400 hover:shadow-lg'
                    }`}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 opacity-50 z-0 pointer-events-none" />

                {isProcessing ? (
                    <div className="relative z-10 flex flex-col items-center justify-center animate-pulse">
                        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mb-4" />
                        <p className="text-primary-700 font-medium text-lg">Analysing your sourcing data with AI...</p>
                    </div>
                ) : (
                    <div className="relative z-10 flex flex-col items-center justify-center">
                        <div className={`p-4 rounded-full mb-4 transition-colors ${isDragging ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-500'}`}>
                            <UploadCloud size={48} strokeWidth={1.5} />
                        </div>
                        <p className="text-lg font-semibold text-slate-700 mb-2">Drag & drop your Excel file here</p>
                        <p className="text-sm text-slate-500 mb-6">Must be a .xlsx with 'Raw Bids' and 'Round Lot Bids' sheets</p>

                        <label className="cursor-pointer inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-medium shadow-sm transition-all focus:ring-4 focus:ring-primary-100">
                            <FileSpreadsheet size={20} />
                            Browse Files
                            <input
                                type="file"
                                accept=".xlsx"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </label>
                    </div>
                )}
            </div>

            {error && (
                <div className="mt-6 p-4 bg-danger-50 border border-danger-200 text-danger-600 rounded-xl text-center shadow-sm font-medium">
                    {error}
                </div>
            )}
        </div>
    );
}
