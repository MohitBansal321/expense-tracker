import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import DeleteSharpIcon from "@mui/icons-material/DeleteSharp";
import EditSharpIcon from "@mui/icons-material/EditSharp";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import dayjs from "dayjs";
import Cookies from "js-cookie";
import * as React from "react";
import { useSelector } from "react-redux";

// Define the TransactionsList component
export default function TransactionsList({ data, fetchTransactions, setEditTransaction, setCategoryFilter }) {
  // Get the user data from the Redux store
  const user = useSelector((state) => state.auth.user);
  const [selectedCategory, setSelectedCategory] = React.useState(null);

  const handleChange = (event, value) => {
    if (value) {
      console.log("Selected value: " + value._id);
      setSelectedCategory(value); // Update local state with selected category
      setCategoryFilter(value._id); // Update filter
    } else {
      console.log("Cleared input");
      setSelectedCategory(null); // Reset local state when cleared
      setCategoryFilter(''); // Reset filter
    }
  };

  // Function to retrieve category name by its ID
  function categoryName(id) {
    const category = user.categories.find((category) => category._id === id);
    return category ? category.label : null;
  }

  // Function to remove a transaction
  async function remove(_id) {
    const token = Cookies.get("token");

    // Display a confirmation dialog before deletion
    if (!window.confirm("Are you sure")) return;

    // Send a DELETE request to remove the transaction
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/transaction/${_id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      // Fetch transactions again to update the list
      fetchTransactions();
      window.alert("Deleted Successfully");
    }
  }

  // Function to format the date in a specific format
  function formatDate(date) {
    return dayjs(date).format("DD MMM, YYYY");
  }

  // Calculate totals for the summary
  const totals = React.useMemo(() => {
    let income = 0;
    let expense = 0;
    data?.forEach(month => {
      month.transactions?.forEach(tx => {
        if (tx.type === "income") {
          income += tx.amount || 0;
        } else {
          expense += tx.amount || 0;
        }
      });
    });
    return { income, expense, net: income - expense };
  }, [data]);

  return (
    <>
      {/* Summary Section */}
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3, mt: { xs: 4, md: 10 }, mb: 4 }}>
        <Paper sx={{ p: 2, flex: 1, borderLeft: "4px solid #4CAF50" }}>
          <Typography variant="body2" color="text.secondary">Total Income</Typography>
          <Typography variant="h6" sx={{ color: "#4CAF50", fontWeight: 600 }}>
            ${totals.income.toLocaleString()}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, borderLeft: "4px solid #f44336" }}>
          <Typography variant="body2" color="text.secondary">Total Expenses</Typography>
          <Typography variant="h6" sx={{ color: "#f44336", fontWeight: 600 }}>
            ${totals.expense.toLocaleString()}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, borderLeft: `4px solid ${totals.net >= 0 ? "#2196F3" : "#ff9800"}` }}>
          <Typography variant="body2" color="text.secondary">Net Balance</Typography>
          <Typography variant="h6" sx={{ color: totals.net >= 0 ? "#2196F3" : "#ff9800", fontWeight: 600 }}>
            ${totals.net.toLocaleString()}
          </Typography>
        </Paper>
      </Box>

      {/* Display a title for the list of transactions */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6">
          List of Transactions
        </Typography>
        <Autocomplete
          isOptionEqualToValue={(option, value) => option._id === value._id}
          value={selectedCategory}
          onChange={handleChange}
          id="controllable-states-demo"
          options={user.categories}
          sx={{ width: 200 }}
          renderInput={(params) => <TextField {...params} size="small" label="Filter by Category" />}
        />
      </Box>

      {/* Responsive List Display */}
      {/* Mobile View (Cards) */}
      <Box sx={{ display: { xs: "block", md: "none" } }}>
        {data.map((month) =>
          month.transactions.map((row) => {
            const isIncome = row.type === "income";
            return (
              <Paper
                key={row._id}
                sx={{
                  p: 2,
                  mb: 2,
                  borderLeft: `4px solid ${isIncome ? "#4CAF50" : "#f44336"}`,
                  borderRadius: 2
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>{row.description}</Typography>
                    <Typography variant="caption" color="text.secondary">{formatDate(row.date)}</Typography>
                  </Box>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    sx={{ color: isIncome ? "#4CAF50" : "#f44336" }}
                  >
                    {isIncome ? "+" : "-"}${row.amount}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Chip
                    label={categoryName(row.category_id)}
                    size="small"
                    variant="outlined"
                  />
                  <Box>
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => setEditTransaction(row)}
                    >
                      <EditSharpIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      color="warning"
                      size="small"
                      onClick={() => remove(row._id)}
                    >
                      <DeleteSharpIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Paper>
            );
          })
        )}
      </Box>

      {/* Desktop View (Table) */}
      <TableContainer component={Paper} sx={{ display: { xs: "none", md: "block" } }}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          {/* Define the table header */}
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell align="center" sx={{ fontWeight: 600 }}>Type</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>Amount</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>Description</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>Category</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>Action</TableCell>
            </TableRow>
          </TableHead>

          {/* Populate the table with transaction data */}
          <TableBody>
            {data.map((month) =>
              month.transactions.map((row) => {
                const isIncome = row.type === "income";
                return (
                  <TableRow
                    key={row._id}
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                      "&:hover": { backgroundColor: "#fafafa" },
                      borderLeft: `3px solid ${isIncome ? "#4CAF50" : "#f44336"}`
                    }}
                  >
                    <TableCell align="center">
                      <Chip
                        icon={isIncome ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                        label={isIncome ? "Income" : "Expense"}
                        size="small"
                        sx={{
                          backgroundColor: isIncome ? "#e8f5e9" : "#ffebee",
                          color: isIncome ? "#4CAF50" : "#f44336",
                          fontWeight: 500,
                          "& .MuiChip-icon": {
                            color: isIncome ? "#4CAF50" : "#f44336"
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell
                      align="center"
                      component="th"
                      scope="row"
                      sx={{
                        fontWeight: 600,
                        color: isIncome ? "#4CAF50" : "#f44336"
                      }}
                    >
                      {isIncome ? "+" : "-"}${row.amount}
                    </TableCell>
                    <TableCell align="center">{row.description}</TableCell>
                    <TableCell align="center">{categoryName(row.category_id)}</TableCell>
                    <TableCell align="center">{formatDate(row.date)}</TableCell>
                    <TableCell align="center">
                      {/* Edit and Delete buttons for each transaction */}
                      <IconButton
                        color="primary"
                        component="label"
                        onClick={() => setEditTransaction(row)}
                      >
                        <EditSharpIcon />
                      </IconButton>

                      <IconButton color="warning" component="label" onClick={() => remove(row._id)}>
                        <DeleteSharpIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

