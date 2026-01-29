// Dashboard page with analytics and insights - Modern UI Revamp
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Cookies from "js-cookie";
import dayjs from "dayjs";
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    PiggyBank,
    ArrowUp,
    ArrowDown
} from "lucide-react";
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

// Shadcn UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";

// ReactBits Animations
import { CountUp } from "../components/animations/count-up";
import { ElectricBorder } from "../components/animations/electric-border";
import { AnimatedList } from "../components/animations/animated-list";

// Existing components
import WelcomeTour from "../components/WelcomeTour";
import DashboardActions from "../components/DashboardActions";
import TransactionForm from "../components/TransactionForm";

// Summary Card Component with Modern Design
function SummaryCard({ title, value, icon: Icon, color, change, isLoading, highlight = false }) {
    const isPositive = change >= 0;

    const CardWrapper = highlight ? ElectricBorder : React.Fragment;
    const borderProps = highlight ? { borderColor: `${color}80`, glowColor: `${color}50` } : {};

    const cardContent = (
        <Card className="h-full overflow-hidden border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                            {title}
                        </p>
                        {isLoading ? (
                            <Skeleton className="h-10 w-32" />
                        ) : (
                            <div className="text-4xl font-bold mb-2" style={{ color }}>
                                $<CountUp value={value || 0} duration={1.5} />
                            </div>
                        )}
                        {change !== undefined && !isLoading && (
                            <div className="flex items-center gap-1 mt-2">
                                {isPositive ? (
                                    <ArrowUp className="h-4 w-4 text-success" />
                                ) : (
                                    <ArrowDown className="h-4 w-4 text-error" />
                                )}
                                <span className={`text-xs font-medium ${isPositive ? 'text-success' : 'text-error'}`}>
                                    {Math.abs(change)}% vs last month
                                </span>
                            </div>
                        )}
                    </div>
                    <div
                        className="p-3 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${color}20` }}
                    >
                        <Icon className="h-7 w-7" style={{ color }} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return highlight ? <CardWrapper {...borderProps}>{cardContent}</CardWrapper> : cardContent;
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
        <Card className="h-full border shadow-sm">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-bold">Spending by Category</CardTitle>
                    <Badge variant="secondary">{chartData.length} Categories</Badge>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Skeleton className="h-48 w-48 rounded-full" />
                    </div>
                ) : chartData.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <div>
                            <Chart data={chartData} height={220}>
                                <PieSeries valueField="amount" argumentField="category" innerRadius={0.7} />
                                <Animation />
                                <Tooltip />
                            </Chart>
                        </div>
                        <div className="max-h-56 overflow-y-auto pr-2 space-y-3">
                            {chartData.map((item, index) => (
                                <div key={index} className="space-y-1">
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-2 h-2 rounded-full"
                                                style={{ backgroundColor: colors[index % colors.length] }}
                                            />
                                            <span className="font-medium">{item.category}</span>
                                        </div>
                                        <span className="font-semibold">
                                            {((item.amount / total) * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                width: `${(item.amount / total) * 100}%`,
                                                backgroundColor: colors[index % colors.length]
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="py-12 text-center">
                        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                            <TrendingUp className="h-6 w-6 text-muted-foreground opacity-50" />
                        </div>
                        <p className="text-muted-foreground font-medium mb-1">No spending data this month</p>
                        <p className="text-xs text-muted-foreground">Add expenses to see breakdown</p>
                    </div>
                )}
            </CardContent>
        </Card>
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
        <Card className="h-full border shadow-sm">
            <CardHeader>
                <CardTitle className="text-xl font-bold">Monthly Trend</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className="h-64 w-full" />
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
                    <div className="py-12 text-center">
                        <p className="text-muted-foreground">No trend data available</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// Recent Transactions Component with Animated List
function RecentTransactions({ transactions, isLoading }) {
    const user = useSelector((state) => state.auth.user);

    const getCategoryName = (categoryId) => {
        const category = user?.categories?.find(cat => cat._id === categoryId);
        return category?.label || "Uncategorized";
    };

    return (
        <Card className="h-full border shadow-sm">
            <CardHeader>
                <CardTitle className="text-xl font-bold">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-14 w-full rounded-lg" />
                        ))}
                    </div>
                ) : transactions?.length > 0 ? (
                    <AnimatedList className="space-y-2">
                        {transactions.map((tx) => (
                            <div
                                key={tx._id}
                                className="p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer border border-transparent hover:border-border"
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <p className="font-medium text-sm">{tx.description || "No description"}</p>
                                    <p className={`font-semibold text-sm ${tx.type === "income" ? "text-success" : "text-error"}`}>
                                        {tx.type === "income" ? "+" : "-"}$<CountUp value={tx.amount || 0} duration={0.8} />
                                    </p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <Badge variant="outline" className="text-xs">
                                        {getCategoryName(tx.category_id)}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                        {dayjs(tx.date).format("MMM D, YYYY")}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </AnimatedList>
                ) : (
                    <div className="py-12 text-center">
                        <p className="text-muted-foreground font-medium mb-3">No recent activity</p>
                        <Link to="/smart-entry">
                            <Button size="sm">Start Tracking</Button>
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
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
        <div className="container mx-auto py-6 px-4 mb-20">
            <WelcomeTour />

            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-4xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                    Your financial overview for {dayjs().format("MMMM YYYY")}
                </p>
            </div>

            {/* Quick Actions & Health Score */}
            <DashboardActions onAddTransaction={() => setOpenForm(true)} />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <SummaryCard
                    title="Total Income"
                    value={summary.totalIncome}
                    icon={TrendingUp}
                    color="#4CAF50"
                    change={summary.incomeChange}
                    isLoading={isLoading}
                />
                <SummaryCard
                    title="Total Expenses"
                    value={summary.totalExpenses}
                    icon={TrendingDown}
                    color="#f44336"
                    change={summary.expenseChange}
                    isLoading={isLoading}
                />
                <SummaryCard
                    title="Net Savings"
                    value={summary.netSavings}
                    icon={PiggyBank}
                    color="#2196F3"
                    isLoading={isLoading}
                    highlight={true}
                />
                <SummaryCard
                    title="Transactions"
                    value={summary.transactionCount}
                    icon={Wallet}
                    color="#9C27B0"
                    isLoading={isLoading}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
                <div className="lg:col-span-5">
                    <CategoryBreakdown
                        data={dashboardData?.categoryBreakdown}
                        isLoading={isLoading}
                    />
                </div>
                <div className="lg:col-span-7">
                    <MonthlyTrendChart
                        data={dashboardData?.monthlyTrend}
                        isLoading={isLoading}
                    />
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="grid grid-cols-1">
                <RecentTransactions
                    transactions={dashboardData?.recentTransactions}
                    isLoading={isLoading}
                />
            </div>

            {/* Transaction Form Dialog */}
            <Dialog open={openForm} onOpenChange={setOpenForm}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add New Transaction</DialogTitle>
                    </DialogHeader>
                    <TransactionForm
                        fetchTransactions={() => {
                            fetchDashboardData();
                            setOpenForm(false);
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
