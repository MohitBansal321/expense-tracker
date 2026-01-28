import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RepeatIcon from "@mui/icons-material/Repeat";
import Alert from "@mui/material/Alert";
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
import Fab from "@mui/material/Fab";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Skeleton from "@mui/material/Skeleton";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

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
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/recurring`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const result = await res.json();
            if (result.success) {
                setRecurringList(result.data);
            }
        } catch (error) {
            console.error("Failed to fetch recurring transactions:", error);
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

    async function handleSubmit() {
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
        <Container maxWidth="lg" sx={{ py: 3 }}>
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
                    <RepeatIcon fontSize="large" /> Recurring Transactions
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => openDialog()}
                    sx={{ display: { xs: "none", md: "flex" } }}
                >
                    Add Recurring
                </Button>
            </Box>

            {/* Info Alert */}
            <Alert severity="info" sx={{ mb: 3 }}>
                Recurring transactions are automatically created based on your schedule. Active transactions will be processed daily.
            </Alert>

            {/* Recurring Transactions List */}
            <Grid container spacing={2}>
                {isLoading ? (
                    [...Array(3)].map((_, i) => (
                        <Grid item xs={12} md={6} lg={4} key={i}>
                            <Skeleton variant="rounded" height={180} />
                        </Grid>
                    ))
                ) : recurringList.length === 0 ? (
                    <Grid item xs={12}>
                        <Card sx={{ p: 4, textAlign: "center" }}>
                            <RepeatIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">
                                No recurring transactions yet
                            </Typography>
                            <Typography color="text.secondary" sx={{ mb: 2 }}>
                                Set up automatic transactions for bills, subscriptions, or regular income
                            </Typography>
                            <Button variant="contained" onClick={() => openDialog()}>
                                Create First Recurring Transaction
                            </Button>
                        </Card>
                    </Grid>
                ) : (
                    recurringList.map((item) => (
                        <Grid item xs={12} md={6} lg={4} key={item._id}>
                            <Card
                                sx={{
                                    height: "100%",
                                    borderLeft: `4px solid ${item.type === "income" ? "#4CAF50" : "#f44336"}`,
                                    opacity: item.isActive ? 1 : 0.6,
                                }}
                            >
                                <CardContent>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                {item.description}
                                            </Typography>
                                            <Typography
                                                variant="h5"
                                                sx={{ color: item.type === "income" ? "#4CAF50" : "#f44336", fontWeight: 700 }}
                                            >
                                                {item.type === "income" ? "+" : "-"}${item.amount.toFixed(2)}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            label={item.isActive ? "Active" : "Paused"}
                                            color={item.isActive ? "success" : "default"}
                                            size="small"
                                        />
                                    </Box>

                                    <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                                        <Chip
                                            icon={<RepeatIcon />}
                                            label={item.frequency.charAt(0).toUpperCase() + item.frequency.slice(1)}
                                            size="small"
                                            variant="outlined"
                                        />
                                        <Chip label={item.categoryName} size="small" variant="outlined" />
                                    </Box>

                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        Next: {formatNextExecution(item.nextExecution)}
                                    </Typography>

                                    <Box sx={{ display: "flex", gap: 1 }}>
                                        <Tooltip title={item.isActive ? "Pause" : "Resume"}>
                                            <IconButton size="small" onClick={() => handleToggle(item._id)}>
                                                {item.isActive ? <PauseIcon /> : <PlayArrowIcon />}
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Edit">
                                            <IconButton size="small" onClick={() => openDialog(item)}>
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton size="small" color="error" onClick={() => handleDelete(item._id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>

            {/* FAB for mobile */}
            <Fab
                color="primary"
                sx={{ position: "fixed", bottom: 24, right: 24, display: { md: "none" } }}
                onClick={() => openDialog()}
            >
                <AddIcon />
            </Fab>

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{editItem ? "Edit Recurring Transaction" : "New Recurring Transaction"}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
                        {/* Type Toggle */}
                        <ToggleButtonGroup
                            value={form.type}
                            exclusive
                            onChange={(e, val) => val && setForm({ ...form, type: val })}
                            fullWidth
                        >
                            <ToggleButton value="expense" sx={{ color: form.type === "expense" ? "#f44336" : "inherit" }}>
                                Expense
                            </ToggleButton>
                            <ToggleButton value="income" sx={{ color: form.type === "income" ? "#4CAF50" : "inherit" }}>
                                Income
                            </ToggleButton>
                        </ToggleButtonGroup>

                        <TextField
                            label="Description"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            fullWidth
                            required
                        />

                        <TextField
                            label="Amount"
                            type="number"
                            value={form.amount}
                            onChange={(e) => setForm({ ...form, amount: e.target.value })}
                            fullWidth
                            required
                            InputProps={{ startAdornment: "$" }}
                        />

                        <FormControl fullWidth>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={form.category_id}
                                label="Category"
                                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                            >
                                {categories.map((cat) => (
                                    <MenuItem key={cat._id} value={cat._id}>
                                        {cat.icon} {cat.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>Frequency</InputLabel>
                            <Select
                                value={form.frequency}
                                label="Frequency"
                                onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                            >
                                {FREQUENCY_OPTIONS.map((opt) => (
                                    <MenuItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {form.frequency === "weekly" && (
                            <FormControl fullWidth>
                                <InputLabel>Day of Week</InputLabel>
                                <Select
                                    value={form.dayOfWeek}
                                    label="Day of Week"
                                    onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}
                                >
                                    {DAY_OPTIONS.map((opt) => (
                                        <MenuItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {form.frequency === "monthly" && (
                            <TextField
                                label="Day of Month"
                                type="number"
                                value={form.dayOfMonth}
                                onChange={(e) => setForm({ ...form, dayOfMonth: parseInt(e.target.value) || 1 })}
                                inputProps={{ min: 1, max: 31 }}
                                fullWidth
                            />
                        )}

                        <TextField
                            label="Start Date"
                            type="date"
                            value={form.startDate}
                            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                        />

                        <TextField
                            label="End Date (Optional)"
                            type="date"
                            value={form.endDate}
                            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            helperText="Leave empty for indefinite recurrence"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={!form.amount || !form.description || !form.category_id}
                    >
                        {editItem ? "Update" : "Create"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
