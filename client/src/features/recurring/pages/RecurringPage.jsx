import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useSelector } from "react-redux";
import { Plus, Trash2, Edit2, Pause, Play, Repeat, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";

const FREQUENCY_OPTIONS = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "biweekly", label: "Bi-weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
];

const DAY_OPTIONS = [
    { value: 0, label: "Sunday" },
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
];

export default function RecurringTransactions() {
    const [recurringList, setRecurringList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [form, setForm] = useState({
        amount: "",
        description: "",
        type: "expense",
        category_id: "",
        frequency: "monthly",
        dayOfWeek: 1,
        dayOfMonth: 1,
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
    });

    const user = useSelector((state) => state.auth.user);
    const categories = user?.categories || [];

    useEffect(() => {
        fetchRecurringTransactions();
    }, []);

    async function fetchRecurringTransactions() {
        const token = Cookies.get("token");
        try {
            setFetchError(false);
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/recurring`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const result = await res.json();
            if (result.success) {
                setRecurringList(result.data);
            } else {
                setFetchError(true);
            }
        } catch (error) {
            console.error("Failed to fetch recurring transactions:", error);
            setFetchError(true);
        } finally {
            setIsLoading(false);
        }
    }

    function openDialog(item = null) {
        if (item) {
            setEditItem(item);
            setForm({
                amount: item.amount.toString(),
                description: item.description,
                type: item.type,
                category_id: item.category_id,
                frequency: item.frequency,
                dayOfWeek: item.dayOfWeek || 1,
                dayOfMonth: item.dayOfMonth || 1,
                startDate: item.startDate?.split("T")[0] || "",
                endDate: item.endDate?.split("T")[0] || "",
            });
        } else {
            setEditItem(null);
            setForm({
                amount: "",
                description: "",
                type: "expense",
                category_id: categories[0]?._id || "",
                frequency: "monthly",
                dayOfWeek: 1,
                dayOfMonth: 1,
                startDate: new Date().toISOString().split("T")[0],
                endDate: "",
            });
        }
        setDialogOpen(true);
    }

    function closeDialog() {
        setDialogOpen(false);
        setEditItem(null);
    }

    async function handleSubmit(e) {
        if (e) e.preventDefault();
        const token = Cookies.get("token");
        const method = editItem ? "PATCH" : "POST";
        const url = editItem
            ? `${import.meta.env.VITE_BASE_URL}/recurring/${editItem._id}`
            : `${import.meta.env.VITE_BASE_URL}/recurring`;

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...form,
                    amount: parseFloat(form.amount),
                    endDate: form.endDate || null,
                }),
            });

            if (res.ok) {
                closeDialog();
                fetchRecurringTransactions();
            }
        } catch (error) {
            console.error("Failed to save recurring transaction:", error);
        }
    }

    async function handleDelete(id) {
        if (!window.confirm("Delete this recurring transaction?")) return;
        const token = Cookies.get("token");
        try {
            await fetch(`${import.meta.env.VITE_BASE_URL}/recurring/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchRecurringTransactions();
        } catch (error) {
            console.error("Failed to delete:", error);
        }
    }

    async function handleToggle(id) {
        const token = Cookies.get("token");
        try {
            await fetch(`${import.meta.env.VITE_BASE_URL}/recurring/${id}/toggle`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchRecurringTransactions();
        } catch (error) {
            console.error("Failed to toggle:", error);
        }
    }

    function formatNextExecution(date) {
        if (!date) return "Not scheduled";
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    }

    return (
        <div className="container mx-auto max-w-6xl py-8 px-4 relative min-h-[80vh]">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
                    <Repeat className="w-8 h-8" /> Recurring Transactions
                </h1>
                <Button
                    onClick={() => openDialog()}
                    className="hidden md:flex bg-blue-600 hover:bg-blue-700 text-white"
                >
                    <Plus className="mr-2 w-4 h-4" /> Add Recurring
                </Button>
            </div>

            {/* Info Alert */}
            <div className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 p-4 rounded-md mb-8 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                    Recurring transactions are automatically created based on your schedule. Active transactions will be processed daily.
                </p>
            </div>

            {/* Recurring Transactions List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
                {isLoading ? (
                    [...Array(6)].map((_, i) => (
                        <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-800 rounded-2xl h-48"></div>
                    ))
                ) : fetchError ? (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3">
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-8 text-center rounded-2xl">
                            <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-4">
                                Failed to load recurring transactions
                            </h3>
                            <Button onClick={fetchRecurringTransactions} variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                                Retry
                            </Button>
                        </div>
                    </div>
                ) : recurringList.length === 0 ? (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3">
                        <div className="bg-white dark:bg-gray-900 p-12 text-center rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                            <div className="flex justify-center mb-4 text-gray-400 dark:text-gray-600">
                                <Repeat className="w-16 h-16" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                No recurring transactions yet
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                                Set up automatic transactions for bills, subscriptions, or regular income
                            </p>
                            <Button onClick={() => openDialog()} className="bg-blue-600 hover:bg-blue-700 text-white">
                                Create First Recurring Transaction
                            </Button>
                        </div>
                    </div>
                ) : (
                    recurringList.map((item) => (
                        <div
                            key={item._id}
                            className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 overflow-hidden relative transition-all
                                ${item.type === "income" ? "border-l-4 border-l-green-500" : "border-l-4 border-l-red-500"}
                                ${item.isActive ? "opacity-100" : "opacity-60 grayscale-[50%]"}
                            `}
                        >
                            <div className="flex flex-col h-full">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="max-w-[70%]">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate" title={item.description}>
                                            {item.description}
                                        </h3>
                                        <div className={`text-xl font-black mt-1 ${item.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                            {item.type === "income" ? "+" : "-"}${item.amount.toFixed(2)}
                                        </div>
                                    </div>
                                    <div className={`px-2.5 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${item.isActive ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}>
                                        {item.isActive ? "Active" : "Paused"}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                        <Repeat className="w-3 h-3 mr-1" />
                                        {item.frequency.charAt(0).toUpperCase() + item.frequency.slice(1)}
                                    </span>
                                    {item.categoryName && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/30">
                                            {item.categoryName}
                                        </span>
                                    )}
                                </div>

                                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-end">
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Next Execution</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                            {formatNextExecution(item.nextExecution)}
                                        </p>
                                    </div>

                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleToggle(item._id)}
                                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                            title={item.isActive ? "Pause" : "Resume"}
                                        >
                                            {item.isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                        </button>
                                        <button
                                            onClick={() => openDialog(item)}
                                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit2 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item._id)}
                                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* FAB for mobile */}
            <button
                onClick={() => openDialog()}
                className="md:hidden fixed bottom-20 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-105 z-40"
                aria-label="Add new recurring transaction"
            >
                <Plus className="w-6 h-6" />
            </button>

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md md:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editItem ? "Edit Recurring Transaction" : "New Recurring Transaction"}</DialogTitle>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1 py-2">
                        {/* Type Toggle */}
                        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                            <button
                                type="button"
                                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                                    form.type === "expense" 
                                    ? "bg-white dark:bg-gray-700 text-red-600 shadow-sm" 
                                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                }`}
                                onClick={() => setForm({ ...form, type: "expense" })}
                            >
                                Expense
                            </button>
                            <button
                                type="button"
                                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                                    form.type === "income" 
                                    ? "bg-white dark:bg-gray-700 text-green-600 shadow-sm" 
                                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                }`}
                                onClick={() => setForm({ ...form, type: "income" })}
                            >
                                Income
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                            <Input
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={form.amount}
                                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                    required
                                    className="pl-8"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                            <select
                                value={form.category_id}
                                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-slate-300"
                                required
                            >
                                <option value="" disabled>Select category</option>
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>
                                        {cat.icon} {cat.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Frequency</label>
                            <select
                                value={form.frequency}
                                onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-slate-300"
                            >
                                {FREQUENCY_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {form.frequency === "weekly" && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Day of Week</label>
                                <select
                                    value={form.dayOfWeek}
                                    onChange={(e) => setForm({ ...form, dayOfWeek: parseInt(e.target.value) })}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-slate-300"
                                >
                                    {DAY_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {form.frequency === "monthly" && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Day of Month</label>
                                <Input
                                    type="number"
                                    min="1"
                                    max="31"
                                    value={form.dayOfMonth}
                                    onChange={(e) => setForm({ ...form, dayOfMonth: parseInt(e.target.value) || 1 })}
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                                <Input
                                    type="date"
                                    value={form.startDate}
                                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                                <Input
                                    type="date"
                                    value={form.endDate}
                                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                                />
                                <p className="text-xs text-gray-500 mt-1">Optional</p>
                            </div>
                        </div>
                    </form>
                    
                    <DialogFooter className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 pb-0">
                        <Button variant="ghost" onClick={closeDialog}>Cancel</Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={!form.amount || !form.description || !form.category_id}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {editItem ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
