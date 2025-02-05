import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

// Initial form state for creating or editing transactions
const InitialForm = {
  amount: 0,
  description: "",
  date: new Date(),
  category_id: "",
};

// TransactionForm component for adding or editing transactions
export default function TransactionForm({ fetchTransactions, editTransaction }) {
  // Get user categories from Redux store
  const { categories } = useSelector((state) => state.auth.user);

  // Get user token from cookies
  const token = Cookies.get("token");

  // State to manage form data
  const [form, setForm] = useState(InitialForm);

  // Update form data when editing a transaction
  useEffect(() => {
    if (editTransaction.amount !== undefined) {
      setForm(editTransaction);
    }
  }, [editTransaction]);

  // Handle changes in form input fields
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Handle changes in the transaction date
  function handleDate(newValue) {
    setForm({ ...form, date: newValue });
  }

  // Handle form submission (create or update transaction)
  async function handleSubmit(e) {
    e.preventDefault();
    editTransaction.amount === undefined ? create() : update();
    if(editTransaction.amount!==undefined) editTransaction.amount=undefined
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
    if((!form.date || isNaN(new Date(form.date).getTime()))) {
      alert(`Please enter a valid date`);
      return false;
    }
    return true;
  }

  // Create a new transaction
  async function create() {
    if(!formValidation(form)) return;
    const res = await fetch(`${process.env.REACT_APP_BASE_URL}/transaction`, {
      method: "POST",
      body: JSON.stringify(form),
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    reload(res);
  }

  // Update an existing transaction
  async function update() {
    if(!formValidation(form)) return;
    const res = await fetch(
      `${process.env.REACT_APP_BASE_URL}/transaction/${editTransaction._id}`,
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

  return (
    <Card sx={{ minWidth: 275, marginTop: 10 }}>
      <CardContent>
        <Typography variant="h6">Add New Transaction</Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex" }}>
          {/* Input field for transaction amount */}
          <TextField
            sx={{ marginRight: 5 }}
            id="outlined-basic"
            label="Amount"
            type="number"
            size="small"
            name="amount"
            variant="outlined"
            value={form.amount}
            onChange={handleChange}
          />

          {/* Input field for transaction description */}
          <TextField
            sx={{ marginRight: 5 }}
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
                <TextField sx={{ marginRight: 5 }} size="small" {...params} />
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
            sx={{ width: 200, marginRight: 5 }}
            renderInput={(params) => <TextField {...params} size="small" label="Category" />}
          />

          {/* Submit button (Update or Submit) */}
          {editTransaction.amount !== undefined && (
            <Button type="submit" variant="contained">
              Update
            </Button>
          )}

          {editTransaction.amount === undefined && (
            <Button type="submit" variant="contained">
              Submit
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
