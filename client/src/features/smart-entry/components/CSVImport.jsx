import React, { useRef, useState } from "react";
import Cookies from "js-cookie";
import { useSelector } from "react-redux";
import { CheckCircle, UploadCloud, FileUp, Table as TableIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";

export default function CSVImport({ onTransactionsImported }) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [csvData, setCsvData] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [mapping, setMapping] = useState({
        amount: "",
        description: "",
        date: "",
        type: "",
    });
    const [isImporting, setIsImporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [importResult, setImportResult] = useState(null);

    const fileInputRef = useRef(null);
    const user = useSelector((state) => state.auth.user);
    const categories = user?.categories || [];
    const [defaultCategory, setDefaultCategory] = useState("");

    function parseCSV(text) {
        const lines = text.split(/\r?\n/).filter(line => line.trim());
        if (lines.length < 2) return { headers: [], data: [] };

        const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));
        const data = lines.slice(1).map(line => {
            const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
            const row = {};
            headers.forEach((header, i) => {
                row[header] = (values[i] || "").replace(/"/g, "").trim();
            });
            return row;
        });

        return { headers, data };
    }

    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const { headers, data } = parseCSV(text);
            setHeaders(headers);
            setCsvData(data);
            setError(null);
            setSuccess(false);
            setImportResult(null);

            // Auto-detect column mapping
            const lowerHeaders = headers.map(h => h.toLowerCase());
            setMapping({
                amount: headers[lowerHeaders.findIndex(h => h.includes("amount") || h.includes("value") || h.includes("sum"))] || "",
                description: headers[lowerHeaders.findIndex(h => h.includes("desc") || h.includes("memo") || h.includes("name") || h.includes("detail"))] || "",
                date: headers[lowerHeaders.findIndex(h => h.includes("date") || h.includes("time"))] || "",
                type: headers[lowerHeaders.findIndex(h => h.includes("type") || h.includes("category"))] || "",
            });
        };
        reader.readAsText(file);
    }

    async function handleImport() {
        if (!mapping.amount || !mapping.description || !defaultCategory) {
            setError("Please map Amount, Description, and select a default category");
            return;
        }

        setIsImporting(true);
        setProgress(0);
        setError(null);

        const token = Cookies.get("token");
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < csvData.length; i++) {
            const row = csvData[i];
            try {
                const amount = parseFloat(row[mapping.amount]?.replace(/[^0-9.-]/g, ""));
                if (isNaN(amount) || amount === 0) {
                    failCount++;
                    continue;
                }

                // Determine type based on amount sign or column
                let type = "expense";
                if (mapping.type && row[mapping.type]) {
                    const typeVal = row[mapping.type].toLowerCase();
                    if (typeVal.includes("income") || typeVal.includes("credit") || typeVal.includes("deposit")) {
                        type = "income";
                    }
                } else if (amount > 0) {
                    // Some CSV exports use positive for income, negative for expense
                    // We'll default to expense but can be adjusted
                }

                // Parse date
                let date = new Date().toISOString().split("T")[0];
                if (mapping.date && row[mapping.date]) {
                    const parsed = new Date(row[mapping.date]);
                    if (!isNaN(parsed)) {
                        date = parsed.toISOString().split("T")[0];
                    }
                }

                await fetch(`${import.meta.env.VITE_BASE_URL}/transaction`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        amount: Math.abs(amount),
                        description: row[mapping.description] || "Imported transaction",
                        date,
                        type,
                        category_id: defaultCategory,
                    }),
                });

                successCount++;
            } catch (err) {
                failCount++;
            }

            setProgress(Math.round(((i + 1) / csvData.length) * 100));
        }

        setIsImporting(false);
        setSuccess(true);
        setImportResult({ success: successCount, failed: failCount });

        if (onTransactionsImported) {
            onTransactionsImported();
        }
    }

    function handleClose() {
        setDialogOpen(false);
        setCsvData([]);
        setHeaders([]);
        setMapping({ amount: "", description: "", date: "", type: "" });
        setProgress(0);
        setError(null);
        setSuccess(false);
        setImportResult(null);
    }

    return (
        <>
            {/* Trigger Card */}
            <div
                className="h-full cursor-pointer transition-all duration-300 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 group hover:-translate-y-1 hover:shadow-xl hover:border-green-500"
                onClick={() => setDialogOpen(true)}
            >
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <FileUp className="w-12 h-12 text-green-500 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Import CSV</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Bulk import from bank exports
                    </p>
                </div>
            </div>

            {/* Import Dialog */}
            <Dialog open={dialogOpen} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <TableIcon className="w-5 h-5 text-gray-500" /> Import Transactions from CSV
                        </DialogTitle>
                    </DialogHeader>

                    <div className="mt-4">
                        {error && (
                            <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 text-sm border border-red-200">
                                {error}
                            </div>
                        )}
                        {success && importResult && (
                            <div className="bg-green-50 text-green-700 p-3 rounded-md mb-4 text-sm border border-green-200 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5" />
                                <span>
                                    Imported {importResult.success} transactions
                                    {importResult.failed > 0 && ` (${importResult.failed} failed)`}
                                </span>
                            </div>
                        )}

                        {/* Upload Area */}
                        {csvData.length === 0 && (
                            <div
                                className="border-2 border-dashed border-green-400 rounded-xl p-12 text-center cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <UploadCloud className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Drop CSV file here</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Bank statements, exports, or any CSV with transaction data
                                </p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".csv"
                                    className="hidden"
                                    onChange={handleFileSelect}
                                />
                            </div>
                        )}

                        {/* Column Mapping */}
                        {csvData.length > 0 && !success && (
                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Map your CSV columns:</h4>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Amount Column *</label>
                                            <select
                                                value={mapping.amount}
                                                onChange={(e) => setMapping({ ...mapping, amount: e.target.value })}
                                                className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                            >
                                                <option value="" disabled>Select...</option>
                                                {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Description Column *</label>
                                            <select
                                                value={mapping.description}
                                                onChange={(e) => setMapping({ ...mapping, description: e.target.value })}
                                                className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                            >
                                                <option value="" disabled>Select...</option>
                                                {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Date Column</label>
                                            <select
                                                value={mapping.date}
                                                onChange={(e) => setMapping({ ...mapping, date: e.target.value })}
                                                className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                            >
                                                <option value="">Use today's date</option>
                                                {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Default Category *</label>
                                            <select
                                                value={defaultCategory}
                                                onChange={(e) => setDefaultCategory(e.target.value)}
                                                className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                            >
                                                <option value="" disabled>Select...</option>
                                                {categories.map((cat) => (
                                                    <option key={cat._id} value={cat._id}>
                                                        {cat.icon} {cat.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Preview */}
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">Preview (first 5 rows):</h4>
                                        <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full border border-gray-200 dark:border-gray-700">
                                            {csvData.length} total rows
                                        </span>
                                    </div>
                                    <div className="overflow-x-auto max-h-48 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                                        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400 sticky top-0">
                                                <tr>
                                                    {headers.slice(0, 5).map((h) => (
                                                        <th key={h} scope="col" className="px-4 py-3">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {csvData.slice(0, 5).map((row, i) => (
                                                    <tr key={i} className="bg-white border-b dark:bg-gray-900 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                        {headers.slice(0, 5).map((h) => (
                                                            <td key={h} className="px-4 py-3 truncate max-w-[150px]">{row[h]}</td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Progress */}
                                {isImporting && (
                                    <div className="mt-4">
                                        <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            <span>Importing...</span>
                                            <span>{progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
                                            <div className="bg-green-600 h-2.5 rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <Button variant="ghost" onClick={handleClose}>
                            {success ? "Close" : "Cancel"}
                        </Button>
                        {csvData.length > 0 && !success && (
                            <Button
                                onClick={handleImport}
                                disabled={isImporting || !mapping.amount || !mapping.description || !defaultCategory}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                Import {csvData.length} Transactions
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
