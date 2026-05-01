import React, { useMemo, useState } from "react";
import Cookies from "js-cookie";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { 
  Trash2, 
  Pencil, 
  ArrowUp, 
  ArrowDown, 
  Search,
  ArrowRightLeft,
  Filter
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { deleteTransaction } from "../../../services/transaction.service";

export default function TransactionsList({ data, fetchTransactions, setEditTransaction, setCategoryFilter }) {
  const user = useSelector((state) => state.auth.user);
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleFilterChange = (value) => {
    setSelectedCategory(value);
    setCategoryFilter(value === "all" ? "" : value);
  };

  function categoryName(id) {
    const category = user?.categories?.find((c) => c._id === id);
    return category ? category.label : "Uncategorized";
  }

  async function remove(_id) {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;

    try {
      const result = await deleteTransaction(_id);
      if (result.success) {
        fetchTransactions();
        toast.success("Transaction deleted successfully");
      }
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error(error.message || "Failed to delete transaction");
    }
  }

  function formatDate(date) {
    return dayjs(date).format("DD MMM, YYYY");
  }

  const totals = useMemo(() => {
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

  const transactions = useMemo(() => {
    const all = [];
    data?.forEach(month => {
        month.transactions?.forEach(tx => {
            all.push(tx);
        });
    });
    // Sort all transactions by date descending
    return all.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [data]);

  return (
    <div className="space-y-8">
      {/* Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 mb-10">
        <div className="bg-card ember-glow p-6 rounded-xl border-none shadow-sm transition-all card-hover">
          <p className="label-caps text-muted-foreground mb-1">Total Income</p>
          <p className="text-2xl font-bold font-headline text-ember">
            ${totals.income.toLocaleString()}
          </p>
        </div>
        <div className="bg-card ember-glow p-6 rounded-xl border-none shadow-sm transition-all card-hover">
          <p className="label-caps text-muted-foreground mb-1">Total Expenses</p>
          <p className="text-2xl font-bold font-headline text-sage">
            ${totals.expense.toLocaleString()}
          </p>
        </div>
        <div className={cn(
            "bg-card ember-glow p-6 rounded-xl border-none shadow-sm transition-all card-hover"
        )}>
          <p className="label-caps text-muted-foreground mb-1">Net Balance</p>
          <p className={cn(
              "text-2xl font-bold font-headline",
              totals.net >= 0 ? "text-primary" : "text-sand"
          )}>
            ${totals.net.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-primary" /> Transactions
        </h3>
        <div className="relative w-full sm:w-64">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select
                value={selectedCategory}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="w-full h-10 pl-9 pr-4 bg-card ember-glow text-foreground border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
            >
                <option value="all">All Categories</option>
                {user?.categories?.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                        {cat.label}
                    </option>
                ))}
            </select>
        </div>
      </div>

      {/* Mobile View (Cards) */}
      <div className="space-y-4 md:hidden">
        {transactions.length > 0 ? (
          transactions.map((row) => {
            const isIncome = row.type === "income";
            return (
              <div
                key={row._id}
                className={cn(
                    "p-5 rounded-xl border-none ember-glow bg-card transition-all"
                )}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-foreground leading-tight">{row.description}</h4>
                    <span className="text-xs text-muted-foreground">{formatDate(row.date)}</span>
                  </div>
                  <div className={cn(
                      "text-lg font-bold font-headline financial-number",
                      isIncome ? "text-ember" : "text-sage"
                  )}>
                    {isIncome ? "+" : "-"}${row.amount.toLocaleString()}
                  </div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-border">
                  <Badge variant="outline" className="rounded-full bg-muted font-medium text-muted-foreground border-border">
                    {categoryName(row.category_id)}
                  </Badge>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                      onClick={() => setEditTransaction(row)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-sage hover:text-sage hover:bg-sage/10"
                      onClick={() => remove(row._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center flex flex-col items-center justify-center border-none rounded-[2rem] bg-card ember-glow/50 backdrop-blur-sm mt-4">
             <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 ring-4 ring-background">
                 <Search className="w-6 h-6 text-gray-400 dark:text-gray-500 animate-[pulse_3s_ease-in-out_infinite]" />
             </div>
             <h3 className="text-lg font-bold text-foreground mb-1">No Transactions</h3>
             <p className="text-sm text-muted-foreground px-4">Try adjusting your filters or add a new transaction.</p>
          </div>
        )}
      </div>

      {/* Desktop View (Table) */}
      <div className="hidden md:block overflow-hidden rounded-[2rem] border-none bg-card ember-glow shadow-xl">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase tracking-widest bg-card ember-glow/50">
            <tr>
              <th className="px-6 py-5 font-semibold text-center">Type</th>
              <th className="px-6 py-5 font-semibold text-center">Amount</th>
              <th className="px-6 py-5 font-semibold">Description</th>
              <th className="px-6 py-5 font-semibold">Category</th>
              <th className="px-6 py-5 font-semibold">Date</th>
              <th className="px-6 py-5 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {transactions.map((row) => {
              const isIncome = row.type === "income";
              return (
                <tr
                  key={row._id}
                  className="group hover:bg-muted/50 transition-colors"
                >
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110",
                            isIncome ? "bg-ember/10 text-ember" : "bg-sage/10 text-sage"
                        )}>
                            {isIncome ? <ArrowUp className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={cn(
                        "text-base font-bold font-headline financial-number",
                        isIncome ? "text-ember" : "text-sage"
                    )}>
                      {isIncome ? "+" : "-"}${row.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-foreground">
                    {row.description}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className="rounded-full bg-muted border-border font-medium">
                      {categoryName(row.category_id)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground italic">
                    {formatDate(row.date)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-primary hover:bg-primary/10 rounded-full"
                        onClick={() => setEditTransaction(row)}
                      >
                        <Pencil className="w-4.5 h-4.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-sage hover:bg-sage/10 rounded-full"
                        onClick={() => remove(row._id)}
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {transactions.length === 0 && (
            <div className="py-24 text-center flex flex-col items-center justify-center min-h-[300px] border-t border-dashed border-border/50">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6 ring-8 ring-background transition-all hover:scale-110 duration-300">
                    <Search className="w-8 h-8 text-gray-400 dark:text-gray-500 animate-[pulse_3s_ease-in-out_infinite]" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No Transactions Found</h3>
                <p className="text-muted-foreground max-w-sm mx-auto text-base">We couldn't find any transactions matching your current filters. Try adjusting your search criteria or add new entry.</p>
            </div>
        )}
      </div>
    </div>
  );
}

