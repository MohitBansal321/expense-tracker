// Reports page with modern Shadcn UI
import React, { useEffect, useState, useMemo } from "react";
import Cookies from "js-cookie";
import { 
    BarChart3, 
    Calendar, 
    Printer, 
    TrendingUp, 
    TrendingDown,
    ChevronRight,
    Search,
    Download,
    Filter,
    CheckCircle2
} from "lucide-react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    LineChart,
    Line,
    Cell
} from "recharts";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

export default function Reports() {
    const [tabValue, setTabValue] = useState("monthly");
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [monthlyData, setMonthlyData] = useState(null);
    const [yearlyData, setYearlyData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(false);

    // Drill Down State
    const [drillDownOpen, setDrillDownOpen] = useState(false);
    const [drillDownData, setDrillDownData] = useState([]);
    const [drillDownTitle, setDrillDownTitle] = useState("");
    const [isDrillLoading, setIsDrillLoading] = useState(false);

    async function handleDrillDown({ day }) {
        setDrillDownOpen(true);
        setIsDrillLoading(true);
        setDrillDownData([]);

        const token = Cookies.get("token");
        const title = `Transactions on ${new Date(selectedYear, selectedMonth - 1, day).toLocaleDateString()}`;
        const startDate = new Date(selectedYear, selectedMonth - 1, day).toISOString();
        const endDate = new Date(selectedYear, selectedMonth - 1, day, 23, 59, 59).toISOString();
        const queryParams = `startDate=${startDate}&endDate=${endDate}`;

        try {
            const res = await fetch(
                `${import.meta.env.VITE_BASE_URL}/transaction/search?${queryParams}`,
                { headers: { Authorization: `Bearer ${token}` } }
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

    const years = useMemo(() => {
        const arr = [];
        for (let y = new Date().getFullYear(); y >= 2020; y--) arr.push(y);
        return arr;
    }, []);

    useEffect(() => {
        if (tabValue === "monthly") {
            fetchMonthlyReport();
        } else {
            fetchYearlyReport();
        }
    }, [tabValue, selectedMonth, selectedYear]);

    async function fetchMonthlyReport() {
        setIsLoading(true);
        setFetchError(false);
        const token = Cookies.get("token");
        try {
            const res = await fetch(
                `${import.meta.env.VITE_BASE_URL}/reports/monthly?month=${selectedMonth}&year=${selectedYear}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const result = await res.json();
            if (result.success) setMonthlyData(result.data);
            else setFetchError(true);
        } catch (error) {
            setFetchError(true);
        } finally {
            setIsLoading(false);
        }
    }

    async function fetchYearlyReport() {
        setIsLoading(true);
        setFetchError(false);
        const token = Cookies.get("token");
        try {
            const res = await fetch(
                `${import.meta.env.VITE_BASE_URL}/reports/yearly?year=${selectedYear}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const result = await res.json();
            if (result.success) setYearlyData(result.data);
            else setFetchError(true);
        } catch (error) {
            setFetchError(true);
        } finally {
            setIsLoading(false);
        }
    }

    function handlePrint() {
        window.print();
    }

    function SummaryCard({ title, value, change, isPositive, icon: Icon }) {
        return (
            <Card className="border shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
                            <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                                ${typeof value === "number" ? value.toLocaleString() : value}
                            </p>
                            {change !== undefined && (
                                <Badge
                                    className={cn(
                                        "mt-2 rounded-full px-2 py-0.5 border-none font-bold",
                                        isPositive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                                    )}
                                >
                                    {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                                    {change > 0 ? "+" : ""}{change}%
                                </Badge>
                            )}
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-indigo-500">
                            {Icon}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="container max-w-7xl mx-auto py-8 px-4 mb-24 print:px-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200 text-white">
                        <BarChart3 className="h-7 w-7" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">Reports</h1>
                        <p className="text-gray-400 font-medium">Financial analytics and trends</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    <div className="min-w-[100px]">
                        <Select
                            value={selectedYear.toString()}
                            onValueChange={(v) => setSelectedYear(parseInt(v))}
                        >
                            <SelectTrigger className="rounded-xl border-gray-200 font-bold">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {years.map((y) => (
                                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    {tabValue === "monthly" && (
                        <div className="min-w-[140px]">
                            <Select
                                value={selectedMonth.toString()}
                                onValueChange={(v) => setSelectedMonth(parseInt(v))}
                            >
                                <SelectTrigger className="rounded-xl border-gray-200 font-bold">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {MONTHS.map((m, i) => (
                                        <SelectItem key={i} value={(i + 1).toString()}>{m}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    
                    <Button variant="outline" onClick={handlePrint} className="rounded-xl border-gray-200 font-bold gap-2 print:hidden whitespace-nowrap">
                        <Printer className="h-4 w-4" /> Print
                    </Button>
                    <Button className="rounded-xl font-bold gap-2 whitespace-nowrap">
                        <Download className="h-4 w-4" /> Export
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={tabValue} onValueChange={setTabValue} className="mb-8">
                <TabsList className="inline-flex h-12 items-center justify-center rounded-2xl bg-gray-100 p-1 text-gray-500 dark:bg-gray-800 w-full md:w-auto">
                    <TabsTrigger value="monthly" className="rounded-xl px-8 py-2 font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">
                        Monthly
                    </TabsTrigger>
                    <TabsTrigger value="yearly" className="rounded-xl px-8 py-2 font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">
                        Yearly
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="monthly" className="space-y-8 mt-8 outline-none focus-visible:ring-0">
                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
                        </div>
                    ) : fetchError ? (
                        <Card className="p-20 text-center flex flex-col items-center rounded-3xl border-dashed">
                            <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
                                <Search className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Failed to load report</h3>
                            <p className="text-gray-400 mb-6 max-w-sm">We ran into an issue fetching your data for this period.</p>
                            <Button onClick={fetchMonthlyReport} variant="outline" className="rounded-xl font-bold">Try Refreshing</Button>
                        </Card>
                    ) : monthlyData ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <SummaryCard
                                    title="Total Income"
                                    value={monthlyData.summary.totalIncome}
                                    change={monthlyData.summary.incomeChange}
                                    isPositive={monthlyData.summary.incomeChange >= 0}
                                    icon={<TrendingUp className="w-6 h-6" />}
                                />
                                <SummaryCard
                                    title="Total Expenses"
                                    value={monthlyData.summary.totalExpenses}
                                    change={monthlyData.summary.expenseChange}
                                    isPositive={monthlyData.summary.expenseChange <= 0}
                                    icon={<TrendingDown className="w-6 h-6" />}
                                />
                                <SummaryCard
                                    title="Net Savings"
                                    value={monthlyData.summary.netSavings}
                                    isPositive={monthlyData.summary.netSavings >= 0}
                                    icon={<Calendar className="w-6 h-6" />}
                                />
                                <SummaryCard
                                    title="Transactions"
                                    value={monthlyData.summary.transactionCount}
                                    icon={<BarChart3 className="w-6 h-6" />}
                                />
                            </div>

                            {/* Daily Trend Chart */}
                            <Card className="rounded-3xl border shadow-sm overflow-hidden">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                                            Daily Spending Trend
                                            <Badge variant="outline" className="text-[10px] rounded-full border-gray-100 text-gray-400">Click bars for details</Badge>
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <div className="h-[350px] w-full">
                                        {monthlyData.dailyData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={monthlyData.dailyData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                                    <RechartsTooltip 
                                                        cursor={{ fill: '#f8fafc' }}
                                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                    />
                                                    <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
                                                    <Bar 
                                                        dataKey="expense" 
                                                        fill="#ef4444" 
                                                        radius={[4, 4, 0, 0]} 
                                                        onClick={(data) => handleDrillDown({ day: data.day })}
                                                        cursor="pointer"
                                                        barSize={20}
                                                    />
                                                    <Bar 
                                                        dataKey="income" 
                                                        fill="#22c55e" 
                                                        radius={[4, 4, 0, 0]} 
                                                        onClick={(data) => handleDrillDown({ day: data.day })}
                                                        cursor="pointer"
                                                        barSize={20}
                                                    />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                                                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                                                    <TrendingUp className="w-8 h-8 text-gray-300" />
                                                </div>
                                                <p className="text-gray-500 font-bold">No activity this month</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Category Progress */}
                                <Card className="rounded-3xl border shadow-sm h-full">
                                    <CardHeader>
                                        <CardTitle className="text-xl font-bold">Spending by Category</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {monthlyData.categoryBreakdown.length > 0 ? (
                                            monthlyData.categoryBreakdown.map((cat, i) => (
                                                <div key={i} className="group">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-lg shadow-sm group-hover:scale-110 transition-transform">
                                                                {cat.icon || "💰"}
                                                            </div>
                                                            <span className="font-bold text-gray-700 dark:text-gray-300">{cat.category}</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-black text-gray-900 dark:text-white">${cat.amount.toLocaleString()}</p>
                                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                                                {((cat.amount / (monthlyData.summary.totalExpenses || 1)) * 100).toFixed(1)}%
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out"
                                                            style={{
                                                                width: `${(cat.amount / (monthlyData.summary.totalExpenses || 1)) * 100}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-center text-gray-400 py-10 italic">No category data</p>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Top Transactions */}
                                <Card className="rounded-3xl border shadow-sm h-full">
                                    <CardHeader>
                                        <CardTitle className="text-xl font-bold">Top 5 Expenses</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        {monthlyData.topExpenses.length > 0 ? (
                                            <div className="divide-y divide-gray-50 dark:divide-gray-800 font-medium">
                                                {monthlyData.topExpenses.map((exp, i) => (
                                                    <div key={i} className="flex justify-between items-center p-5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors first:pt-0 last:pb-0 last:border-0 border-transparent">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center">
                                                                <TrendingDown className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-900 dark:text-white truncate max-w-[150px]">{exp.description}</p>
                                                                <Badge variant="outline" className="text-[10px] rounded-full border-gray-100 text-gray-400 py-0">{exp.category}</Badge>
                                                            </div>
                                                        </div>
                                                        <p className="font-black text-red-500 tracking-tight text-lg">-${exp.amount.toLocaleString()}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-center text-gray-400 py-20 italic">No major expenses found</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    ) : null}
                </TabsContent>

                <TabsContent value="yearly" className="space-y-8 mt-8 outline-none focus-visible:ring-0">
                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
                        </div>
                    ) : yearlyData ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Yearly Summary */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <SummaryCard title="Annual Income" value={yearlyData.summary.totalIncome} icon={<TrendingUp className="w-6 h-6" />} />
                                <SummaryCard title="Annual Expenses" value={yearlyData.summary.totalExpenses} icon={<TrendingDown className="w-6 h-6" />} />
                                <SummaryCard title="Annual Savings" value={yearlyData.summary.netSavings} isPositive={yearlyData.summary.netSavings >= 0} icon={<CheckCircle2 className="w-6 h-6" />} />
                                <SummaryCard title="Avg Monthly Spend" value={yearlyData.summary.averageMonthlyExpense} icon={<BarChart3 className="w-6 h-6" />} />
                            </div>

                            {/* Monthly Trend Line */}
                            <Card className="rounded-3xl border shadow-sm overflow-hidden">
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                                            {selectedYear} Performance Overview
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[400px] w-full mt-4">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={yearlyData.monthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="monthName" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                                <RechartsTooltip 
                                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                />
                                                <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '30px' }} />
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="income" 
                                                    stroke="#22c55e" 
                                                    strokeWidth={4} 
                                                    dot={{ r: 4, fill: '#22c55e', strokeWidth: 2, stroke: '#fff' }}
                                                    activeDot={{ r: 8, strokeWidth: 0 }}
                                                />
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="expense" 
                                                    stroke="#ef4444" 
                                                    strokeWidth={4} 
                                                    dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }}
                                                    activeDot={{ r: 8, strokeWidth: 0 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Yearly Insights */}
                                <Card className="rounded-3xl border shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-xl font-bold">Smart Insights</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
                                                <TrendingUp className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Peak Prosperity Month</p>
                                                <p className="text-lg font-black text-gray-900 dark:text-white">
                                                    {yearlyData.insights.bestMonth}
                                                </p>
                                                <p className="text-sm font-bold text-green-600">+${yearlyData.insights.bestMonthSavings.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                                                <TrendingDown className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Heaviest Spending</p>
                                                <p className="text-lg font-black text-gray-900 dark:text-white">
                                                    {yearlyData.insights.worstMonth}
                                                </p>
                                                <p className="text-sm font-bold text-red-600">-${yearlyData.insights.worstMonthDeficit.toLocaleString()}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                                                <Filter className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Primary Category</p>
                                                <p className="text-lg font-black text-gray-900 dark:text-white">
                                                    {yearlyData.insights.topCategory || "None"}
                                                </p>
                                                <p className="text-sm font-bold text-indigo-600">${yearlyData.insights.topCategoryAmount.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Categories Grid */}
                                <Card className="lg:col-span-2 rounded-3xl border shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-xl font-bold">Annual Category Distribution</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                                            {yearlyData.categoryBreakdown.slice(0, 8).map((cat, i) => (
                                                <div key={i} className="group">
                                                    <div className="flex justify-between items-center mb-1.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-lg group-hover:scale-125 transition-transform">{cat.icon || "💰"}</span>
                                                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{cat.category}</span>
                                                        </div>
                                                        <span className="font-black text-gray-900 dark:text-white tracking-tight">${cat.amount.toLocaleString()}</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-indigo-500 rounded-full opacity-70 group-hover:opacity-100 transition-opacity duration-500"
                                                            style={{
                                                                width: `${(cat.amount / (yearlyData.summary.totalExpenses || 1)) * 100}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    ) : null}
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
            <DialogContent className="sm:max-w-[600px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                <DialogHeader className="p-6 bg-gray-50 dark:bg-gray-900 border-b">
                    <DialogTitle className="text-2xl font-black tracking-tight">{title}</DialogTitle>
                </DialogHeader>
                <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {isLoading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
                        </div>
                    ) : transactions.length > 0 ? (
                        <div className="space-y-3">
                            {transactions.map((tx) => (
                                <div
                                    key={tx._id}
                                    className="flex justify-between items-center p-4 rounded-2xl bg-white dark:bg-gray-800 border hover:border-indigo-200 transition-colors shadow-sm group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center",
                                            tx.type === "income" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                                        )}>
                                            {tx.type === "income" ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">{tx.description || "Untitled"}</p>
                                            <p className="text-xs text-gray-400 font-medium">
                                                {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                    <p className={cn(
                                        "text-lg font-black tracking-tight",
                                        tx.type === "income" ? "text-green-600" : "text-red-500"
                                    )}>
                                        {tx.type === "income" ? "+" : "-"}${tx.amount.toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center">
                            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="text-gray-400 font-bold">No transactions found for this day.</p>
                        </div>
                    )}
                </div>
                <DialogFooter className="p-4 bg-gray-50 dark:bg-gray-900 border-t items-center justify-center">
                    <Button variant="outline" onClick={onClose} className="rounded-xl px-10 font-bold">
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
