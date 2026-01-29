// Home page (Transactions) with modern Shadcn UI design
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Search, X, Download, Plus, Calendar, Filter } from "lucide-react";

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
} from "../components/ui/dialog";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

// Components
import TransactionChart from "../components/TransactionChart";
import TransactionForm from "../components/TransactionForm";
import TransactionsList from "../components/TransactionsList";

export default function Home() {
  // State to store transaction data and the transaction being edited
  const [transactions, setTransactions] = useState([]);
  const [editTransaction, setEditTransaction] = useState({});
  const [categoryFilter, setCategoryFilter] = useState("");
  const [openForm, setOpenForm] = useState(false);

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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
  async function fetchTransactions(categoryFilter = "") {
    const token = Cookies.get("token");
    let url = `${import.meta.env.VITE_BASE_URL}/transaction`;
    if (categoryFilter !== "") {
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

    if (searchQuery) params.append("query", searchQuery);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (typeFilter && typeFilter !== "all") params.append("type", typeFilter);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/transaction/search?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const result = await res.json();

      if (result.success) {
        // Convert flat list to grouped format for compatibility with existing components
        const grouped = {};
        result.data.forEach((tx) => {
          const date = new Date(tx.date);
          const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
          if (!grouped[key]) {
            grouped[key] = {
              _id: { year: date.getFullYear(), month: date.getMonth() + 1 },
              transactions: [],
              totalExpenses: 0,
            };
          }
          grouped[key].transactions.push(tx);
          grouped[key].totalExpenses += tx.amount || 0;
        });
        setTransactions(
          Object.values(grouped).sort((a, b) => {
            if (a._id.year !== b._id.year) return b._id.year - a._id.year;
            return b._id.month - a._id.month;
          })
        );
      }
    } catch (error) {
      console.error("Search failed:", error);
    }
  }

  // Function to clear search filters
  function clearFilters() {
    setSearchQuery("");
    setTypeFilter("all");
    setStartDate("");
    setEndDate("");
    setCategoryFilter("");
    fetchTransactions();
  }

  // Function to export transactions as CSV
  async function handleExport() {
    const token = Cookies.get("token");
    const params = new URLSearchParams();

    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/transaction/export?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`;
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

  const hasActiveFilters =
    searchQuery || typeFilter !== "all" || startDate || endDate;

  // Render the Home page with various components
  return (
    <div className="container max-w-7xl mx-auto py-6 px-4 min-h-screen">
      {/* Page Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-4xl font-bold mb-1">Transactions</h1>
          <p className="text-muted-foreground">
            Manage and track your financial history
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleExport}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* TransactionChart component */}
      <div className="mb-6">
        <TransactionChart data={transactions} />
      </div>

      {/* Search and Filter Section */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-end">
            {/* Search Input */}
            <div className="flex-grow min-w-[200px]">
              <Label htmlFor="search" className="mb-1.5 block text-sm">
                Search transactions
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9 pr-9"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Start Date */}
            <div className="w-[140px]">
              <Label htmlFor="start-date" className="mb-1.5 block text-sm">
                From
              </Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            {/* End Date */}
            <div className="w-[140px]">
              <Label htmlFor="end-date" className="mb-1.5 block text-sm">
                To
              </Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            {/* Type Filter */}
            <div className="w-[130px]">
              <Label htmlFor="type-filter" className="mb-1.5 block text-sm">
                Type
              </Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger id="type-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search Button */}
            <Button
              onClick={handleSearch}
              className="gap-2"
            >
              <Search className="h-4 w-4" />
              Search
            </Button>

            {/* Clear Button */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          {/* Active Filters Badge */}
          {hasActiveFilters && (
            <div className="flex gap-2 items-center mt-3 pt-3 border-t">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Active filters:
              </span>
              {searchQuery && (
                <Badge variant="secondary">Search: {searchQuery}</Badge>
              )}
              {typeFilter !== "all" && (
                <Badge variant="secondary">
                  Type: {typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}
                </Badge>
              )}
              {startDate && <Badge variant="secondary">From: {startDate}</Badge>}
              {endDate && <Badge variant="secondary">To: {endDate}</Badge>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* TransactionsList component */}
      <TransactionsList
        data={transactions}
        fetchTransactions={fetchTransactions}
        setEditTransaction={setEditTransaction}
        setCategoryFilter={setCategoryFilter}
      />

      {/* Floating Action Button */}
      <button
        onClick={() => setOpenForm(true)}
        className="fixed bottom-8 right-8 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 flex items-center justify-center z-50"
        aria-label="Add transaction"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Helper Dialog for Transaction Form */}
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editTransaction._id ? "Edit Transaction" : "New Transaction"}
            </DialogTitle>
          </DialogHeader>
          <TransactionForm
            fetchTransactions={handleFormClose}
            editTransaction={editTransaction}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
