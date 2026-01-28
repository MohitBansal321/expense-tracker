// Budget management page
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import LinearProgress from "@mui/material/LinearProgress";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Skeleton from "@mui/material/Skeleton";
import Slider from "@mui/material/Slider";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

// Summary Card Component
function SummaryCard({ title, value, color, prefix = "$" }) {
    return (
        <Paper sx={{ p: 2, borderLeft: `4px solid ${color}`, height: "100%" }}>
            <Typography variant="body2" color="text.secondary">{title}</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, color }}>
                {prefix}{typeof value === "number" ? value.toLocaleString() : value}
            </Typography>
        </Paper>
    );
}

// Budget Card Component
function BudgetCard({ budget, onEdit, onDelete }) {
    const progressColor = budget.isOverBudget
        ? "#f44336"
        : budget.isNearLimit
            ? "#ff9800"
            : "#4CAF50";

    return (
        <Card
            sx={{
                height: "100%",
                borderLeft: `4px solid ${progressColor}`,
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 3
                }
            }}
        >
            <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {budget.categoryName}
                        </Typography>
                        <Chip
                            label={budget.period}
                            size="small"
                            sx={{ mt: 0.5, textTransform: "capitalize" }}
                        />
                    </Box>
                    <Box>
                        <IconButton size="small" onClick={() => onEdit(budget)} color="primary">
                            <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => onDelete(budget._id)} color="error">
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            ${budget.currentSpending.toLocaleString()} of ${budget.amount.toLocaleString()}
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: progressColor }}
                        >
                            {budget.percentageUsed}%
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={Math.min(budget.percentageUsed, 100)}
                        sx={{
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: `${progressColor}20`,
                            "& .MuiLinearProgress-bar": {
                                backgroundColor: progressColor,
                                borderRadius: 5
                            }
                        }}
                    />
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                        Remaining: <strong>${budget.remaining.toLocaleString()}</strong>
                    </Typography>
                    {budget.isOverBudget && (
                        <Chip
                            icon={<ErrorIcon />}
                            label="Over Budget"
                            size="small"
                            color="error"
                        />
                    )}
                    {budget.isNearLimit && !budget.isOverBudget && (
                        <Chip
                            icon={<WarningIcon />}
                            label="Near Limit"
                            size="small"
                            color="warning"
                        />
                    )}
                </Box>
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
        alertThreshold: 80
    });

    useEffect(() => {
        if (budget) {
            setForm({
                category_id: budget.category_id || "",
                amount: budget.amount || 1000,
                period: budget.period || "monthly",
                alertThreshold: budget.alertThreshold || 80
            });
        } else {
            setForm({
                category_id: "",
                amount: 1000,
                period: "monthly",
                alertThreshold: 80
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

    const getCategoryById = () => {
        return categories.find(c => c._id === form.category_id) || null;
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 600 }}>
                {budget ? "Edit Budget" : "Create New Budget"}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
                    <Autocomplete
                        value={getCategoryById()}
                        onChange={(e, newValue) => setForm({ ...form, category_id: newValue?._id || "" })}
                        options={categories}
                        getOptionLabel={(option) => option.label || ""}
                        isOptionEqualToValue={(option, value) => option._id === value._id}
                        disabled={!!budget}
                        renderInput={(params) => (
                            <TextField {...params} label="Category" required />
                        )}
                    />

                    <TextField
                        label="Budget Amount ($)"
                        type="number"
                        value={form.amount}
                        onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                        required
                        InputProps={{ inputProps: { min: 0 } }}
                    />

                    <FormControl fullWidth>
                        <InputLabel>Period</InputLabel>
                        <Select
                            value={form.period}
                            label="Period"
                            onChange={(e) => setForm({ ...form, period: e.target.value })}
                        >
                            <MenuItem value="weekly">Weekly</MenuItem>
                            <MenuItem value="monthly">Monthly</MenuItem>
                            <MenuItem value="yearly">Yearly</MenuItem>
                        </Select>
                    </FormControl>

                    <Box>
                        <Typography gutterBottom>
                            Alert Threshold: {form.alertThreshold}%
                        </Typography>
                        <Slider
                            value={form.alertThreshold}
                            onChange={(e, val) => setForm({ ...form, alertThreshold: val })}
                            min={50}
                            max={100}
                            step={5}
                            marks
                            valueLabelDisplay="auto"
                        />
                        <Typography variant="caption" color="text.secondary">
                            You'll be warned when spending reaches this percentage
                        </Typography>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={handleSubmit}>
                    {budget ? "Update" : "Create"}
                </Button>
            </DialogActions>
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
                headers: { Authorization: `Bearer ${token}` }
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
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(form)
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
        if (!window.confirm("Are you sure you want to delete this budget?")) return;

        const token = Cookies.get("token");

        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/budget/${budgetId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

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
        cat => !budgets.some(b => b.category_id?.toString() === cat._id?.toString())
    );

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Page Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        Budget Manager
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Set spending limits and track your progress
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAdd}
                    disabled={availableCategories.length === 0}
                >
                    Add Budget
                </Button>
            </Box>

            {/* Alerts */}
            {budgets.filter(b => b.isOverBudget).length > 0 && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    <strong>{budgets.filter(b => b.isOverBudget).length}</strong> budget(s) exceeded!
                    Review your spending in the highlighted categories.
                </Alert>
            )}
            {budgets.filter(b => b.isNearLimit && !b.isOverBudget).length > 0 && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    <strong>{budgets.filter(b => b.isNearLimit && !b.isOverBudget).length}</strong> budget(s)
                    approaching limit. Consider reducing spending.
                </Alert>
            )}

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    {isLoading ? (
                        <Skeleton variant="rectangular" height={80} />
                    ) : (
                        <SummaryCard
                            title="Total Budget"
                            value={summary.totalBudget || 0}
                            color="#2196F3"
                        />
                    )}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    {isLoading ? (
                        <Skeleton variant="rectangular" height={80} />
                    ) : (
                        <SummaryCard
                            title="Total Spent"
                            value={summary.totalSpending || 0}
                            color="#f44336"
                        />
                    )}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    {isLoading ? (
                        <Skeleton variant="rectangular" height={80} />
                    ) : (
                        <SummaryCard
                            title="Remaining"
                            value={(summary.totalBudget || 0) - (summary.totalSpending || 0)}
                            color="#4CAF50"
                        />
                    )}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    {isLoading ? (
                        <Skeleton variant="rectangular" height={80} />
                    ) : (
                        <SummaryCard
                            title="Over Budget"
                            value={summary.budgetsOverLimit || 0}
                            color="#ff9800"
                            prefix=""
                        />
                    )}
                </Grid>
            </Grid>

            {/* Budget Cards */}
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Your Budgets
            </Typography>

            {isLoading ? (
                <Grid container spacing={3}>
                    {[1, 2, 3].map(i => (
                        <Grid item xs={12} sm={6} md={4} key={i}>
                            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
                        </Grid>
                    ))}
                </Grid>
            ) : budgets.length > 0 ? (
                <Grid container spacing={3}>
                    {budgets.map(budget => (
                        <Grid item xs={12} sm={6} md={4} key={budget._id}>
                            <BudgetCard
                                budget={budget}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Paper sx={{ p: 4, textAlign: "center" }}>
                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                        No budgets set yet. Create your first budget to start tracking your spending!
                    </Typography>
                    <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAdd}>
                        Create Your First Budget
                    </Button>
                </Paper>
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
        </Container>
    );
}
