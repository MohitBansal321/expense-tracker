import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import React from "react";
import CSVImport from "../components/CSVImport";
import ReceiptScanner from "../components/ReceiptScanner";
import VoiceInput from "../components/VoiceInput";

export default function SmartEntry() {
    function handleTransactionCreated() {
        // Optionally refresh or show notification
        console.log("Transaction created via smart entry");
    }

    return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
            {/* Header */}
            <Box sx={{ textAlign: "center", mb: 4 }}>
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                        mb: 1
                    }}
                >
                    <AutoAwesomeIcon fontSize="large" /> Smart Entry
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Add transactions quickly without manual data entry
                </Typography>
            </Box>

            {/* Smart Entry Options */}
            <Grid container spacing={3} justifyContent="center">
                <Grid item xs={12} sm={6} md={4}>
                    <ReceiptScanner onTransactionCreated={handleTransactionCreated} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <CSVImport onTransactionsImported={handleTransactionCreated} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <VoiceInput onTransactionCreated={handleTransactionCreated} />
                </Grid>
            </Grid>

            {/* Features Info */}
            <Box sx={{ mt: 6 }}>
                <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
                    How it works
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Box sx={{ textAlign: "center", p: 2 }}>
                            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                                📸 Receipt Scanner
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Upload a photo of your receipt. Our OCR technology extracts the amount,
                                date, and merchant automatically.
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Box sx={{ textAlign: "center", p: 2 }}>
                            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                                📁 CSV Import
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Import transactions in bulk from your bank's CSV export.
                                Map columns and import hundreds of transactions at once.
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Box sx={{ textAlign: "center", p: 2 }}>
                            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                                🎤 Voice Input
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Just speak! Say something like "Spent 25 dollars on lunch" and
                                we'll parse it automatically.
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
}
