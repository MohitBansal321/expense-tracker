import CameraAltIcon from "@mui/icons-material/CameraAlt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ReceiptIcon from "@mui/icons-material/Receipt";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import LinearProgress from "@mui/material/LinearProgress";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Cookies from "js-cookie";
import React, { useRef, useState } from "react";
import { useSelector } from "react-redux";
import { createWorker } from "tesseract.js";

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
                setTimeout(() => {
                    handleClose();
                }, 1500);
            } else {
                setError("Failed to save transaction");
            }
        } catch (err) {
            setError("Error saving transaction");
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
            {/* Trigger Button */}
            <Card
                sx={{
                    cursor: "pointer",
                    transition: "transform 0.2s",
                    "&:hover": { transform: "scale(1.02)" }
                }}
                onClick={() => setDialogOpen(true)}
            >
                <CardContent sx={{ textAlign: "center", py: 3 }}>
                    <ReceiptIcon sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
                    <Typography variant="h6">Scan Receipt</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Upload a receipt image to auto-fill
                    </Typography>
                </CardContent>
            </Card>

            {/* Scanner Dialog */}
            <Dialog open={dialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <ReceiptIcon /> Scan Receipt
                </DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 2 }} icon={<CheckCircleIcon />}>Transaction saved successfully!</Alert>}

                    {/* Upload Area */}
                    {!imagePreview && (
                        <Box
                            sx={{
                                border: "2px dashed",
                                borderColor: "primary.main",
                                borderRadius: 2,
                                p: 4,
                                textAlign: "center",
                                cursor: "pointer",
                                "&:hover": { bgcolor: "action.hover" }
                            }}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <CloudUploadIcon sx={{ fontSize: 64, color: "primary.main", mb: 2 }} />
                            <Typography variant="h6">Drop receipt image here</Typography>
                            <Typography variant="body2" color="text.secondary">
                                or click to browse
                            </Typography>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={handleFileSelect}
                            />
                        </Box>
                    )}

                    {/* Image Preview */}
                    {imagePreview && (
                        <Box sx={{ mb: 2 }}>
                            <Box sx={{ position: "relative", display: "inline-block", width: "100%" }}>
                                <img
                                    src={imagePreview}
                                    alt="Receipt"
                                    style={{
                                        width: "100%",
                                        maxHeight: 200,
                                        objectFit: "contain",
                                        borderRadius: 8
                                    }}
                                />
                                <IconButton
                                    sx={{ position: "absolute", top: 8, right: 8, bgcolor: "background.paper" }}
                                    onClick={() => fileInputRef.current?.click()}
                                    size="small"
                                >
                                    <CameraAltIcon />
                                </IconButton>
                            </Box>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={handleFileSelect}
                            />
                        </Box>
                    )}

                    {/* Processing Progress */}
                    {isProcessing && (
                        <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                                <CircularProgress size={24} />
                                <Typography>Processing receipt... {progress}%</Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={progress} />
                        </Box>
                    )}

                    {/* Form Fields */}
                    {imagePreview && !isProcessing && (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
                            {extractedData && (
                                <Alert severity="info" sx={{ fontSize: "0.85rem" }}>
                                    Extracted: {extractedData.merchant || "Unknown merchant"}
                                    {extractedData.amount && ` - $${extractedData.amount}`}
                                </Alert>
                            )}

                            <TextField
                                label="Amount"
                                type="number"
                                value={form.amount}
                                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                InputProps={{ startAdornment: "$" }}
                                required
                            />

                            <TextField
                                label="Description"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                multiline
                                rows={2}
                            />

                            <TextField
                                label="Date"
                                type="date"
                                value={form.date}
                                onChange={(e) => setForm({ ...form, date: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                            />

                            <FormControl required>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    value={form.category_id}
                                    label="Category"
                                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                                >
                                    {categories.map((cat) => (
                                        <MenuItem key={cat._id} value={cat._id}>
                                            {cat.icon} {cat.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    {imagePreview && !extractedData && !isProcessing && (
                        <Button variant="contained" onClick={processReceipt}>
                            Extract Text
                        </Button>
                    )}
                    {extractedData && (
                        <Button
                            variant="contained"
                            onClick={handleSave}
                            disabled={!form.amount || !form.category_id}
                        >
                            Save Transaction
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </>
    );
}
