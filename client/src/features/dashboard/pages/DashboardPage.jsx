// Dashboard page with analytics and insights - Modern UI Revamp
import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Cookies from "js-cookie";
import dayjs from "dayjs";
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    PiggyBank,
    History as HistoryIcon,
    ArrowUp,
    ArrowDown,
    Search,
    ChevronRight,
    Calendar,
    Sparkles
} from "lucide-react";
import { 
    ResponsiveContainer, 
    PieChart, 
    Pie, 
    Cell, 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip as RechartsTooltip, 
    Legend
} from "recharts";

// Shadcn UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// ReactBits Animations
import { CountUp } from "@/components/animations/count-up";
import { ElectricBorder } from "@/components/animations/electric-border";
import { AnimatedList } from "@/components/animations/animated-list";

// Existing components
import WelcomeTour from "@/components/common/WelcomeTour";
import DashboardActions from "../components/DashboardActions";
import TransactionForm from "@/features/transactions/components/TransactionForm";
import { cn } from "@/lib/utils";

// Summary Card Component with Modern Design
function SummaryCard({ title, value, icon: Icon, color, change, isLoading, highlight = false }) {
    const isPositive = change >= 0;

    const CardWrapper = highlight ? ElectricBorder : React.Fragment;
    const borderProps = highlight ? { borderColor: `${color}80`, glowColor: `${color}50` } : {};

    const cardContent = (
        <Card className="h-full overflow-hidden border bg-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
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
                                    <ArrowUp className="h-4 w-4 text-green-500" />
                                ) : (
                                    <ArrowDown className="h-4 w-4 text-red-500" />
                                )}
                                <span className={cn("text-xs font-medium", isPositive ? 'text-green-500' : 'text-red-500')}>
                                    {Math.abs(change)}% vs last month
                                </span>
                            </div>
                        )}
                    </div>
                    <div
                        className="p-3 rounded-2xl flex items-center justify-center shadow-inner"
                        style={{ backgroundColor: `${color}15` }}
                    >
                        <Icon className="h-8 w-8" style={{ color }} />
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

    const chartData = useMemo(() => data?.map((item, index) => ({
        name: item.categoryName,
        value: item.amount,
        color: colors[index % colors.length]
    })) || [], [data]);

    const total = useMemo(() => chartData.reduce((sum, item) => sum + item.value, 0), [chartData]);

    return (
        <Card className="h-full border shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <PiggyBank className="w-5 h-5 text-indigo-500" /> Spending by Category
                    </CardTitle>
                    <Badge variant="secondary" className="rounded-full">
                        {chartData.length} Categories
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Skeleton className="h-48 w-48 rounded-full" />
                    </div>
                ) : chartData.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip 
                                        contentStyle={{ 
                                            borderRadius: '16px', 
                                            border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))',
                                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                                        }} 
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="max-h-64 overflow-y-auto pr-2 space-y-4">
                            {chartData.map((item, index) => (
                                <div key={index} className="space-y-1.5 group cursor-default">
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-2.5 h-2.5 rounded-full shadow-sm group-hover:scale-125 transition-transform"
                                                style={{ backgroundColor: item.color }}
                                            />
                                            <span className="font-semibold text-gray-700 dark:text-gray-300">{item.name}</span>
                                        </div>
                                        <span className="font-bold text-gray-900 dark:text-white">
                                            {((item.value / total) * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-1000 ease-out"
                                            style={{
                                                width: `${(item.value / total) * 100}%`,
                                                backgroundColor: item.color
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="py-12 text-center">
                        <div className="mx-auto w-16 h-16 rounded-3xl bg-gray-50 flex items-center justify-center mb-4 text-gray-400">
                            <Search className="h-8 w-8 opacity-20" />
                        </div>
                        <p className="text-gray-500 font-semibold mb-1">No spending data this month</p>
                        <p className="text-xs text-gray-400">Add expenses to see breakdown</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// Monthly Trend Chart Component
function MonthlyTrendChart({ data, isLoading }) {
    const chartData = useMemo(() => data?.map(item => ({
        month: dayjs().month(item.month - 1).format("MMM"),
        Income: item.income,
        Expense: item.expense
    })) || [], [data]);

    return (
        <Card className="h-full border shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-500" /> Monthly Trend
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className="h-64 w-full rounded-2xl" />
                ) : chartData.length > 0 ? (
                    <div className="h-[280px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis 
                                    dataKey="month" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                                    dy={10} 
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                                />
                                <RechartsTooltip 
                                    cursor={{ fill: 'hsl(var(--muted))' }}
                                    contentStyle={{ 
                                        borderRadius: '16px', 
                                        border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                                    }} 
                                />
                                <Legend 
                                    verticalAlign="top" 
                                    align="right" 
                                    iconType="circle"
                                    wrapperStyle={{ paddingBottom: '20px' }}
                                />
                                <Bar 
                                    dataKey="Income" 
                                    fill="#22c55e" 
                                    radius={[6, 6, 0, 0]} 
                                    barSize={24}
                                />
                                <Bar 
                                    dataKey="Expense" 
                                    fill="#ef4444" 
                                    radius={[6, 6, 0, 0]} 
                                    barSize={24}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="py-20 text-center">
                        <p className="text-gray-400 font-medium italic">No trend data available yet</p>
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
        <Card className="h-full border shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <HistoryIcon className="w-5 h-5 text-indigo-500" /> Recent Activity
                </CardTitle>
                <Link to="/transactions">
                    <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-bold group">
                        View All <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </Link>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
                        ))}
                    </div>
                ) : transactions?.length > 0 ? (
                    <AnimatedList className="space-y-2.5">
                        {transactions.map((tx) => (
                            <div
                                key={tx._id}
                                className="p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-700 group"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:rotate-12",
                                            tx.type === "income" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                                        )}>
                                            {tx.type === "income" ? <ArrowUp className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                                                {tx.description || "Untitled Transaction"}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Badge variant="outline" className="text-[10px] py-0 px-2 rounded-full border-gray-200 text-gray-500 font-medium">
                                                    {getCategoryName(tx.category_id)}
                                                </Badge>
                                                <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium">
                                                    <Calendar className="w-3 h-3" /> {dayjs(tx.date).format("MMM D, YYYY")}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "text-lg font-black tracking-tight",
                                        tx.type === "income" ? "text-green-600" : "text-red-600"
                                    )}>
                                        {tx.type === "income" ? "+" : "-"}$<CountUp value={tx.amount || 0} duration={0.8} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </AnimatedList>
                ) : (
                    <div className="py-20 text-center flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-6">
                            <Wallet className="h-10 w-10 text-gray-300" />
                        </div>
                        <p className="text-gray-500 font-bold text-lg mb-2">Your wallet is hungry</p>
                        <p className="text-gray-400 text-sm mb-6 max-w-xs">You haven't recorded any transactions yet. Let's get started!</p>
                        <Link to="/smart-entry">
                            <Button className="rounded-2xl px-8 font-bold shadow-lg shadow-indigo-200">Start Tracking</Button>
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
        <div className="container max-w-7xl mx-auto py-8 px-4 mb-24 animate-in fade-in duration-700">
            <WelcomeTour />

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200 flex-shrink-0">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-none rounded-full px-3 font-bold">
                            Live Overview
                        </Badge>
                    </div>
                    <h1 className="text-5xl font-black tracking-tight text-gray-900 dark:text-white">Dashboard</h1>
                    <p className="text-gray-400 mt-2 font-medium">
                        Welcome back! Here's what's happening with your money in {dayjs().format("MMMM")}.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        className="rounded-2xl border-gray-200 font-bold px-6 hover:bg-gray-50 flex items-center gap-2"
                        onClick={() => fetchDashboardData()}
                    >
                        Refresh Data
                    </Button>
                </div>
            </div>

            {/* Quick Actions & Health Score */}
            <DashboardActions onAddTransaction={() => setOpenForm(true)} />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <SummaryCard
                    title="Total Income"
                    value={summary.totalIncome}
                    icon={TrendingUp}
                    color="#22c55e"
                    change={summary.incomeChange}
                    isLoading={isLoading}
                />
                <SummaryCard
                    title="Total Expenses"
                    value={summary.totalExpenses}
                    icon={TrendingDown}
                    color="#ef4444"
                    change={summary.expenseChange}
                    isLoading={isLoading}
                />
                <SummaryCard
                    title="Net Savings"
                    value={summary.netSavings}
                    icon={PiggyBank}
                    color="#6366f1"
                    isLoading={isLoading}
                    highlight={true}
                />
                <SummaryCard
                    title="Activity Count"
                    value={summary.transactionCount}
                    icon={Wallet}
                    color="#a855f7"
                    isLoading={isLoading}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
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
            <div className="grid grid-cols-1 mb-10">
                <RecentTransactions
                    transactions={dashboardData?.recentTransactions}
                    isLoading={isLoading}
                />
            </div>

            {/* Transaction Form Dialog */}
            <Dialog open={openForm} onOpenChange={setOpenForm}>
                <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden border-none bg-transparent shadow-none">
                    <TransactionForm
                        fetchTransactions={() => {
                            fetchDashboardData();
                            setOpenForm(false);
                        }}
                        inline={false}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
