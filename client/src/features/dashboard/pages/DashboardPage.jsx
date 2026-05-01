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
import { getDashboardData } from "@/services/stats.service";

// Summary Card Component with Modern Design
function SummaryCard({ title, value, icon: Icon, color, change, isLoading, highlight = false }) {
    const isPositive = change >= 0;

    const CardWrapper = highlight ? ElectricBorder : React.Fragment;
    const borderProps = highlight ? { borderColor: `${color}80`, glowColor: `${color}50` } : {};

    const cardContent = (
        <Card className="h-full overflow-hidden border-none bg-card ember-glow card-hover rounded-xl">
            <CardContent className="p-6">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <p className="label-caps text-muted-foreground mb-3">
                            {title}
                        </p>
                        {isLoading ? (
                            <Skeleton className="h-10 w-32" />
                        ) : (
                            <div className="text-4xl font-bold font-headline mb-2" style={{ color }}>
                                $<CountUp value={value || 0} duration={1.5} />
                            </div>
                        )}
                        {change !== undefined && !isLoading && (
                            <div className="flex items-center gap-1 mt-2">
                                {isPositive ? (
                                    <ArrowUp className="h-4 w-4" style={{ color: 'hsl(var(--ember))' }} />
                                ) : (
                                    <ArrowDown className="h-4 w-4" style={{ color: 'hsl(var(--sage))' }} />
                                )}
                                <span className={cn("text-xs font-medium")} style={{ color: isPositive ? 'hsl(var(--ember))' : 'hsl(var(--sage))' }}>
                                    {Math.abs(change)}% vs last month
                                </span>
                            </div>
                        )}
                    </div>
                    <div
                        className="p-3 rounded-xl flex items-center justify-center"
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
    const colors = [
        "hsl(var(--ember))", 
        "hsl(var(--sage))", 
        "hsl(var(--sand))", 
        "hsl(var(--primary))", 
        "hsl(var(--secondary))", 
        "hsl(var(--accent))"
    ];

    const chartData = useMemo(() => data?.map((item, index) => ({
        name: item.categoryName,
        value: item.amount,
        color: colors[index % colors.length]
    })) || [], [data]);

    const total = useMemo(() => chartData.reduce((sum, item) => sum + item.value, 0), [chartData]);

    return (
        <Card className="h-full border-none ember-glow rounded-xl overflow-hidden">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <PiggyBank className="w-5 h-5 text-primary" /> Spending by Category
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
                                            border: 'none', 
                                            backgroundColor: 'hsl(var(--card))', 
                                            color: 'hsl(var(--card-foreground))',
                                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' 
                                        }} 
                                        itemStyle={{ color: 'hsl(var(--card-foreground))', fontWeight: 600 }}
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
                                            <span className="font-semibold text-foreground">{item.name}</span>
                                        </div>
                                        <span className="font-bold text-foreground">
                                            {((item.value / total) * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
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
                        <div className="mx-auto w-16 h-16 rounded-xl bg-muted flex items-center justify-center mb-4 text-muted-foreground">
                            <Search className="h-8 w-8 opacity-20" />
                        </div>
                        <p className="text-muted-foreground font-semibold mb-1">No spending data this month</p>
                        <p className="text-xs text-muted-foreground/70">Add expenses to see breakdown</p>
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
        <Card className="h-full border-none ember-glow rounded-xl overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" /> Monthly Trend
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
                                        border: 'none', 
                                        backgroundColor: 'hsl(var(--card))', 
                                        color: 'hsl(var(--card-foreground))',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' 
                                    }} 
                                    itemStyle={{ color: 'hsl(var(--card-foreground))', fontWeight: 600 }}
                                />
                                <Legend 
                                    verticalAlign="top" 
                                    align="right" 
                                    iconType="circle"
                                    wrapperStyle={{ paddingBottom: '20px' }}
                                />
                                <Bar 
                                    dataKey="Income" 
                                    fill="hsl(var(--ember))" 
                                    radius={[6, 6, 0, 0]} 
                                    barSize={24}
                                />
                                <Bar 
                                    dataKey="Expense" 
                                    fill="hsl(var(--sage))" 
                                    radius={[6, 6, 0, 0]} 
                                    barSize={24}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="py-20 text-center">
                        <p className="text-muted-foreground font-medium italic">No trend data available yet</p>
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
        <Card className="h-full border-none ember-glow rounded-xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <HistoryIcon className="w-5 h-5 text-primary" /> Recent Activity
                </CardTitle>
                <Link to="/transactions">
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/90 hover:bg-primary/10 font-bold group">
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
                                className="p-4 rounded-xl hover:bg-muted transition-all border-none group"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:rotate-12"
                                        )} style={tx.type === "income" ? { backgroundColor: 'hsla(var(--ember), 0.2)', color: 'hsl(var(--ember))' } : { backgroundColor: 'hsla(var(--sage), 0.2)', color: 'hsl(var(--sage))' }}>
                                            {tx.type === "income" ? <ArrowUp className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-foreground group-hover:text-primary transition-colors">
                                                {tx.description || "Untitled Transaction"}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Badge variant="outline" className="text-[10px] py-0 px-2 rounded-full border-border text-muted-foreground font-medium">
                                                    {getCategoryName(tx.category_id)}
                                                </Badge>
                                                <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                                                    <Calendar className="w-3 h-3" /> {dayjs(tx.date).format("MMM D, YYYY")}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-lg font-black tracking-tight financial-number"
                                        style={{ color: tx.type === "income" ? 'hsl(var(--ember))' : 'hsl(var(--sage))' }}>
                                        {tx.type === "income" ? "+" : "-"}$<CountUp value={tx.amount || 0} duration={0.8} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </AnimatedList>
                ) : (
                    <div className="py-20 text-center flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                            <Wallet className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <p className="text-foreground font-bold text-lg mb-2">Your wallet is hungry</p>
                        <p className="text-muted-foreground text-sm mb-6 max-w-xs">You haven't recorded any transactions yet. Let's get started!</p>
                        <Link to="/smart-entry">
                            <Button className="rounded-xl px-8 font-bold ember-glow">Start Tracking</Button>
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
        try {
            const result = await getDashboardData();
            if (result && result.data) {
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
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0">
                            <Sparkles className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-none rounded-full px-3 font-bold">
                            Live Overview
                        </Badge>
                    </div>
                    <h1 className="text-5xl font-black tracking-tight text-foreground">Dashboard</h1>
                    <p className="text-muted-foreground mt-2 font-medium">
                        Welcome back! Here's what's happening with your money in {dayjs().format("MMMM")}.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        className="rounded-xl border-border font-bold px-6 hover:bg-muted flex items-center gap-2"
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
                    color="hsl(var(--ember))"
                    change={summary.incomeChange}
                    isLoading={isLoading}
                />
                <SummaryCard
                    title="Total Expenses"
                    value={summary.totalExpenses}
                    icon={TrendingDown}
                    color="hsl(var(--sage))"
                    change={summary.expenseChange}
                    isLoading={isLoading}
                />
                <SummaryCard
                    title="Net Savings"
                    value={summary.netSavings}
                    icon={PiggyBank}
                    color="hsl(var(--sand))"
                    isLoading={isLoading}
                    highlight={true}
                />
                <SummaryCard
                    title="Activity Count"
                    value={summary.transactionCount}
                    icon={Wallet}
                    color="hsl(var(--primary))"
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
