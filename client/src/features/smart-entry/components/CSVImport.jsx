import React, { useRef, useState } from "react";
import Cookies from "js-cookie";
import { useSelector } from "react-redux";
import { CheckCircle, UploadCloud, FileUp, Table as TableIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { createBulkTransactions } from "../../../services/transaction.service";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../components/ui/select";

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
        setError(null);
        const transactionsToImport = [];

        for (let i = 0; i < csvData.length; i++) {
            const row = csvData[i];
            const amount = parseFloat(row[mapping.amount]?.replace(/[^0-9.-]/g, ""));
            if (isNaN(amount) || amount === 0) continue;

            // Determine type based on amount sign or column
            let type = "expense";
            if (mapping.type && row[mapping.type]) {
                const typeVal = row[mapping.type].toLowerCase();
                if (typeVal.includes("income") || typeVal.includes("credit") || typeVal.includes("deposit")) {
                    type = "income";
                }
            }

            // Parse date
            let date = new Date().toISOString().split("T")[0];
            if (mapping.date && row[mapping.date]) {
                const parsed = new Date(row[mapping.date]);
                if (!isNaN(parsed)) {
                    date = parsed.toISOString().split("T")[0];
                }
            }

            transactionsToImport.push({
                amount: Math.abs(amount),
                description: row[mapping.description] || "Imported transaction",
                date,
                type,
                category_id: defaultCategory,
            });
        }

        try {
            const result = await createBulkTransactions(transactionsToImport);
            if (result.success) {
                setImportResult({ success: transactionsToImport.length, failed: 0 });
                setSuccess(true);
                if (onTransactionsImported) {
                    onTransactionsImported();
                }
            }
        } catch (err) {
            setError(err.message || "Bulk import failed");
        } finally {
            setIsImporting(false);
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
                className="h-full cursor-pointer transition-all duration-300 border-none rounded-2xl bg-card ember-glow group hover:-translate-y-1 hover:shadow-xl hover:ring-2 hover:ring-primary/20"
                onClick={() => setDialogOpen(true)}
            >
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <FileUp className="w-12 h-12 text-primary mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-bold text-foreground">Import CSV</h3>
                    <p className="text-sm text-muted-foreground mt-1">
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
                            <div className="bg-ember/10 text-ember p-3 rounded-md mb-4 text-sm border border-ember/20">
                                {error}
                            </div>
                        )}
                        {success && importResult && (
                            <div className="bg-sage/10 text-sage p-3 rounded-md mb-4 text-sm border border-sage/20 flex items-center gap-2">
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
                                className="border-2 border-dashed border-primary/50 rounded-xl p-12 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <UploadCloud className="w-16 h-16 text-primary mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-foreground">Drop CSV file here</h3>
                                <p className="text-sm text-muted-foreground mt-1">
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
                                    <h4 className="font-semibold text-foreground mb-3">Map your CSV columns:</h4>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-foreground mb-1">Amount Column *</label>
                                            <Select
                                                value={mapping.amount}
                                                onValueChange={(value) => setMapping({ ...mapping, amount: value })}
                                            >
                                                <SelectTrigger className="w-full h-10 px-3 rounded-md border-none bg-card ember-glow text-sm focus:ring-2 focus:ring-primary">
                                                    <SelectValue placeholder="Select..." />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-md">
                                                    {headers.map((h) => <SelectItem key={h} value={h} className="text-sm">{h}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-foreground mb-1">Description Column *</label>
                                            <Select
                                                value={mapping.description}
                                                onValueChange={(value) => setMapping({ ...mapping, description: value })}
                                            >
                                                <SelectTrigger className="w-full h-10 px-3 rounded-md border-none bg-card ember-glow text-sm focus:ring-2 focus:ring-primary">
                                                    <SelectValue placeholder="Select..." />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-md">
                                                    {headers.map((h) => <SelectItem key={h} value={h} className="text-sm">{h}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-foreground mb-1">Date Column</label>
                                            <Select
                                                value={mapping.date}
                                                onValueChange={(value) => setMapping({ ...mapping, date: value })}
                                            >
                                                <SelectTrigger className="w-full h-10 px-3 rounded-md border-none bg-card ember-glow text-sm focus:ring-2 focus:ring-primary">
                                                    <SelectValue placeholder="Use today's date" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-md">
                                                    <SelectItem value="" className="text-sm">Use today's date</SelectItem>
                                                    {headers.map((h) => <SelectItem key={h} value={h} className="text-sm">{h}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-foreground mb-1">Default Category *</label>
                                            <Select
                                                value={defaultCategory}
                                                onValueChange={(value) => setDefaultCategory(value)}
                                            >
                                                <SelectTrigger className="w-full h-10 px-3 rounded-md border-none bg-card ember-glow text-sm focus:ring-2 focus:ring-primary">
                                                    <SelectValue placeholder="Select..." />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-md">
                                                    {categories.map((cat) => (
                                                        <SelectItem key={cat._id} value={cat._id} className="text-sm">
                                                            {cat.icon} {cat.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                {/* Preview */}
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="font-semibold text-foreground">Preview (first 5 rows):</h4>
                                        <span className="bg-muted text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full border-none">
                                            {csvData.length} total rows
                                        </span>
                                    </div>
                                    <div className="overflow-x-auto max-h-48 border-none bg-card ember-glow rounded-lg shadow-sm">
                                        <table className="w-full text-left text-sm text-muted-foreground">
                                            <thead className="text-xs text-gray-700 uppercase bg-muted dark:text-gray-400 sticky top-0">
                                                <tr>
                                                    {headers.slice(0, 5).map((h) => (
                                                        <th key={h} scope="col" className="px-4 py-3">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {csvData.slice(0, 5).map((row, i) => (
                                                    <tr key={i} className="border-b border-border/50 bg-card ember-glow last:border-0 hover:bg-muted/80">
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
                                        <div className="flex justify-between text-sm font-medium text-foreground mb-1">
                                            <span>Importing...</span>
                                            <span>{progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 bg-card ember-glow overflow-hidden">
                                            <div className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="mt-6 pt-4 border-t border-border/50">
                        <Button variant="ghost" onClick={handleClose}>
                            {success ? "Close" : "Cancel"}
                        </Button>
                        {csvData.length > 0 && !success && (
                            <Button
                                onClick={handleImport}
                                disabled={isImporting || !mapping.amount || !mapping.description || !defaultCategory}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
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
