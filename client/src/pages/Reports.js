import AssessmentIcon from "@mui/icons-material/Assessment";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PrintIcon from "@mui/icons-material/Print";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import LinearProgress from "@mui/material/LinearProgress";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Skeleton from "@mui/material/Skeleton";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import {
    ArgumentAxis,
    BarSeries,
    Chart,
    Legend,
    LineSeries,
    Title,
    ValueAxis,
} from "@devexpress/dx-react-chart-material-ui";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export default function Reports() {
    const [tabValue, setTabValue] = useState(0);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [monthlyData, setMonthlyData] = useState(null);
    const [yearlyData, setYearlyData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Drill Down State
    const [drillDownOpen, setDrillDownOpen] = useState(false);
    const [drillDownData, setDrillDownData] = useState([]);
    const [drillDownTitle, setDrillDownTitle] = useState("");
    const [isDrillLoading, setIsDrillLoading] = useState(false);

    async function handleDrillDown({ type, value, categoryId }) {
        setDrillDownOpen(true);
        setIsDrillLoading(true);
        setDrillDownData([]);

        const token = Cookies.get("token");
        let queryParams = "";
        let title = "";

        if (type === "category") {
            // value is category name
            title = `Transactions for ${value}`;
            // We need start/end date for the current view (month or year)
            const year = selectedYear;
            const month = tabValue === 0 ? selectedMonth : null;

            let startDate, endDate;
            if (month) {
                startDate = new Date(year, month - 1, 1).toISOString();
                endDate = new Date(year, month, 0).toISOString();
            } else {
                startDate = new Date(year, 0, 1).toISOString();
                endDate = new Date(year, 11, 31).toISOString();
            }

            // We need category ID. In the chart data we might need to embed it. 
            // The API response for categoryBreakdown doesn't have ID in the mapped array currently?
            // Wait, ReportsController sends icon and label. We might need to adjust ReportsController to send ID too.
            // For now, let's assume we can pass categoryId if available.
        }

        if (type === "day") {
            const day = value;
            title = `Transactions on ${new Date(selectedYear, selectedMonth - 1, day).toLocaleDateString()}`;
            const startDate = new Date(selectedYear, selectedMonth - 1, day).toISOString();
            const endDate = new Date(selectedYear, selectedMonth - 1, day, 23, 59, 59).toISOString();
            queryParams = `startDate=${startDate}&endDate=${endDate}`;
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/transaction/search?${queryParams}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const result = await res.json();
            if (result.success) {
                setDrillDownData(result.data);
                setDrillDownTitle(title);
            }
        } catch (error) {
            console.error("Drill down error", error);
        } finally {
            setIsDrillLoading(false);
        }
    }

    const years = [];
    for (let y = new Date().getFullYear(); y >= 2020; y--) years.push(y);

    useEffect(() => {
        if (tabValue === 0) {
            fetchMonthlyReport();
        } else {
            fetchYearlyReport();
        }
    }, [tabValue, selectedMonth, selectedYear]);

    async function fetchMonthlyReport() {
        setIsLoading(true);
        const token = Cookies.get("token");
        try {
            const res = await fetch(
                `${import.meta.env.VITE_BASE_URL}/reports/monthly?month=${selectedMonth}&year=${selectedYear}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const result = await res.json();
            if (result.success) {
                setMonthlyData(result.data);
            }
        } catch (error) {
            console.error("Failed to fetch monthly report:", error);
        } finally {
            setIsLoading(false);
        }
    }

    async function fetchYearlyReport() {
        setIsLoading(true);
        const token = Cookies.get("token");
        try {
            const res = await fetch(
                `${import.meta.env.VITE_BASE_URL}/reports/yearly?year=${selectedYear}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const result = await res.json();
            if (result.success) {
                setYearlyData(result.data);
            }
        } catch (error) {
            console.error("Failed to fetch yearly report:", error);
        } finally {
            setIsLoading(false);
        }
    }

    function handlePrint() {
        window.print();
    }

    function SummaryCard({ title, value, change, isPositive, icon }) {
        return (
            <Card sx={{ height: "100%" }}>
                <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <Box>
                            <Typography color="text.secondary" variant="body2">{title}</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
                                ${typeof value === 'number' ? value.toLocaleString() : value}
                            </Typography>
                            {change !== undefined && (
                                <Chip
                                    size="small"
                                    icon={isPositive ? <TrendingUpIcon /> : <TrendingDownIcon />}
                                    label={`${change > 0 ? "+" : ""}${change}%`}
                                    color={isPositive ? "success" : "error"}
                                    sx={{ mt: 1 }}
                                />
                            )}
                        </Box>
                        {icon}
                    </Box>
                </CardContent>
            </Card>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 3 }} className="print-container">
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
                    <AssessmentIcon fontSize="large" /> Reports
                </Typography>
                <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
                    <FormControl size="small" sx={{ minWidth: 100 }}>
                        <InputLabel>Year</InputLabel>
                        <Select value={selectedYear} label="Year" onChange={(e) => setSelectedYear(e.target.value)}>
                            {years.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                        </Select>
                    </FormControl>
                    {tabValue === 0 && (
                        <FormControl size="small" sx={{ minWidth: 130 }}>
                            <InputLabel>Month</InputLabel>
                            <Select value={selectedMonth} label="Month" onChange={(e) => setSelectedMonth(e.target.value)}>
                                {MONTHS.map((m, i) => <MenuItem key={i} value={i + 1}>{m}</MenuItem>)}
                            </Select>
                        </FormControl>
                    )}
                    <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>
                        Print
                    </Button>
                </Box>
            </Box>

            {/* Tabs */}
            <Paper sx={{ mb: 3 }}>
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} centered>
                    <Tab icon={<CalendarTodayIcon />} label="Monthly Report" />
                    <Tab icon={<AssessmentIcon />} label="Yearly Report" />
                </Tabs>
            </Paper>

            {/* Monthly Report */}
            {tabValue === 0 && (
                <>
                    {isLoading ? (
                        <Grid container spacing={2}>
                            {[...Array(4)].map((_, i) => <Grid item xs={12} sm={6} md={3} key={i}><Skeleton variant="rounded" height={120} /></Grid>)}
                            <Grid item xs={12}><Skeleton variant="rounded" height={300} /></Grid>
                        </Grid>
                    ) : monthlyData ? (
                        <>
                            {/* Summary Cards */}
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <SummaryCard
                                        title="Total Income"
                                        value={monthlyData.summary.totalIncome}
                                        change={monthlyData.summary.incomeChange}
                                        isPositive={monthlyData.summary.incomeChange >= 0}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <SummaryCard
                                        title="Total Expenses"
                                        value={monthlyData.summary.totalExpenses}
                                        change={monthlyData.summary.expenseChange}
                                        isPositive={monthlyData.summary.expenseChange <= 0}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <SummaryCard
                                        title="Net Savings"
                                        value={monthlyData.summary.netSavings}
                                        isPositive={monthlyData.summary.netSavings >= 0}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <SummaryCard
                                        title="Transactions"
                                        value={monthlyData.summary.transactionCount}
                                    />
                                </Grid>
                            </Grid>

                            {/* Daily Trend Chart */}
                            <Paper sx={{ p: 2, mb: 3 }}>
                                <Typography variant="h6" sx={{ mb: 2 }}>Daily Spending Trend</Typography>
                                {monthlyData.dailyData.length > 0 ? (
                                    <Chart data={monthlyData.dailyData} height={300}>
                                        <ArgumentAxis />
                                        <ValueAxis />
                                        <BarSeries
                                            name="Expense"
                                            valueField="expense"
                                            argumentField="day"
                                            color="#f44336"
                                            pointComponent={(props) => (
                                                <BarSeries.Point
                                                    {...props}
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => handleDrillDown({ type: 'day', value: props.arg })}
                                                />
                                            )}
                                        />
                                        <BarSeries
                                            name="Income"
                                            valueField="income"
                                            argumentField="day"
                                            color="#4CAF50"
                                            pointComponent={(props) => (
                                                <BarSeries.Point
                                                    {...props}
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => handleDrillDown({ type: 'day', value: props.arg })}
                                                />
                                            )}
                                        />
                                        <Legend />
                                    </Chart>
                                ) : (
                                    <Typography color="text.secondary" textAlign="center" py={4}>No data for this month</Typography>
                                )}
                            </Paper>

                            {/* Category Breakdown & Top Expenses */}
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 2, height: "100%" }}>
                                        <Typography variant="h6" sx={{ mb: 2 }}>Spending by Category</Typography>
                                        {monthlyData.categoryBreakdown.length > 0 ? (
                                            monthlyData.categoryBreakdown.map((cat, i) => (
                                                <Box key={i} sx={{ mb: 2 }}>
                                                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                                                        <Typography variant="body2">{cat.icon} {cat.category}</Typography>
                                                        <Typography variant="body2" fontWeight={600}>${cat.amount.toFixed(2)}</Typography>
                                                    </Box>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={(cat.amount / monthlyData.summary.totalExpenses) * 100}
                                                        sx={{ height: 8, borderRadius: 4 }}
                                                    />
                                                </Box>
                                            ))
                                        ) : (
                                            <Typography color="text.secondary">No expense data</Typography>
                                        )}
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 2, height: "100%" }}>
                                        <Typography variant="h6" sx={{ mb: 2 }}>Top 5 Expenses</Typography>
                                        {monthlyData.topExpenses.length > 0 ? (
                                            monthlyData.topExpenses.map((exp, i) => (
                                                <Box key={i} sx={{ display: "flex", justifyContent: "space-between", py: 1, borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight={600}>{exp.description}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{exp.category}</Typography>
                                                    </Box>
                                                    <Typography variant="body2" color="error" fontWeight={600}>${exp.amount.toFixed(2)}</Typography>
                                                </Box>
                                            ))
                                        ) : (
                                            <Typography color="text.secondary">No expenses</Typography>
                                        )}
                                    </Paper>
                                </Grid>
                            </Grid>
                        </>
                    ) : (
                        <Typography>No data available</Typography>
                    )}
                </>
            )}

            {/* Yearly Report */}
            {tabValue === 1 && (
                <>
                    {isLoading ? (
                        <Grid container spacing={2}>
                            {[...Array(4)].map((_, i) => <Grid item xs={12} sm={6} md={3} key={i}><Skeleton variant="rounded" height={120} /></Grid>)}
                            <Grid item xs={12}><Skeleton variant="rounded" height={300} /></Grid>
                        </Grid>
                    ) : yearlyData ? (
                        <>
                            {/* Summary Cards */}
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <SummaryCard title="Total Income" value={yearlyData.summary.totalIncome} />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <SummaryCard title="Total Expenses" value={yearlyData.summary.totalExpenses} />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <SummaryCard title="Net Savings" value={yearlyData.summary.netSavings} isPositive={yearlyData.summary.netSavings >= 0} />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <SummaryCard title="Avg Monthly Expense" value={yearlyData.summary.averageMonthlyExpense} />
                                </Grid>
                            </Grid>

                            {/* Monthly Trend Chart */}
                            <Paper sx={{ p: 2, mb: 3 }}>
                                <Typography variant="h6" sx={{ mb: 2 }}>Monthly Trend</Typography>
                                <Chart data={yearlyData.monthlyData} height={300}>
                                    <ArgumentAxis />
                                    <ValueAxis />
                                    <LineSeries name="Income" valueField="income" argumentField="monthName" color="#4CAF50" />
                                    <LineSeries name="Expense" valueField="expense" argumentField="monthName" color="#f44336" />
                                    <Legend />
                                    <Title text={`${selectedYear} Overview`} />
                                </Chart>
                            </Paper>

                            {/* Insights & Category Breakdown */}
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                    <Paper sx={{ p: 2, height: "100%" }}>
                                        <Typography variant="h6" sx={{ mb: 2 }}>Insights</Typography>
                                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">Best Month</Typography>
                                                <Typography variant="h6" color="success.main">
                                                    {yearlyData.insights.bestMonth} (+${yearlyData.insights.bestMonthSavings.toLocaleString()})
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">Worst Month</Typography>
                                                <Typography variant="h6" color="error.main">
                                                    {yearlyData.insights.worstMonth} (${yearlyData.insights.worstMonthDeficit.toLocaleString()})
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">Top Category</Typography>
                                                <Typography variant="h6">
                                                    {yearlyData.insights.topCategory} (${yearlyData.insights.topCategoryAmount.toLocaleString()})
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} md={8}>
                                    <Paper sx={{ p: 2, height: "100%" }}>
                                        <Typography variant="h6" sx={{ mb: 2 }}>Yearly Category Breakdown</Typography>
                                        <Grid container spacing={1}>
                                            {yearlyData.categoryBreakdown.slice(0, 8).map((cat, i) => (
                                                <Grid item xs={6} key={i}>
                                                    <Box sx={{ display: "flex", justifyContent: "space-between", py: 1 }}>
                                                        <Typography variant="body2">{cat.icon} {cat.category}</Typography>
                                                        <Typography variant="body2" fontWeight={600}>${cat.amount.toLocaleString()}</Typography>
                                                    </Box>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={(cat.amount / yearlyData.summary.totalExpenses) * 100}
                                                        sx={{ height: 6, borderRadius: 3 }}
                                                    />
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </>
                    ) : (
                        <Typography>No data available</Typography>
                    )}
                </>
            )}
            <DrillDownDialog
                open={drillDownOpen}
                onClose={() => setDrillDownOpen(false)}
                title={drillDownTitle}
                transactions={drillDownData}
                isLoading={isDrillLoading}
            />
        </Container>
    );
}

function DrillDownDialog({ open, onClose, title, transactions, isLoading }) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent dividers>
                {isLoading ? (
                    [...Array(3)].map((_, i) => <Skeleton key={i} height={60} />)
                ) : transactions.length > 0 ? (
                    transactions.map((tx) => (
                        <Box key={tx._id} sx={{ display: "flex", justifyContent: "space-between", py: 1.5, borderBottom: "1px solid #eee" }}>
                            <Box>
                                <Typography variant="body1" fontWeight={500}>{tx.description}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {new Date(tx.date).toLocaleDateString()}
                                </Typography>
                            </Box>
                            <Typography
                                variant="body1"
                                fontWeight={600}
                                color={tx.type === "income" ? "success.main" : "error.main"}
                            >
                                {tx.type === "income" ? "+" : "-"}${tx.amount.toFixed(2)}
                            </Typography>
                        </Box>
                    ))
                ) : (
                    <Typography textAlign="center" color="text.secondary" py={4}>
                        No transactions found.
                    </Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
