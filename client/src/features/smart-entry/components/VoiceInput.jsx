import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useSelector } from "react-redux";
import { Mic, MicOff, Square, Volume2, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { cn } from "../../../lib/utils";

export default function VoiceInput({ onTransactionCreated }) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [parsedData, setParsedData] = useState(null);
    const [form, setForm] = useState({
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        category_id: "",
        type: "expense"
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [isSupported, setIsSupported] = useState(true);

    const user = useSelector((state) => state.auth.user);
    const categories = user?.categories || [];

    useEffect(() => {
        if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
            setIsSupported(false);
        }
    }, []);

    function startListening() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onstart = () => {
            setIsListening(true);
            setError(null);
        };

        recognition.onresult = (event) => {
            const current = event.resultIndex;
            const result = event.results[current][0].transcript;
            setTranscript(result);

            if (event.results[current].isFinal) {
                parseVoiceCommand(result);
            }
        };

        recognition.onerror = (event) => {
            setError(`Error: ${event.error}`);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    }

    function parseVoiceCommand(text) {
        const lower = text.toLowerCase();
        const result = {
            amount: null,
            description: null,
            type: "expense",
            category: null,
        };

        // Check for income keywords
        if (lower.includes("income") || lower.includes("earned") || lower.includes("received") || lower.includes("got paid")) {
            result.type = "income";
        }

        // Extract amount - look for numbers followed by "dollars" or standalone
        const amountPatterns = [
            /(\d+(?:\.\d{2})?)\s*(?:dollars?|bucks?)/i,
            /\$\s*(\d+(?:\.\d{2})?)/i,
            /(?:spent|paid|cost|for|of)\s*(\d+(?:\.\d{2})?)/i,
            /(\d+(?:\.\d{2})?)/,
        ];

        for (const pattern of amountPatterns) {
            const match = text.match(pattern);
            if (match) {
                result.amount = parseFloat(match[1]);
                break;
            }
        }

        // Extract description - what comes after "for" or "on"
        const descPatterns = [
            /(?:for|on|at)\s+(.+?)(?:\s+(?:for|costing|at)|\s*$)/i,
            /(?:spent|paid)\s+\d+(?:\.\d{2})?\s*(?:dollars?)?\s+(?:for|on)\s+(.+)/i,
        ];

        for (const pattern of descPatterns) {
            const match = text.match(pattern);
            if (match) {
                result.description = match[1].trim();
                break;
            }
        }

        // If no description found, use cleaned text
        if (!result.description) {
            result.description = text
                .replace(/\d+(?:\.\d{2})?\s*(?:dollars?|bucks?)?/gi, "")
                .replace(/spent|paid|for|on|at/gi, "")
                .trim();
        }

        // Try to match category
        const categoryLabels = categories.map(c => c.label.toLowerCase());
        for (const cat of categories) {
            if (lower.includes(cat.label.toLowerCase())) {
                result.category = cat._id;
                break;
            }
        }

        setParsedData(result);
        setForm({
            amount: result.amount?.toString() || "",
            description: result.description || "",
            date: new Date().toISOString().split("T")[0],
            category_id: result.category || "",
            type: result.type,
        });
    }

    async function handleSave() {
        if (!form.amount || !form.category_id) {
            setError("Please fill in amount and category");
            return;
        }

        const token = Cookies.get("token");
        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/transaction`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...form,
                    amount: parseFloat(form.amount),
                }),
            });

            if (res.ok) {
                setSuccess(true);
                if (onTransactionCreated) {
                    onTransactionCreated();
                }
                setTimeout(() => handleClose(), 1500);
            } else {
                setError("Failed to save transaction");
            }
        } catch (err) {
            setError("Error saving transaction");
        }
    }

    function handleClose() {
        setDialogOpen(false);
        setTranscript("");
        setParsedData(null);
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

    if (!isSupported) {
        return (
            <div className="h-full border border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50 dark:bg-gray-900/50 opacity-60">
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <MicOff className="w-12 h-12 text-gray-400 mb-3" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Voice Input</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Not supported in this browser
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Trigger Card */}
            <div
                className="h-full cursor-pointer transition-all duration-300 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 group hover:-translate-y-1 hover:shadow-xl hover:border-pink-500"
                onClick={() => setDialogOpen(true)}
            >
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <Mic className="w-12 h-12 text-pink-500 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Voice Input</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Speak to add transactions
                    </p>
                </div>
            </div>

            {/* Voice Dialog */}
            <Dialog open={dialogOpen} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Volume2 className="w-5 h-5 text-gray-500" /> Voice Input
                        </DialogTitle>
                    </DialogHeader>

                    <div className="mt-4 max-h-[70vh] overflow-y-auto px-1 py-1">
                        {error && (
                            <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 text-sm border border-red-200">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="bg-green-50 text-green-700 p-3 rounded-md mb-4 text-sm border border-green-200 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                <span>Transaction saved!</span>
                            </div>
                        )}

                        {/* Voice Button */}
                        <div className="flex flex-col items-center justify-center mb-6">
                            <button
                                onClick={isListening ? undefined : startListening}
                                className={cn(
                                    "w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all text-white outline-none focus:outline-none",
                                    isListening 
                                        ? "bg-red-500 hover:bg-red-600 animate-[pulse_1.5s_cubic-bezier(0.4,0,0.6,1)_infinite]" 
                                        : "bg-pink-500 hover:bg-pink-600 hover:scale-105"
                                )}
                                style={{
                                    boxShadow: isListening ? '0 0 0 0 rgba(239, 68, 68, 0.7)' : '',
                                }}
                            >
                                {isListening ? <Square className="w-10 h-10 fill-current" /> : <Mic className="w-10 h-10" />}
                            </button>
                            <h4 className="mt-4 font-medium text-gray-900 dark:text-gray-100">
                                {isListening ? "Listening..." : "Tap to speak"}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                                Try: "Spent 25 dollars on lunch" or "50 bucks for groceries"
                            </p>
                        </div>

                        {/* Transcript */}
                        {transcript && (
                            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">You said:</span>
                                <p className="text-gray-900 dark:text-gray-100 italic text-lg pr-2 leading-relaxed">
                                    "{transcript}"
                                </p>
                            </div>
                        )}

                        {/* Form Fields */}
                        {parsedData && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
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
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                    <Input
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        placeholder="What was this for?"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                                        <select
                                            value={form.category_id}
                                            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                                            className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-slate-300"
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
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                                        <select
                                            value={form.type}
                                            onChange={(e) => setForm({ ...form, type: e.target.value })}
                                            className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-slate-300"
                                            required
                                        >
                                            <option value="expense">Expense</option>
                                            <option value="income">Income</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <Button variant="ghost" onClick={handleClose}>Cancel</Button>
                        {parsedData && (
                            <Button
                                onClick={handleSave}
                                disabled={!form.amount || !form.category_id}
                                className="bg-pink-600 hover:bg-pink-700 text-white shadow-md shadow-pink-500/20"
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
