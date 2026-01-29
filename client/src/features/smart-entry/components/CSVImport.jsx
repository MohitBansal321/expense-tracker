import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import TableChartIcon from "@mui/icons-material/TableChart";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import LinearProgress from "@mui/material/LinearProgress";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Cookies from "js-cookie";
import React, { useRef, useState } from "react";
import { useSelector } from "react-redux";

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
            <Card
                sx={{
                    cursor: "pointer",
                    transition: "transform 0.2s",
                    "&:hover": { transform: "scale(1.02)" }
                }}
                onClick={() => setDialogOpen(true)}
            >
                <CardContent sx={{ textAlign: "center", py: 3 }}>
                    <FileUploadIcon sx={{ fontSize: 48, color: "success.main", mb: 1 }} />
                    <Typography variant="h6">Import CSV</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Bulk import from bank exports
                    </Typography>
                </CardContent>
            </Card>

            {/* Import Dialog */}
            <Dialog open={dialogOpen} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TableChartIcon /> Import Transactions from CSV
                </DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {success && importResult && (
                        <Alert severity="success" sx={{ mb: 2 }} icon={<CheckCircleIcon />}>
                            Imported {importResult.success} transactions
                            {importResult.failed > 0 && ` (${importResult.failed} failed)`}
                        </Alert>
                    )}

                    {/* Upload Area */}
                    {csvData.length === 0 && (
                        <Box
                            sx={{
                                border: "2px dashed",
                                borderColor: "success.main",
                                borderRadius: 2,
                                p: 4,
                                textAlign: "center",
                                cursor: "pointer",
                                "&:hover": { bgcolor: "action.hover" }
                            }}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <CloudUploadIcon sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
                            <Typography variant="h6">Drop CSV file here</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Bank statements, exports, or any CSV with transaction data
                            </Typography>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                hidden
                                onChange={handleFileSelect}
                            />
                        </Box>
                    )}

                    {/* Column Mapping */}
                    {csvData.length > 0 && !success && (
                        <>
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                                    Map your CSV columns:
                                </Typography>
                                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                                    <FormControl size="small" sx={{ minWidth: 150 }}>
                                        <InputLabel>Amount Column *</InputLabel>
                                        <Select
                                            value={mapping.amount}
                                            label="Amount Column *"
                                            onChange={(e) => setMapping({ ...mapping, amount: e.target.value })}
                                        >
                                            {headers.map((h) => <MenuItem key={h} value={h}>{h}</MenuItem>)}
                                        </Select>
                                    </FormControl>

                                    <FormControl size="small" sx={{ minWidth: 150 }}>
                                        <InputLabel>Description Column *</InputLabel>
                                        <Select
                                            value={mapping.description}
                                            label="Description Column *"
                                            onChange={(e) => setMapping({ ...mapping, description: e.target.value })}
                                        >
                                            {headers.map((h) => <MenuItem key={h} value={h}>{h}</MenuItem>)}
                                        </Select>
                                    </FormControl>

                                    <FormControl size="small" sx={{ minWidth: 150 }}>
                                        <InputLabel>Date Column</InputLabel>
                                        <Select
                                            value={mapping.date}
                                            label="Date Column"
                                            onChange={(e) => setMapping({ ...mapping, date: e.target.value })}
                                        >
                                            <MenuItem value="">Use today's date</MenuItem>
                                            {headers.map((h) => <MenuItem key={h} value={h}>{h}</MenuItem>)}
                                        </Select>
                                    </FormControl>

                                    <FormControl size="small" sx={{ minWidth: 180 }}>
                                        <InputLabel>Default Category *</InputLabel>
                                        <Select
                                            value={defaultCategory}
                                            label="Default Category *"
                                            onChange={(e) => setDefaultCategory(e.target.value)}
                                        >
                                            {categories.map((cat) => (
                                                <MenuItem key={cat._id} value={cat._id}>
                                                    {cat.icon} {cat.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                            </Box>

                            {/* Preview */}
                            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                                Preview (first 5 rows):
                            </Typography>
                            <Chip label={`${csvData.length} total rows`} size="small" sx={{ mb: 1 }} />
                            <TableContainer component={Paper} sx={{ maxHeight: 200 }}>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            {headers.slice(0, 5).map((h) => <TableCell key={h}>{h}</TableCell>)}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {csvData.slice(0, 5).map((row, i) => (
                                            <TableRow key={i}>
                                                {headers.slice(0, 5).map((h) => <TableCell key={h}>{row[h]}</TableCell>)}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {/* Progress */}
                            {isImporting && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="body2">Importing... {progress}%</Typography>
                                    <LinearProgress variant="determinate" value={progress} />
                                </Box>
                            )}
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>{success ? "Close" : "Cancel"}</Button>
                    {csvData.length > 0 && !success && (
                        <Button
                            variant="contained"
                            onClick={handleImport}
                            disabled={isImporting || !mapping.amount || !mapping.description || !defaultCategory}
                        >
                            Import {csvData.length} Transactions
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </>
    );
}
