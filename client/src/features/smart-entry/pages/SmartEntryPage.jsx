import React from "react";
import { Wand2 } from "lucide-react";
import CSVImport from "../components/CSVImport";
import ReceiptScanner from "../components/ReceiptScanner";
import VoiceInput from "../components/VoiceInput";

export default function SmartEntry() {
    function handleTransactionCreated() {
        // Optionally refresh or show notification
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-10">
                <h1 className="text-3xl md:text-4xl font-bold flex items-center justify-center gap-3 text-foreground mb-2">
                    <Wand2 className="w-8 h-8 text-primary" /> Smart Entry
                </h1>
                <p className="text-muted-foreground">
                    Add transactions quickly without manual data entry
                </p>
            </div>

            {/* Smart Entry Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-center mb-16">
                <div className="h-48 bg-card ember-glow/50 backdrop-blur-sm shadow-xl border-none rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                    <ReceiptScanner onTransactionCreated={handleTransactionCreated} />
                </div>
                <div className="h-48 bg-card ember-glow/50 backdrop-blur-sm shadow-xl border-none rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                    <CSVImport onTransactionsImported={handleTransactionCreated} />
                </div>
                <div className="h-48 bg-card ember-glow/50 backdrop-blur-sm shadow-xl border-none rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                    <VoiceInput onTransactionCreated={handleTransactionCreated} />
                </div>
            </div>

            {/* Features Info */}
            <div className="mt-12 bg-card ember-glow/20 backdrop-blur-sm rounded-3xl p-8 border-none">
                <h2 className="text-xl font-bold text-center text-foreground mb-8">
                    How it works
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center p-4">
                        <h3 className="font-semibold text-lg text-foreground mb-2">
                            📸 Receipt Scanner
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Upload a photo of your receipt. Our OCR technology extracts the amount,
                            date, and merchant automatically.
                        </p>
                    </div>
                    <div className="text-center p-4">
                        <h3 className="font-semibold text-lg text-foreground mb-2">
                            📁 CSV Import
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Import transactions in bulk from your bank's CSV export.
                            Map columns and import hundreds of transactions at once.
                        </p>
                    </div>
                    <div className="text-center p-4">
                        <h3 className="font-semibold text-lg text-foreground mb-2">
                            🎤 Voice Input
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Just speak! Say something like "Spent 25 dollars on lunch" and
                            we'll parse it automatically.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
