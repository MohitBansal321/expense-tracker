// Dashboard page with analytics and insights
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import SavingsIcon from "@mui/icons-material/Savings";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Chip from "@mui/material/Chip";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import LinearProgress from "@mui/material/LinearProgress";
import { scaleBand } from "@devexpress/dx-chart-core";
import { Animation, ArgumentScale, EventTracker } from "@devexpress/dx-react-chart";
import {
    ArgumentAxis,
    BarSeries,
    Chart,
    Legend,
    PieSeries,
    Tooltip,
    ValueAxis,
} from "@devexpress/dx-react-chart-material-ui";
import Cookies from "js-cookie";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import WelcomeTour from "../components/WelcomeTour";
import DashboardActions from "../components/DashboardActions";
import TransactionForm from "../components/TransactionForm";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

// Summary Card Component
function SummaryCard({ title, value, icon, color, change, isLoading }) {
    const isPositive = change >= 0;

    return (
        <Card
            sx={{
                height: "100%",
                background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
                border: `1px solid ${color}30`,
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: `0 8px 25px ${color}20`
                }
            }}
        >
            <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            {title}
                        </Typography>
                        {isLoading ? (
                            <Skeleton variant="text" width={120} height={40} />
                        ) : (
                            <Typography variant="h4" sx={{ fontWeight: 700, color }}>
                                ${value?.toLocaleString() || 0}
                            </Typography>
                        )}
                        {change !== undefined && !isLoading && (
                            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                                {isPositive ? (
                                    <ArrowUpwardIcon sx={{ fontSize: 16, color: "success.main" }} />
                                ) : (
                                    <ArrowDownwardIcon sx={{ fontSize: 16, color: "error.main" }} />
                                )}
                                <Typography
                                    variant="caption"
                                    sx={{ color: isPositive ? "success.main" : "error.main", ml: 0.5 }}
                                >
                                    {Math.abs(change)}% vs last month
                                </Typography>
                            </Box>
                        )}
                    </Box>
                    <Box
                        sx={{
                            p: 1.5,
                            borderRadius: 2,
                            backgroundColor: `${color}20`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    >
                        {icon}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}

// Category Breakdown Component
function CategoryBreakdown({ data, isLoading }) {
    const colors = ["#4CAF50", "#2196F3", "#FF9800", "#E91E63", "#9C27B0", "#00BCD4", "#FF5722", "#795548"];

    const chartData = data?.map((item, index) => ({
        category: item.categoryName,
        amount: item.amount,
        color: colors[index % colors.length]
    })) || [];

    const total = chartData.reduce((sum, item) => sum + item.amount, 0);

    return (
        <Paper
            sx={{
                p: 3,
                height: "100%",
                borderRadius: 4,
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)"
            }}
        >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Spending by Category
                </Typography>
                <Chip label={`${chartData.length} Categories`} size="small" sx={{ bgcolor: "action.hover" }} />
            </Box>

            {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <Skeleton variant="circular" width={200} height={200} />
                </Box>
            ) : chartData.length > 0 ? (
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <Chart data={chartData} height={220}>
                            <PieSeries valueField="amount" argumentField="category" innerRadius={0.7} />
                            <Animation />
                            <Tooltip />
                        </Chart>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ maxHeight: 220, overflowY: "auto", pr: 1 }}>
                            {chartData.map((item, index) => (
                                <Box key={index} sx={{ mb: 2 }}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: colors[index % colors.length] }} />
                                            <Typography variant="body2" fontWeight={500}>{item.category}</Typography>
                                        </Box>
                                        <Typography variant="body2" fontWeight={600}>
                                            {((item.amount / total) * 100).toFixed(0)}%
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={(item.amount / total) * 100}
                                        sx={{
                                            height: 6,
                                            borderRadius: 3,
                                            backgroundColor: `${colors[index % colors.length]}20`,
                                            "& .MuiLinearProgress-bar": {
                                                backgroundColor: colors[index % colors.length],
                                                borderRadius: 3
                                            }
                                        }}
                                    />
                                </Box>
                            ))}
                        </Box>
                    </Grid>
                </Grid>
            ) : (
                <Box sx={{ py: 6, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Box sx={{ bgcolor: "action.hover", p: 2, borderRadius: "50%", mb: 2 }}>
                        <ArrowUpwardIcon sx={{ color: "text.secondary", opacity: 0.5 }} />
                    </Box>
                    <Typography color="text.secondary" gutterBottom>No spending data this month</Typography>
                    <Typography variant="caption" color="text.disabled">Add expenses to see breakdown</Typography>
                </Box>
            )}
        </Paper>
    );
}

// Monthly Trend Chart Component
function MonthlyTrendChart({ data, isLoading }) {
    const chartData = data?.map(item => ({
        month: dayjs().month(item.month - 1).format("MMM") + " " + item.year,
        Income: item.income,
        Expense: item.expense
    })) || [];

    return (
        <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Monthly Trend
            </Typography>
            {isLoading ? (
                <Skeleton variant="rectangular" height={250} />
            ) : chartData.length > 0 ? (
                <Chart data={chartData} height={250}>
                    <ArgumentScale factory={scaleBand} />
                    <ArgumentAxis />
                    <ValueAxis />
                    <BarSeries
                        name="Income"
                        valueField="Income"
                        argumentField="month"
                        color="#4CAF50"
                    />
                    <BarSeries
                        name="Expense"
                        valueField="Expense"
                        argumentField="month"
                        color="#f44336"
                    />
                    <Animation />
                    <Legend position="bottom" />
                    <EventTracker />
                    <Tooltip />
                </Chart>
            ) : (
                <Box sx={{ py: 4, textAlign: "center" }}>
                    <Typography color="text.secondary">No trend data available</Typography>
                </Box>
            )}
        </Paper>
    );
}

// Recent Transactions Component
function RecentTransactions({ transactions, isLoading }) {
    const user = useSelector((state) => state.auth.user);

    const getCategoryName = (categoryId) => {
        const category = user?.categories?.find(cat => cat._id === categoryId);
        return category?.label || "Uncategorized";
    };

    return (
        <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Recent Transactions
            </Typography>
            {isLoading ? (
                [...Array(5)].map((_, i) => (
                    <Skeleton key={i} variant="rectangular" height={50} sx={{ mb: 1, borderRadius: 1 }} />
                ))
            ) : transactions?.length > 0 ? (
                <List disablePadding>
                    {transactions.map((tx, index) => (
                        <React.Fragment key={tx._id}>
                            <ListItem
                                sx={{
                                    px: 0,
                                    "&:hover": { backgroundColor: "action.hover", borderRadius: 1 }
                                }}
                            >
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {tx.description || "No description"}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: 600,
                                                    color: tx.type === "income" ? "success.main" : "error.main"
                                                }}
                                            >
                                                {tx.type === "income" ? "+" : "-"}${tx.amount?.toLocaleString()}
                                            </Typography>
                                        </Box>
                                    }
                                    secondary={
                                        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
                                            <Chip
                                                label={getCategoryName(tx.category_id)}
                                                size="small"
                                                sx={{ fontSize: "0.7rem", height: 20 }}
                                            />
                                            <Typography variant="caption" color="text.secondary">
                                                {dayjs(tx.date).format("MMM D, YYYY")}
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </ListItem>
                            {index < transactions.length - 1 && <Divider />}
                        </React.Fragment>
                    ))}
                </List>
            ) : (
                <Box sx={{ py: 6, textAlign: "center" }}>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                        No recent activity
                    </Typography>
                    <Link to="/smart-entry" style={{ textDecoration: "none" }}>
                        <Button variant="contained" size="small" sx={{ mt: 1 }}>
                            Start Tracking
                        </Button>
                    </Link>
                </Box>
            )}
        </Paper>
    );
}

// Main Dashboard Component
export default function Dashboard() {
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [openForm, setOpenForm] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    async function fetchDashboardData() {
        setIsLoading(true);
        const token = Cookies.get("token");

        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/dashboard`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                const result = await res.json();
                setDashboardData(result.data);
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        }
        setIsLoading(false);
    }

    const summary = dashboardData?.summary || {};

    return (
        <Container maxWidth="lg" sx={{ py: 4, mb: 8 }}> {/* Added margin bottom for mobile nav */}
            <WelcomeTour />
            {/* Page Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Your financial overview for {dayjs().format("MMMM YYYY")}
                </Typography>
            </Box>

            {/* Quick Actions & Health Score (New) */}
            <DashboardActions onAddTransaction={() => setOpenForm(true)} />

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <SummaryCard
                        title="Total Income"
                        value={summary.totalIncome}
                        icon={<TrendingUpIcon sx={{ color: "#4CAF50", fontSize: 28 }} />}
                        color="#4CAF50"
                        change={summary.incomeChange}
                        isLoading={isLoading}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <SummaryCard
                        title="Total Expenses"
                        value={summary.totalExpenses}
                        icon={<TrendingDownIcon sx={{ color: "#f44336", fontSize: 28 }} />}
                        color="#f44336"
                        change={summary.expenseChange}
                        isLoading={isLoading}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <SummaryCard
                        title="Net Savings"
                        value={summary.netSavings}
                        icon={<SavingsIcon sx={{ color: "#2196F3", fontSize: 28 }} />}
                        color="#2196F3"
                        isLoading={isLoading}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <SummaryCard
                        title="Transactions"
                        value={summary.transactionCount}
                        icon={<AccountBalanceWalletIcon sx={{ color: "#9C27B0", fontSize: 28 }} />}
                        color="#9C27B0"
                        isLoading={isLoading}
                    />
                </Grid>
            </Grid>

            {/* Charts Row */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={5}>
                    <CategoryBreakdown
                        data={dashboardData?.categoryBreakdown}
                        isLoading={isLoading}
                    />
                </Grid>
                <Grid item xs={12} md={7}>
                    <MonthlyTrendChart
                        data={dashboardData?.monthlyTrend}
                        isLoading={isLoading}
                    />
                </Grid>
            </Grid>

            {/* Recent Transactions */}
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <RecentTransactions
                        transactions={dashboardData?.recentTransactions}
                        isLoading={isLoading}
                    />
                </Grid>
            </Grid>

            {/* Transaction Form Dialog (Reused from Home) */}
            <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add New Transaction</DialogTitle>
                <DialogContent>
                    <TransactionForm
                        fetchTransactions={() => {
                            fetchDashboardData();
                            setOpenForm(false);
                        }}
                    />
                </DialogContent>
            </Dialog>
        </Container>
    );
}
