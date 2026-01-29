import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import StopIcon from "@mui/icons-material/Stop";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Fab from "@mui/material/Fab";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

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
            <Card sx={{ opacity: 0.5 }}>
                <CardContent sx={{ textAlign: "center", py: 3 }}>
                    <MicOffIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
                    <Typography variant="h6">Voice Input</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Not supported in this browser
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            {/* Trigger Card */}
            <Card
                sx={{
                    cursor: "pointer",
                    transition: "transform 0.2s",
                    "&:hover": { transform: "scale(1.02)" }
                }}
                onClick={() => setDialogOpen(true)}
            >
                <CardContent sx={{ textAlign: "center", py: 3 }}>
                    <MicIcon sx={{ fontSize: 48, color: "secondary.main", mb: 1 }} />
                    <Typography variant="h6">Voice Input</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Speak to add transactions
                    </Typography>
                </CardContent>
            </Card>

            {/* Voice Dialog */}
            <Dialog open={dialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <VolumeUpIcon /> Voice Input
                </DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 2 }}>Transaction saved!</Alert>}

                    {/* Voice Button */}
                    <Box sx={{ textAlign: "center", mb: 3 }}>
                        <Fab
                            color={isListening ? "error" : "secondary"}
                            size="large"
                            onClick={isListening ? undefined : startListening}
                            sx={{
                                width: 80,
                                height: 80,
                                animation: isListening ? "pulse 1.5s infinite" : "none",
                                "@keyframes pulse": {
                                    "0%": { boxShadow: "0 0 0 0 rgba(156, 39, 176, 0.7)" },
                                    "70%": { boxShadow: "0 0 0 20px rgba(156, 39, 176, 0)" },
                                    "100%": { boxShadow: "0 0 0 0 rgba(156, 39, 176, 0)" },
                                }
                            }}
                        >
                            {isListening ? <StopIcon sx={{ fontSize: 36 }} /> : <MicIcon sx={{ fontSize: 36 }} />}
                        </Fab>
                        <Typography variant="body1" sx={{ mt: 2 }}>
                            {isListening ? "Listening..." : "Tap to speak"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Try: "Spent 25 dollars on lunch" or "50 bucks for groceries"
                        </Typography>
                    </Box>

                    {/* Transcript */}
                    {transcript && (
                        <Box sx={{ mb: 2, p: 2, bgcolor: "action.hover", borderRadius: 2 }}>
                            <Typography variant="body2" color="text.secondary">You said:</Typography>
                            <Typography variant="body1" sx={{ fontStyle: "italic" }}>"{transcript}"</Typography>
                        </Box>
                    )}

                    {/* Form Fields */}
                    {parsedData && (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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

                            <FormControl>
                                <InputLabel>Type</InputLabel>
                                <Select
                                    value={form.type}
                                    label="Type"
                                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                                >
                                    <MenuItem value="expense">Expense</MenuItem>
                                    <MenuItem value="income">Income</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    {parsedData && (
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
