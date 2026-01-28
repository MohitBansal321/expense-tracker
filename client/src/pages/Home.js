// Import necessary modules and libraries from React and your application
import ClearIcon from "@mui/icons-material/Clear";
import DownloadIcon from "@mui/icons-material/Download";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Fab from "@mui/material/Fab";
import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import TransactionChart from "../components/TransactionChart";
import TransactionForm from "../components/TransactionForm";
import TransactionsList from "../components/TransactionsList";

// A React component for the Home page
export default function Home() {
  // State to store transaction data and the transaction being edited
  const [transactions, setTransactions] = useState([]);
  const [editTransaction, setEditTransaction] = useState({});
  const [categoryFilter, setCategoryFilter] = React.useState('');
  const [openForm, setOpenForm] = useState(false);

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Use useEffect to fetch transactions when the component mounts
  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    fetchTransactions(categoryFilter);
  }, [categoryFilter]);

  // Handle edit request
  useEffect(() => {
    if (editTransaction._id) {
      setOpenForm(true);
    }
  }, [editTransaction]);

  // Function to fetch transactions from the server
  async function fetchTransactions(categoryFilter = '') {
    const token = Cookies.get("token");
    let url = `${import.meta.env.VITE_BASE_URL}/transaction`;
    if (categoryFilter !== '') {
      url += `/${categoryFilter}`;
    }

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const { data } = await res.json();
    setTransactions(data);
  }

  // Function to handle search
  async function handleSearch() {
    const token = Cookies.get("token");
    const params = new URLSearchParams();

    if (searchQuery) params.append('query', searchQuery);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (typeFilter && typeFilter !== 'all') params.append('type', typeFilter);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/transaction/search?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const result = await res.json();

      if (result.success) {
        // Convert flat list to grouped format for compatibility with existing components
        const grouped = {};
        result.data.forEach(tx => {
          const date = new Date(tx.date);
          const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
          if (!grouped[key]) {
            grouped[key] = {
              _id: { year: date.getFullYear(), month: date.getMonth() + 1 },
              transactions: [],
              totalExpenses: 0
            };
          }
          grouped[key].transactions.push(tx);
          grouped[key].totalExpenses += tx.amount || 0;
        });
        setTransactions(Object.values(grouped).sort((a, b) => {
          if (a._id.year !== b._id.year) return b._id.year - a._id.year;
          return b._id.month - a._id.month;
        }));
      }
    } catch (error) {
      console.error("Search failed:", error);
    }
  }

  // Function to clear search filters
  function clearFilters() {
    setSearchQuery('');
    setTypeFilter('all');
    setStartDate('');
    setEndDate('');
    setCategoryFilter('');
    fetchTransactions();
  }

  // Function to export transactions as CSV
  async function handleExport() {
    const token = Cookies.get("token");
    const params = new URLSearchParams();

    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/transaction/export?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export transactions");
    }
  }

  function handleFormClose() {
    setOpenForm(false);
    setEditTransaction({});
    fetchTransactions(); // Refresh on close
  }

  // Render the Home page with various components
  return (
    <Container maxWidth="lg" sx={{ py: 4, position: 'relative', minHeight: '80vh' }}>
      {/* Page Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Transactions
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and track your financial history
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
          size="small"
        >
          Export CSV
        </Button>
      </Box>

      {/* TransactionChart component */}
      <TransactionChart data={transactions} />

      {/* Search and Filter Section */}
      <Paper elevation={0} sx={{ p: 2, mb: 4, mt: 4, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
          <TextField
            label="Search transactions..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            sx={{ flexGrow: 1, minWidth: 200 }}
            InputProps={{
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery('')}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <TextField
            label="From"
            type="date"
            size="small"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 140 }}
          />

          <TextField
            label="To"
            type="date"
            size="small"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 140 }}
          />

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={typeFilter}
              label="Type"
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="income">Income</MenuItem>
              <MenuItem value="expense">Expense</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
          >
            Search
          </Button>

          {(searchQuery || typeFilter !== 'all' || startDate || endDate) && (
            <Button variant="text" onClick={clearFilters} color="inherit">
              Clear
            </Button>
          )}
        </Box>
      </Paper>

      {/* TransactionsList component */}
      <TransactionsList
        data={transactions}
        fetchTransactions={fetchTransactions}
        setEditTransaction={setEditTransaction}
        setCategoryFilter={setCategoryFilter}
      />

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={() => setOpenForm(true)}
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          boxShadow: '0 4px 20px rgba(33, 150, 243, 0.4)'
        }}
      >
        <AddIcon />
      </Fab>

      {/* Helper Dialog for Transaction Form */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editTransaction._id ? "Edit Transaction" : "New Transaction"}</DialogTitle>
        <DialogContent>
          <TransactionForm
            fetchTransactions={handleFormClose}
            editTransaction={editTransaction}
          />
        </DialogContent>
      </Dialog>

    </Container>
  );
}

