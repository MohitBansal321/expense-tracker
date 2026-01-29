import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CircularProgress from "@mui/material/CircularProgress";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

export default function DashboardActions({ onAddTransaction }) {
    const navigate = useNavigate();
    const [healthScore, setHealthScore] = useState(100);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        calculateHealthScore();
    }, []);

    async function calculateHealthScore() {
        const token = Cookies.get("token");
        try {
            // Get alerts to check for budget violations
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/budget/alerts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.success) {
                // Determine score deduction based on alerts
                let deduction = 0;
                data.data.forEach(alert => {
                    if (alert.isOverBudget) deduction += 20; // Heavy penalty
                    else deduction += 5; // Warning penalty
                });

                // Cap the lowest score at 0
                setHealthScore(Math.max(0, 100 - deduction));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const getScoreColor = (score) => {
        if (score >= 80) return "#4CAF50"; // Green
        if (score >= 50) return "#FF9800"; // Orange
        return "#f44336"; // Red
    };

    return (
        <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Quick Actions */}
            <Grid item xs={12} md={8}>
                <Card sx={{ height: '100%', borderRadius: 3 }}>
                    <CardContent>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            Quick Actions
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={4}>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 1, borderRadius: 2 }}
                                    onClick={onAddTransaction}
                                >
                                    <AddCircleIcon fontSize="large" color="primary" />
                                    <Typography variant="caption" fontWeight={600}>Add Expense</Typography>
                                </Button>
                            </Grid>
                            <Grid item xs={4}>
                                <Link to="/smart-entry" style={{ textDecoration: 'none' }}>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 1, borderRadius: 2 }}
                                    >
                                        <ReceiptLongIcon fontSize="large" color="secondary" />
                                        <Typography variant="caption" fontWeight={600}>Scan Receipt</Typography>
                                    </Button>
                                </Link>
                            </Grid>
                            <Grid item xs={4}>
                                <Link to="/budget" style={{ textDecoration: 'none' }}>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 1, borderRadius: 2 }}
                                    >
                                        <AccountBalanceWalletIcon fontSize="large" color="success" />
                                        <Typography variant="caption" fontWeight={600}>New Budget</Typography>
                                    </Button>
                                </Link>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>

            {/* Financial Health Score */}
            <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', borderRadius: 3, position: 'relative', overflow: 'visible' }}>
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            Financial Health
                        </Typography>

                        <Box sx={{ position: 'relative', display: 'inline-flex', my: 1 }}>
                            <CircularProgress
                                variant="determinate"
                                value={100}
                                size={100}
                                thickness={4}
                                sx={{ color: '#e0e0e0' }}
                            />
                            <CircularProgress
                                variant="determinate"
                                value={loading ? 0 : healthScore}
                                size={100}
                                thickness={4}
                                sx={{
                                    color: getScoreColor(healthScore),
                                    position: 'absolute',
                                    left: 0,
                                    transition: 'all 1s ease'
                                }}
                            />
                            <Box
                                sx={{
                                    top: 0,
                                    left: 0,
                                    bottom: 0,
                                    right: 0,
                                    position: 'absolute',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Typography variant="h5" component="div" fontWeight={700} color="text.secondary">
                                    {healthScore}
                                </Typography>
                            </Box>
                        </Box>

                        <Typography variant="caption" color="text.secondary" textAlign="center">
                            Based on budget adherence
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
}
