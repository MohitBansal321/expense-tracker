// Reports page with modern Shadcn UI
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { BarChart3, Calendar, Printer, TrendingUp, TrendingDown } from "lucide-react";

// Shadcn UI Components
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "../components/ui/dialog";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

// DevExpress Charts
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
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

export default function Reports() {
    const [tabValue, setTabValue] = useState("monthly");
    const [selectedMonth, setSelectedMonth] = useState(
        new Date().getMonth() + 1
    );
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [monthlyData, setMonthlyData] = useState(null);
    const [yearlyData, setYearlyData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Drill Down State
    const [drillDownOpen, setDrillDownOpen] = useState(false);
    const [drillDownData, setDrillDownData] = useState([]);
    const [drillDownTitle, setDrillDownTitle] = useState("");
    const [isDrillLoading, setIsDrillLoading] = useState(false);

    async function handleDrillDown({ type, value }) {
        setDrillDownOpen(true);
        setIsDrillLoading(true);
        setDrillDownData([]);

        const token = Cookies.get("token");
        let queryParams = "";
        let title = "";

        if (type === "day") {
            const day = value;
            title = `Transactions on ${new Date(
                selectedYear,
                selectedMonth - 1,
                day
            ).toLocaleDateString()}`;
            const startDate = new Date(
                selectedYear,
                selectedMonth - 1,
                day
            ).toISOString();
            const endDate = new Date(
                selectedYear,
                selectedMonth - 1,
                day,
                23,
                59,
                59
            ).toISOString();
            queryParams = `startDate=${startDate}&endDate=${endDate}`;
        }

        try {
            const res = await fetch(
                `${import.meta.env.VITE_BASE_URL}/transaction/search?${queryParams}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
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
        if (tabValue === "monthly") {
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
            <Card>
                <CardContent className="p-5">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">{title}</p>
                            <p className="text-2xl font-bold">
                                ${typeof value === "number" ? value.toLocaleString() : value}
                            </p>
                            {change !== undefined && (
                                <Badge
                                    variant={isPositive ? "default" : " destructive"}
                                    className="mt-2 gap-1"
                                >
                                    {isPositive ? (
                                        <TrendingUp className="h-3 w-3" />
                                    ) : (
                                        <TrendingDown className="h-3 w-3" />
                                    )}
                                    {change > 0 ? "+" : ""}
                                    {change}%
                                </Badge>
                            )}
                        </div>
                        <div className="text-muted-foreground">{icon}</div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="container max-w-7xl mx-auto py-6 px-4 print-container">
            {/* Header */}
            <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <BarChart3 className="h-8 w-8" />
                    <h1 className="text-4xl font-bold">Reports</h1>
                </div>
                <div className="flex gap-3 items-center flex-wrap">
                    <div className="w-28">
                        <Select
                            value={selectedYear.toString()}
                            onValueChange={(v) => setSelectedYear(parseInt(v))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((y) => (
                                    <SelectItem key={y} value={y.toString()}>
                                        {y}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {tabValue === "monthly" && (
                        <div className="w-36">
                            <Select
                                value={selectedMonth.toString()}
                                onValueChange={(v) => setSelectedMonth(parseInt(v))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {MONTHS.map((m, i) => (
                                        <SelectItem key={i} value={(i + 1).toString()}>
                                            {m}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    <Button variant="outline" onClick={handlePrint} className="gap-2">
                        <Printer className="h-4 w-4" />
                        Print
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={tabValue} onValueChange={setTabValue} className="mb-6">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="monthly" className="gap-2">
                        <Calendar className="h-4 w-4" />
                        Monthly Report
                    </TabsTrigger>
                    <TabsTrigger value="yearly" className="gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Yearly Report
                    </TabsTrigger>
                </TabsList>

                {/* Monthly Report */}
                <TabsContent value="monthly" className="space-y-4 mt-6">
                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <Skeleton key={i} className="h-32" />
                            ))}
                        </div>
                    ) : monthlyData ? (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <SummaryCard
                                    title="Total Income"
                                    value={monthlyData.summary.totalIncome}
                                    change={monthlyData.summary.incomeChange}
                                    isPositive={monthlyData.summary.incomeChange >= 0}
                                />
                                <SummaryCard
                                    title="Total Expenses"
                                    value={monthlyData.summary.totalExpenses}
                                    change={monthlyData.summary.expenseChange}
                                    isPositive={monthlyData.summary.expenseChange <= 0}
                                />
                                <SummaryCard
                                    title="Net Savings"
                                    value={monthlyData.summary.netSavings}
                                    isPositive={monthlyData.summary.netSavings >= 0}
                                />
                                <SummaryCard
                                    title="Transactions"
                                    value={monthlyData.summary.transactionCount}
                                />
                            </div>

                            {/* Daily Trend Chart */}
                            <Card>
                                <CardContent className="p-5">
                                    <h2 className="text-xl font-semibold mb-4">
                                        Daily Spending Trend
                                    </h2>
                                    {monthlyData.dailyData.length > 0 ? (
                                        <Chart data={monthlyData.dailyData} height={300}>
                                            <ArgumentAxis />
                                            <ValueAxis />
                                            <BarSeries
                                                name="Expense"
                                                valueField="expense"
                                                argumentField="day"
                                                color="#ef4444"
                                                pointComponent={(props) => (
                                                    <BarSeries.Point
                                                        {...props}
                                                        style={{ cursor: "pointer" }}
                                                        onClick={() =>
                                                            handleDrillDown({ type: "day", value: props.arg })
                                                        }
                                                    />
                                                )}
                                            />
                                            <BarSeries
                                                name="Income"
                                                valueField="income"
                                                argumentField="day"
                                                color="#22c55e"
                                                pointComponent={(props) => (
                                                    <BarSeries.Point
                                                        {...props}
                                                        style={{ cursor: "pointer" }}
                                                        onClick={() =>
                                                            handleDrillDown({ type: "day", value: props.arg })
                                                        }
                                                    />
                                                )}
                                            />
                                            <Legend />
                                        </Chart>
                                    ) : (
                                        <p className="text-center text-muted-foreground py-8">
                                            No data for this month
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Category Breakdown & Top Expenses */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <Card>
                                    <CardContent className="p-5">
                                        <h2 className="text-xl font-semibold mb-4">
                                            Spending by Category
                                        </h2>
                                        {monthlyData.categoryBreakdown.length > 0 ? (
                                            <div className="space-y-4">
                                                {monthlyData.categoryBreakdown.map((cat, i) => (
                                                    <div key={i}>
                                                        <div className="flex justify-between mb-1.5 text-sm">
                                                            <span>
                                                                {cat.icon} {cat.category}
                                                            </span>
                                                            <span className="font-semibold">
                                                                ${cat.amount.toFixed(2)}
                                                            </span>
                                                        </div>
                                                        <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                                                            <div
                                                                className="h-full bg-primary transition-all rounded-full"
                                                                style={{
                                                                    width: `${(cat.amount /
                                                                            monthlyData.summary.totalExpenses) *
                                                                        100
                                                                        }%`,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground">No expense data</p>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-5">
                                        <h2 className="text-xl font-semibold mb-4">
                                            Top 5 Expenses
                                        </h2>
                                        {monthlyData.topExpenses.length > 0 ? (
                                            <div className="space-y-3">
                                                {monthlyData.topExpenses.map((exp, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex justify-between py-2 border-b last:border-0"
                                                    >
                                                        <div>
                                                            <p className="font-medium">{exp.description}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {exp.category}
                                                            </p>
                                                        </div>
                                                        <p className="font-semibold text-destructive">
                                                            ${exp.amount.toFixed(2)}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground">No expenses</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </>
                    ) : (
                        <p className="text-center text-muted-foreground">
                            No data available
                        </p>
                    )}
                </TabsContent>

                {/* Yearly Report */}
                <TabsContent value="yearly" className="space-y-4 mt-6">
                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <Skeleton key={i} className="h-32" />
                            ))}
                        </div>
                    ) : yearlyData ? (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <SummaryCard
                                    title="Total Income"
                                    value={yearlyData.summary.totalIncome}
                                />
                                <SummaryCard
                                    title="Total Expenses"
                                    value={yearlyData.summary.totalExpenses}
                                />
                                <SummaryCard
                                    title="Net Savings"
                                    value={yearlyData.summary.netSavings}
                                    isPositive={yearlyData.summary.netSavings >= 0}
                                />
                                <SummaryCard
                                    title="Avg Monthly Expense"
                                    value={yearlyData.summary.averageMonthlyExpense}
                                />
                            </div>

                            {/* Monthly Trend Chart */}
                            <Card>
                                <CardContent className="p-5">
                                    <h2 className="text-xl font-semibold mb-4">
                                        Monthly Trend
                                    </h2>
                                    <Chart data={yearlyData.monthlyData} height={300}>
                                        <ArgumentAxis />
                                        <ValueAxis />
                                        <LineSeries
                                            name="Income"
                                            valueField="income"
                                            argumentField="monthName"
                                            color="#22c55e"
                                        />
                                        <LineSeries
                                            name="Expense"
                                            valueField="expense"
                                            argumentField="monthName"
                                            color="#ef4444"
                                        />
                                        <Legend />
                                        <Title text={`${selectedYear} Overview`} />
                                    </Chart>
                                </CardContent>
                            </Card>

                            {/* Insights & Category Breakdown */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <Card>
                                    <CardContent className="p-5">
                                        <h2 className="text-xl font-semibold mb-4">Insights</h2>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-1">
                                                    Best Month
                                                </p>
                                                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                                                    {yearlyData.insights.bestMonth} (+$
                                                    {yearlyData.insights.bestMonthSavings.toLocaleString()}
                                                    )
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-1">
                                                    Worst Month
                                                </p>
                                                <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                                                    {yearlyData.insights.worstMonth} ($
                                                    {yearlyData.insights.worstMonthDeficit.toLocaleString()}
                                                    )
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-1">
                                                    Top Category
                                                </p>
                                                <p className="text-lg font-semibold">
                                                    {yearlyData.insights.topCategory} ($
                                                    {yearlyData.insights.topCategoryAmount.toLocaleString()}
                                                    )
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="lg:col-span-2">
                                    <CardContent className="p-5">
                                        <h2 className="text-xl font-semibold mb-4">
                                            Yearly Category Breakdown
                                        </h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {yearlyData.categoryBreakdown.slice(0, 8).map((cat, i) => (
                                                <div key={i}>
                                                    <div className="flex justify-between py-1.5">
                                                        <span className="text-sm">
                                                            {cat.icon} {cat.category}
                                                        </span>
                                                        <span className="text-sm font-semibold">
                                                            ${cat.amount.toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                                                        <div
                                                            className="h-full bg-primary transition-all rounded-full"
                                                            style={{
                                                                width: `${(cat.amount /
                                                                        yearlyData.summary.totalExpenses) *
                                                                    100
                                                                    }%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </>
                    ) : (
                        <p className="text-center text-muted-foreground">
                            No data available
                        </p>
                    )}
                </TabsContent>
            </Tabs>

            {/* Drill Down Dialog */}
            <DrillDownDialog
                open={drillDownOpen}
                onClose={() => setDrillDownOpen(false)}
                title={drillDownTitle}
                transactions={drillDownData}
                isLoading={isDrillLoading}
            />
        </div>
    );
}

function DrillDownDialog({ open, onClose, title, transactions, isLoading }) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div className="max-h-96 overflow-y-auto">
                    {isLoading ? (
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <Skeleton key={i} className="h-16" />
                            ))}
                        </div>
                    ) : transactions.length > 0 ? (
                        <div className="space-y-2">
                            {transactions.map((tx) => (
                                <div
                                    key={tx._id}
                                    className="flex justify-between py-3 border-b last:border-0"
                                >
                                    <div>
                                        <p className="font-medium">{tx.description}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(tx.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <p
                                        className={`font-semibold ${tx.type === "income"
                                                ? "text-green-600 dark:text-green-400"
                                                : "text-red-600 dark:text-red-400"
                                            }`}
                                    >
                                        {tx.type === "income" ? "+" : "-"}${tx.amount.toFixed(2)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-8">
                            No transactions found.
                        </p>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
