import React, { useRef, useState } from "react";
import Cookies from "js-cookie";
import { useSelector } from "react-redux";
import { createWorker } from "tesseract.js";
import { Camera, CheckCircle, UploadCloud, Receipt, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { createTransaction } from "../../../services/transaction.service";

export default function ReceiptScanner({ onTransactionCreated }) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [extractedData, setExtractedData] = useState(null);
    const [form, setForm] = useState({
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        category_id: "",
        type: "expense"
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const fileInputRef = useRef(null);
    const user = useSelector((state) => state.auth.user);
    const categories = user?.categories || [];

    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith("image/")) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
            setExtractedData(null);
            setError(null);
            setSuccess(false);
        }
    }

    async function processReceipt() {
        if (!image) return;

        setIsProcessing(true);
        setProgress(0);
        setError(null);

        try {
            const worker = await createWorker("eng", 1, {
                logger: (m) => {
                    if (m.status === "recognizing text") {
                        setProgress(Math.round(m.progress * 100));
                    }
                },
            });

            const { data: { text } } = await worker.recognize(image);
            await worker.terminate();

            // Parse the OCR text
            const parsed = parseReceiptText(text);
            setExtractedData(parsed);

            // Auto-fill form with extracted data
            setForm(prev => ({
                ...prev,
                amount: parsed.amount || prev.amount,
                description: parsed.merchant || parsed.description || prev.description,
                date: parsed.date || prev.date,
            }));

        } catch (err) {
            console.error("OCR Error:", err);
            setError("Failed to process receipt. Please try again or enter manually.");
        } finally {
            setIsProcessing(false);
            setProgress(100);
        }
    }

    function parseReceiptText(text) {
        const result = {
            amount: null,
            date: null,
            merchant: null,
            description: null,
            rawText: text
        };

        // Extract amount - look for common patterns
        const amountPatterns = [
            /total[:\s]*\$?(\d+[.,]\d{2})/i,
            /amount[:\s]*\$?(\d+[.,]\d{2})/i,
            /grand\s*total[:\s]*\$?(\d+[.,]\d{2})/i,
            /\$(\d+[.,]\d{2})/g,
            /(\d+[.,]\d{2})\s*(?:usd|dollars)/i,
        ];

        for (const pattern of amountPatterns) {
            const match = text.match(pattern);
            if (match) {
                result.amount = match[1].replace(",", ".");
                break;
            }
        }

        // If no total found, find the largest amount
        if (!result.amount) {
            const allAmounts = text.match(/\d+[.,]\d{2}/g);
            if (allAmounts) {
                const amounts = allAmounts.map(a => parseFloat(a.replace(",", ".")));
                result.amount = Math.max(...amounts).toFixed(2);
            }
        }

        // Extract date
        const datePatterns = [
            /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/,
            /(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/,
            /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2},?\s+\d{2,4}/i,
        ];

        for (const pattern of datePatterns) {
            const match = text.match(pattern);
            if (match) {
                const parsedDate = new Date(match[1]);
                if (!isNaN(parsedDate)) {
                    result.date = parsedDate.toISOString().split("T")[0];
                    break;
                }
            }
        }

        // Extract merchant (usually first line or after store/merchant keyword)
        const lines = text.split("\n").filter(l => l.trim().length > 2);
        if (lines.length > 0) {
            result.merchant = lines[0].trim().substring(0, 50);
        }

        // Extract description from items
        const itemLines = lines.slice(1, 5).filter(l => !l.match(/total|tax|subtotal|change|cash/i));
        if (itemLines.length > 0) {
            result.description = itemLines.join(", ").substring(0, 100);
        }

        return result;
    }

    async function handleSave() {
        if (!form.amount || !form.category_id) {
            setError("Please fill in amount and category");
            return;
        }

        try {
            await createTransaction({
                ...form,
                amount: parseFloat(form.amount),
            });

            setSuccess(true);
            if (onTransactionCreated) {
                onTransactionCreated();
            }
            setTimeout(() => {
                handleClose();
            }, 1500);
        } catch (err) {
            setError(err.message || "Error saving transaction");
        }
    }

    function handleClose() {
        setDialogOpen(false);
        setImage(null);
        setImagePreview(null);
        setExtractedData(null);
        setProgress(0);
        setError(null);
        setSuccess(false);
        setForm({
            amount: "",
            description: "",
            date: new Date().toISOString().split("T")[0],
            category_id: "",
            type: "expense"
        });
    }

    return (
        <>
            {/* Trigger Card */}
            <div
                className="h-full cursor-pointer transition-all duration-300 border-none rounded-2xl bg-card ember-glow group hover:-translate-y-1 hover:shadow-xl hover:ring-2 hover:ring-primary/20"
                onClick={() => setDialogOpen(true)}
            >
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <Receipt className="w-12 h-12 text-primary mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-bold text-foreground">Scan Receipt</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Upload a receipt image to auto-fill
                    </p>
                </div>
            </div>

            {/* Scanner Dialog */}
            <Dialog open={dialogOpen} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Receipt className="w-5 h-5 text-gray-500" /> Scan Receipt
                        </DialogTitle>
                    </DialogHeader>

                    <div className="mt-4 max-h-[70vh] overflow-y-auto px-1 py-1">
                        {error && (
                            <div className="bg-ember/10 text-ember p-3 rounded-md mb-4 text-sm border border-ember/20">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="bg-sage/10 text-sage p-3 rounded-md mb-4 text-sm border border-sage/20 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                <span>Transaction saved successfully!</span>
                            </div>
                        )}

                        {/* Upload Area */}
                        {!imagePreview && (
                            <div
                                className="border-2 border-dashed border-primary/50 rounded-xl p-10 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <UploadCloud className="w-16 h-16 text-primary mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-foreground">Drop receipt image here</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    or click to browse
                                </p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileSelect}
                                />
                            </div>
                        )}

                        {/* Image Preview */}
                        {imagePreview && (
                            <div className="mb-6 relative w-full group">
                                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="bg-card ember-glow/90 p-2 rounded-full shadow-md text-foreground hover:text-primary focus:outline-none"
                                        title="Change Image"
                                    >
                                        <Camera className="w-4 h-4" />
                                    </button>
                                </div>
                                <img
                                    src={imagePreview}
                                    alt="Receipt"
                                    className="w-full max-h-48 object-contain rounded-lg border-none bg-card ember-glow"
                                />
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileSelect}
                                />
                            </div>
                        )}

                        {/* Processing Progress */}
                        {isProcessing && (
                            <div className="mb-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                                    <span className="text-sm font-medium text-foreground">Processing receipt... {progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 bg-card ember-glow overflow-hidden">
                                    <div className="bg-primary h-2 rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
                                </div>
                            </div>
                        )}

                        {/* Form Fields */}
                        {imagePreview && !isProcessing && (
                            <div className="space-y-4">
                                {extractedData && (
                                    <div className="bg-primary/10 text-primary text-sm p-3 rounded-lg border border-primary/20">
                                        <strong>Extracted:</strong> {extractedData.merchant || "Unknown merchant"}
                                        {extractedData.amount && ` - $${extractedData.amount}`}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Amount</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={form.amount}
                                            onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                            required
                                            className="pl-8"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                                    <Input
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        placeholder="What was this for?"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1">Date</label>
                                        <Input
                                            type="date"
                                            value={form.date}
                                            onChange={(e) => setForm({ ...form, date: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1">Category</label>
                                        <select
                                            value={form.category_id}
                                            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                                            className="flex h-10 w-full items-center justify-between rounded-md border-none bg-card ember-glow px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                                            required
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
                        )}
                    </div>

                    <DialogFooter className="mt-4 pt-4 border-t border-border/50">
                        <Button variant="ghost" onClick={handleClose}>Cancel</Button>
                        {imagePreview && !extractedData && !isProcessing && (
                            <Button onClick={processReceipt} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                Extract Text
                            </Button>
                        )}
                        {extractedData && (
                            <Button
                                onClick={handleSave}
                                disabled={!form.amount || !form.category_id}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                                Save Transaction
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
