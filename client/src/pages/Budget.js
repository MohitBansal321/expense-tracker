// Budget management page with modern Shadcn UI
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Cookies from "js-cookie";
import { Plus, Edit2, Trash2, AlertTriangle, AlertCircle } from "lucide-react";

// Shadcn UI Components
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
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
import { Progress } from "../components/ui/progress";
import { Slider } from "../components/ui/slider";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Skeleton } from "../components/ui/skeleton";

// Summary Card Component
function SummaryCard({ title, value, color, prefix = "$" }) {
    return (
        <Card className="border-l-4" style={{ borderLeftColor: color }}>
            <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-1">{title}</p>
                <p className="text-2xl font-semibold" style={{ color }}>
                    {prefix}
                    {typeof value === "number" ? value.toLocaleString() : value}
                </p>
            </CardContent>
        </Card>
    );
}

// Budget Card Component
function BudgetCard({ budget, onEdit, onDelete }) {
    const progressColor = budget.isOverBudget
        ? "#ef4444"
        : budget.isNearLimit
            ? "#f97316"
            : "#22c55e";

    return (
        <Card
            className="border-l-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            style={{ borderLeftColor: progressColor }}
        >
            <CardContent className="p-5">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-lg font-semibold mb-1">
                            {budget.categoryName}
                        </h3>
                        <Badge variant="secondary" className="capitalize">
                            {budget.period}
                        </Badge>
                    </div>
                    <div className="flex gap-1">
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onEdit(budget)}
                            className="h-8 w-8"
                        >
                            <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onDelete(budget._id)}
                            className="h-8 w-8 hover:text-destructive"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                    <div className="flex justify-between mb-2 text-sm">
                        <span className="text-muted-foreground">
                            ${budget.currentSpending.toLocaleString()} of $
                            {budget.amount.toLocaleString()}
                        </span>
                        <span className="font-semibold" style={{ color: progressColor }}>
                            {budget.percentageUsed}%
                        </span>
                    </div>
                    <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                            className="h-full transition-all duration-300 rounded-full"
                            style={{
                                width: `${Math.min(budget.percentageUsed, 100)}%`,
                                backgroundColor: progressColor,
                            }}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                        Remaining:{" "}
                        <strong className="text-foreground">
                            ${budget.remaining.toLocaleString()}
                        </strong>
                    </p>
                    {budget.isOverBudget && (
                        <Badge variant="destructive" className="gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Over Budget
                        </Badge>
                    )}
                    {budget.isNearLimit && !budget.isOverBudget && (
                        <Badge className="gap-1 bg-orange-500 hover:bg-orange-600">
                            <AlertTriangle className="h-3 w-3" />
                            Near Limit
                        </Badge>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

// Budget Form Dialog Component
function BudgetDialog({ open, onClose, onSave, budget, categories }) {
    const [form, setForm] = useState({
        category_id: "",
        amount: 1000,
        period: "monthly",
        alertThreshold: 80,
    });

    useEffect(() => {
        if (budget) {
            setForm({
                category_id: budget.category_id || "",
                amount: budget.amount || 1000,
                period: budget.period || "monthly",
                alertThreshold: budget.alertThreshold || 80,
            });
        } else {
            setForm({
                category_id: "",
                amount: 1000,
                period: "monthly",
                alertThreshold: 80,
            });
        }
    }, [budget, open]);

    const handleSubmit = () => {
        if (!form.category_id || form.amount <= 0) {
            alert("Please fill all required fields");
            return;
        }
        onSave(form, budget?._id);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-xl">
                        {budget ? "Edit Budget" : "Create New Budget"}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-5 py-4">
                    {/* Category Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select
                            value={form.category_id}
                            onValueChange={(value) =>
                                setForm({ ...form, category_id: value })
                            }
                            disabled={!!budget}
                        >
                            <SelectTrigger id="category">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem key={cat._id} value={cat._id}>
                                        {cat.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                        <Label htmlFor="amount">Budget Amount ($) *</Label>
                        <Input
                            id="amount"
                            type="number"
                            min="0"
                            value={form.amount}
                            onChange={(e) =>
                                setForm({ ...form, amount: parseFloat(e.target.value) || 0 })
                            }
                        />
                    </div>

                    {/* Period */}
                    <div className="space-y-2">
                        <Label htmlFor="period">Period</Label>
                        <Select
                            value={form.period}
                            onValueChange={(value) => setForm({ ...form, period: value })}
                        >
                            <SelectTrigger id="period">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="yearly">Yearly</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Alert Threshold */}
                    <div className="space-y-3">
                        <Label>Alert Threshold: {form.alertThreshold}%</Label>
                        <Slider
                            value={[form.alertThreshold]}
                            onValueChange={([val]) =>
                                setForm({ ...form, alertThreshold: val })
                            }
                            min={50}
                            max={100}
                            step={5}
                            className="py-2"
                        />
                        <p className="text-xs text-muted-foreground">
                            You'll be warned when spending reaches this percentage
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit}>
                        {budget ? "Update" : "Create"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Main Budget Page Component
export default function Budget() {
    const [budgetData, setBudgetData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null);

    const user = useSelector((state) => state.auth.user);
    const categories = user?.categories || [];

    useEffect(() => {
        fetchBudgets();
    }, []);

    async function fetchBudgets() {
        setIsLoading(true);
        const token = Cookies.get("token");

        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/budget`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const result = await res.json();
                setBudgetData(result.data);
            }
        } catch (error) {
            console.error("Failed to fetch budgets:", error);
        }
        setIsLoading(false);
    }

    async function handleSave(form, budgetId) {
        const token = Cookies.get("token");
        const url = budgetId
            ? `${import.meta.env.VITE_BASE_URL}/budget/${budgetId}`
            : `${import.meta.env.VITE_BASE_URL}/budget`;

        try {
            const res = await fetch(url, {
                method: budgetId ? "PATCH" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });

            if (res.ok) {
                fetchBudgets();
                setDialogOpen(false);
                setEditingBudget(null);
            } else {
                const error = await res.json();
                alert(error.message || "Failed to save budget");
            }
        } catch (error) {
            console.error("Failed to save budget:", error);
        }
    }

    async function handleDelete(budgetId) {
        if (!window.confirm("Are you sure you want to delete this budget?"))
            return;

        const token = Cookies.get("token");

        try {
            const res = await fetch(
                `${import.meta.env.VITE_BASE_URL}/budget/${budgetId}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (res.ok) {
                fetchBudgets();
            }
        } catch (error) {
            console.error("Failed to delete budget:", error);
        }
    }

    function handleEdit(budget) {
        setEditingBudget(budget);
        setDialogOpen(true);
    }

    function handleAdd() {
        setEditingBudget(null);
        setDialogOpen(true);
    }

    const summary = budgetData?.summary || {};
    const budgets = budgetData?.budgets || [];

    // Get categories that don't have budgets yet
    const availableCategories = categories.filter(
        (cat) => !budgets.some((b) => b.category_id?.toString() === cat._id?.toString())
    );

    return (
        <div className="container max-w-7xl mx-auto py-6 px-4">
            {/* Page Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-4xl font-bold mb-1">Budget Manager</h1>
                    <p className="text-muted-foreground">
                        Set spending limits and track your progress
                    </p>
                </div>
                <Button
                    onClick={handleAdd}
                    disabled={availableCategories.length === 0}
                    className="gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Add Budget
                </Button>
            </div>

            {/* Alerts */}
            {budgets.filter((b) => b.isOverBudget).length > 0 && (
                <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        <strong>{budgets.filter((b) => b.isOverBudget).length}</strong>{" "}
                        budget(s) exceeded! Review your spending in the highlighted
                        categories.
                    </AlertDescription>
                </Alert>
            )}
            {budgets.filter((b) => b.isNearLimit && !b.isOverBudget).length > 0 && (
                <Alert variant="warning" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        <strong>
                            {budgets.filter((b) => b.isNearLimit && !b.isOverBudget).length}
                        </strong>{" "}
                        budget(s) approaching limit. Consider reducing spending.
                    </AlertDescription>
                </Alert>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {isLoading ? (
                    <>
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-24" />
                        ))}
                    </>
                ) : (
                    <>
                        <SummaryCard
                            title="Total Budget"
                            value={summary.totalBudget || 0}
                            color="#3b82f6"
                        />
                        <SummaryCard
                            title="Total Spent"
                            value={summary.totalSpending || 0}
                            color="#ef4444"
                        />
                        <SummaryCard
                            title="Remaining"
                            value={(summary.totalBudget || 0) - (summary.totalSpending || 0)}
                            color="#22c55e"
                        />
                        <SummaryCard
                            title="Over Budget"
                            value={summary.budgetsOverLimit || 0}
                            color="#f97316"
                            prefix=""
                        />
                    </>
                )}
            </div>

            {/* Budget Cards */}
            <h2 className="text-xl font-semibold mb-4">Your Budgets</h2>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-48 rounded-lg" />
                    ))}
                </div>
            ) : budgets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {budgets.map((budget) => (
                        <BudgetCard
                            key={budget._id}
                            budget={budget}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            ) : (
                <Card className="p-8 text-center">
                    <p className="text-muted-foreground mb-4">
                        No budgets set yet. Create your first budget to start tracking your
                        spending!
                    </p>
                    <Button variant="outline" onClick={handleAdd} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create Your First Budget
                    </Button>
                </Card>
            )}

            {/* Budget Form Dialog */}
            <BudgetDialog
                open={dialogOpen}
                onClose={() => {
                    setDialogOpen(false);
                    setEditingBudget(null);
                }}
                onSave={handleSave}
                budget={editingBudget}
                categories={editingBudget ? categories : availableCategories}
            />
        </div>
    );
}
