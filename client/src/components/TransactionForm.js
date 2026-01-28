import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Confetti from "react-confetti";

// Initial form state for creating or editing transactions
const InitialForm = {
  amount: 0,
  description: "",
  date: new Date(),
  category_id: "",
  type: "expense", // Default to expense
};

// TransactionForm component for adding or editing transactions
export default function TransactionForm({ fetchTransactions, editTransaction }) {
  // Get user categories from Redux store
  const { categories } = useSelector((state) => state.auth.user);

  // Get user token from cookies
  const token = Cookies.get("token");

  // State to manage form data
  const [form, setForm] = useState(InitialForm);
  const [showConfetti, setShowConfetti] = useState(false);

  // Update form data when editing a transaction
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  useEffect(() => {
    if (editTransaction.amount !== undefined) {
      setForm({
        ...editTransaction,
        type: editTransaction.type || "expense" // Default to expense if not set
      });
    }
  }, [editTransaction]);

  // Handle changes in form input fields
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Handle transaction type change
  function handleTypeChange(event, newType) {
    if (newType !== null) {
      setForm({ ...form, type: newType });
    }
  }

  // Handle changes in the transaction date
  function handleDate(newValue) {
    setForm({ ...form, date: newValue });
  }

  // Handle form submission (create or update transaction)
  async function handleSubmit(e) {
    e.preventDefault();
    editTransaction.amount === undefined ? create() : update();
    if (editTransaction.amount !== undefined) editTransaction.amount = undefined
  }

  // Helper function to reload data after creating or updating a transaction
  function reload(res) {
    if (res.ok) {
      setForm(InitialForm);
      fetchTransactions();
    }
  }

  function formValidation(form) {
    if (form.description === "" || form.category_id === "") {
      alert(`Please fill all the fields`);
      return false;
    }
    if (form.amount <= 0) {
      alert(`Please enter a valid amount`);
      return false;
    }
    if ((!form.date || isNaN(new Date(form.date).getTime()))) {
      alert(`Please enter a valid date`);
      return false;
    }
    return true;
  }

  // Create a new transaction
  async function create() {
    if (!formValidation(form)) return;
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/transaction`, {
      method: "POST",
      body: JSON.stringify(form),
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    reload(res);
    if (res.ok) setShowConfetti(true);
  }

  // Update an existing transaction
  async function update() {
    if (!formValidation(form)) return;
    const res = await fetch(
      `${import.meta.env.VITE_BASE_URL}/transaction/${editTransaction._id}`,
      {
        method: "PATCH",
        body: JSON.stringify(form),
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    reload(res);
  }

  // Helper function to get the category name by its ID
  function getCategoryNameById() {
    return categories.find((category) => category._id === form.category_id) ?? null;
  }

  // Determine card border color based on transaction type
  const cardBorderColor = form.type === "income" ? "#4CAF50" : "#f44336";

  return (
    <Card
      sx={{
        minWidth: 275,
        marginTop: 10,
        borderLeft: `4px solid ${cardBorderColor}`,
        transition: "border-color 0.3s ease"
      }}
    >
      {showConfetti && <Confetti numberOfPieces={200} recycle={false} />}
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6">
            Add New {form.type === "income" ? "Income" : "Expense"}
          </Typography>

          {/* Transaction Type Toggle */}
          <ToggleButtonGroup
            value={form.type}
            exclusive
            onChange={handleTypeChange}
            aria-label="transaction type"
            size="small"
          >
            <ToggleButton
              value="expense"
              aria-label="expense"
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "#ffebee",
                  color: "#f44336",
                  "&:hover": {
                    backgroundColor: "#ffcdd2",
                  }
                }
              }}
            >
              Expense
            </ToggleButton>
            <ToggleButton
              value="income"
              aria-label="income"
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "#e8f5e9",
                  color: "#4CAF50",
                  "&:hover": {
                    backgroundColor: "#c8e6c9",
                  }
                }
              }}
            >
              Income
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          {/* Input field for transaction amount */}
          <TextField
            id="outlined-basic"
            label="Amount"
            type="number"
            size="small"
            name="amount"
            variant="outlined"
            value={form.amount}
            onChange={handleChange}
            sx={{
              "& .MuiOutlinedInput-root": {
                "&.Mui-focused fieldset": {
                  borderColor: cardBorderColor,
                }
              }
            }}
          />

          {/* Input field for transaction description */}
          <TextField
            id="outlined-basic"
            label="Description"
            size="small"
            name="description"
            variant="outlined"
            value={form.description}
            onChange={handleChange}
          />

          {/* Date picker for transaction date */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DesktopDatePicker
              label="Transaction Date"
              inputFormat="MM/DD/YYYY"
              value={form.date}
              onChange={handleDate}
              renderInput={(params) => (
                <TextField size="small" {...params} />
              )}
            />
          </LocalizationProvider>

          {/* Autocomplete for selecting transaction category */}
          <Autocomplete
            isOptionEqualToValue={(option, value) => option._id === value._id}
            value={getCategoryNameById()}
            onChange={(event, newValue) => {
              setForm({ ...form, category_id: newValue._id });
            }}
            id="controllable-states-demo"
            options={categories}
            sx={{ width: 200 }}
            renderInput={(params) => <TextField {...params} size="small" label="Category" />}
          />

          {/* Submit button (Update or Submit) */}
          {editTransaction.amount !== undefined && (
            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: cardBorderColor,
                "&:hover": {
                  backgroundColor: form.type === "income" ? "#388E3C" : "#d32f2f"
                }
              }}
            >
              Update
            </Button>
          )}

          {editTransaction.amount === undefined && (
            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: cardBorderColor,
                "&:hover": {
                  backgroundColor: form.type === "income" ? "#388E3C" : "#d32f2f"
                }
              }}
            >
              Submit
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

