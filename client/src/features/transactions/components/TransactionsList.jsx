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
    const token = Cookies.get("token");
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;

    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/transaction/${_id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      fetchTransactions();
      toast.success("Transaction deleted successfully");
    } else {
      toast.error("Failed to delete transaction");
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
        <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800 p-6 rounded-3xl border-l-[6px] border-l-green-500 shadow-sm transition-all hover:shadow-md">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Income</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-500">
            ${totals.income.toLocaleString()}
          </p>
        </div>
        <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800 p-6 rounded-3xl border-l-[6px] border-l-red-500 shadow-sm transition-all hover:shadow-md">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Expenses</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-500">
            ${totals.expense.toLocaleString()}
          </p>
        </div>
        <div className={cn(
            "bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800 p-6 rounded-3xl border-l-[6px] shadow-sm transition-all hover:shadow-md",
            totals.net >= 0 ? "border-l-indigo-500" : "border-l-orange-500"
        )}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Net Balance</p>
          <p className={cn(
              "text-2xl font-bold",
              totals.net >= 0 ? "text-indigo-600 dark:text-indigo-400" : "text-orange-600 dark:text-orange-400"
          )}>
            ${totals.net.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-indigo-500" /> Transactions
        </h3>
        <div className="relative w-full sm:w-64">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select
                value={selectedCategory}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="w-full h-10 pl-9 pr-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none cursor-pointer"
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
                    "p-5 rounded-3xl border shadow-sm bg-white dark:bg-gray-900 transition-all active:scale-[0.98]",
                    isIncome ? "border-l-4 border-l-green-500 border-gray-100 dark:border-gray-800" : "border-l-4 border-l-red-500 border-gray-100 dark:border-gray-800"
                )}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white leading-tight">{row.description}</h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(row.date)}</span>
                  </div>
                  <div className={cn(
                      "text-lg font-bold",
                      isIncome ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"
                  )}>
                    {isIncome ? "+" : "-"}${row.amount.toLocaleString()}
                  </div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-50 dark:border-gray-800">
                  <Badge variant="outline" className="rounded-lg bg-gray-50/50 dark:bg-gray-800/50 font-medium">
                    {categoryName(row.category_id)}
                  </Badge>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                      onClick={() => setEditTransaction(row)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
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
          <div className="py-16 text-center flex flex-col items-center justify-center border border-dashed border-gray-200 dark:border-gray-800 rounded-[2rem] bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm mt-4">
             <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-4 ring-4 ring-gray-50/50 dark:ring-gray-800/20">
                 <Search className="w-6 h-6 text-gray-400 dark:text-gray-500 animate-[pulse_3s_ease-in-out_infinite]" />
             </div>
             <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No Transactions</h3>
             <p className="text-sm text-gray-500 dark:text-gray-400 px-4">Try adjusting your filters or add a new transaction.</p>
          </div>
        )}
      </div>

      {/* Desktop View (Table) */}
      <div className="hidden md:block overflow-hidden rounded-[2rem] border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/50">
            <tr>
              <th className="px-6 py-5 font-semibold text-center">Type</th>
              <th className="px-6 py-5 font-semibold text-center">Amount</th>
              <th className="px-6 py-5 font-semibold">Description</th>
              <th className="px-6 py-5 font-semibold">Category</th>
              <th className="px-6 py-5 font-semibold">Date</th>
              <th className="px-6 py-5 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {transactions.map((row) => {
              const isIncome = row.type === "income";
              return (
                <tr
                  key={row._id}
                  className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110",
                            isIncome ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                        )}>
                            {isIncome ? <ArrowUp className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={cn(
                        "text-base font-bold",
                        isIncome ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"
                    )}>
                      {isIncome ? "+" : "-"}${row.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                    {row.description}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className="rounded-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 font-medium">
                      {categoryName(row.category_id)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 italic">
                    {formatDate(row.date)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full"
                        onClick={() => setEditTransaction(row)}
                      >
                        <Pencil className="w-4.5 h-4.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full"
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
            <div className="py-24 text-center flex flex-col items-center justify-center min-h-[300px] border-t border-dashed border-gray-100 dark:border-gray-800/50">
                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-6 ring-8 ring-gray-50/50 dark:ring-gray-800/20 transition-all hover:scale-110 duration-300">
                    <Search className="w-8 h-8 text-gray-400 dark:text-gray-500 animate-[pulse_3s_ease-in-out_infinite]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Transactions Found</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto text-base">We couldn't find any transactions matching your current filters. Try adjusting your search criteria or add new entry.</p>
            </div>
        )}
      </div>
    </div>
  );
}

