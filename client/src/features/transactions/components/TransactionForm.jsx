import React, { useEffect, useState, useMemo } from "react";
import Cookies from "js-cookie";
import { useSelector } from "react-redux";
import Confetti from "react-confetti";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { Calendar as CalendarIcon, ChevronDown, Plus, Save } from "lucide-react";
import { cn } from "../../../lib/utils";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import { Calendar } from "../../../components/ui/calendar";

// Initial form state for creating or editing transactions
const InitialForm = {
  amount: "",
  description: "",
  date: new Date(),
  category_id: "",
  type: "expense", // Default to expense
};

export default function TransactionForm({ fetchTransactions, editTransaction = {}, inline = false }) {
  // Get user categories from Redux store with safe default
  const categories = useSelector((state) => state.auth.user?.categories || []);
  const token = Cookies.get("token");

  const [form, setForm] = useState(InitialForm);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  useEffect(() => {
    if (editTransaction && editTransaction._id) {
      setForm({
        ...editTransaction,
        amount: editTransaction.amount?.toString() || "",
        type: editTransaction.type || "expense",
        date: editTransaction.date ? new Date(editTransaction.date) : new Date()
      });
    } else {
      setForm(InitialForm);
    }
  }, [editTransaction]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  function handleTypeChange(type) {
    setForm({ ...form, type });
  }

  function handleDateSelect(date) {
    if (date) {
      setForm({ ...form, date });
      setIsCalendarOpen(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const isEditing = editTransaction && editTransaction._id;
    isEditing ? update() : create();
  }

  function reload(res) {
    if (res.ok) {
      setForm(InitialForm);
      fetchTransactions();
    }
  }

  function formValidation(form) {
    if (!form.description || !form.category_id) {
        toast.warning("Please fill all the fields");
        return false;
    }
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) {
        toast.warning("Please enter a valid amount");
        return false;
    }
    if (!form.date || isNaN(new Date(form.date).getTime())) {
        toast.warning("Please enter a valid date");
        return false;
    }
    return true;
  }

  async function create() {
    if (!formValidation(form)) return;
    const body = { ...form, amount: parseFloat(form.amount) };
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/transaction`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    reload(res);
    if (res.ok) {
        setShowConfetti(true);
        toast.success("Transaction added!");
    }
  }

  async function update() {
    if (!formValidation(form)) return;
    const body = { ...form, amount: parseFloat(form.amount) };
    const res = await fetch(
      `${import.meta.env.VITE_BASE_URL}/transaction/${editTransaction._id}`,
      {
        method: "PATCH",
        body: JSON.stringify(body),
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    reload(res);
    if (res.ok) toast.success("Transaction updated!");
  }

  const isEditing = editTransaction && editTransaction._id;

  const formBody = (
    <div className="space-y-6">
      {showConfetti && <Confetti numberOfPieces={200} recycle={false} />}
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {!inline && (
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {isEditing ? "Edit Transaction" : "New Transaction"}
          </h2>
        )}
        
        {/* Type Toggle */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-full sm:w-auto">
          <button
            type="button"
            onClick={() => handleTypeChange("expense")}
            className={cn(
              "flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all",
              form.type === "expense" 
                ? "bg-white dark:bg-gray-700 text-red-600 shadow-sm" 
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            )}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("income")}
            className={cn(
              "flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all",
              form.type === "income" 
                ? "bg-white dark:bg-gray-700 text-green-600 shadow-sm" 
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            )}
          >
            Income
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        {/* Amount */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Amount</label>
          <div className="relative group">
            <span className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 font-bold transition-colors",
                form.type === "income" ? "text-green-500" : "text-red-500"
            )}>$</span>
            <Input
              type="number"
              name="amount"
              step="0.01"
              value={form.amount}
              onChange={handleChange}
              className={cn(
                  "pl-8 h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-offset-0 rounded-xl transition-all",
                  form.type === "income" ? "focus:ring-green-500/20 focus:border-green-500" : "focus:ring-red-500/20 focus:border-red-500"
              )}
              placeholder="0.00"
              required
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Description</label>
          <Input
            name="description"
            value={form.description}
            onChange={handleChange}
            className="h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 rounded-xl transition-all"
            placeholder="What was this for?"
            required
          />
        </div>

        {/* Date */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Date</label>
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full h-12 justify-start text-left font-normal bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800",
                  !form.date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
                {form.date ? dayjs(form.date).format("MMM DD, YYYY") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-2xl border-gray-200 dark:border-gray-800 shadow-2xl" align="start">
              <Calendar
                mode="single"
                selected={form.date}
                onSelect={handleDateSelect}
                initialFocus
                className="p-3"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Category</label>
          <div className="relative">
            <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full h-12 pl-4 pr-10 appearance-none bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                required
            >
                <option value="" disabled>Select Category</option>
                {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                        {cat.label}
                    </option>
                ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Submit */}
        <div className="md:col-span-2 lg:col-span-4 flex justify-end mt-4">
            <Button 
                type="submit" 
                className={cn(
                    "h-12 px-8 rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2",
                    isEditing 
                        ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20" 
                        : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20"
                )}
            >
                {isEditing ? (
                    <>
                        <Save className="w-5 h-5" /> Update Transaction
                    </>
                ) : (
                    <>
                        <Plus className="w-5 h-5" /> Add Transaction
                    </>
                )}
            </Button>
        </div>
      </form>
    </div>
  );

  if (inline) return formBody;

  return (
    <div className={cn(
        "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 rounded-[2.5rem] p-8 mt-8 shadow-2xl relative overflow-hidden transition-all duration-500",
        form.type === "income" ? "border-l-[6px] border-l-green-500" : "border-l-[6px] border-l-red-500"
    )}>
      {/* Decorative background element */}
      <div className={cn(
          "absolute -right-20 -top-20 w-64 h-64 blur-3xl opacity-10 rounded-full",
          form.type === "income" ? "bg-green-500" : "bg-red-500"
      )} />
      
      <div className="relative z-10">
        {formBody}
      </div>
    </div>
  );
}

