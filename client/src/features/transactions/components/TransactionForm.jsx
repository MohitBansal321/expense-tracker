import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useSelector } from "react-redux";
import Confetti from "react-confetti";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar as CalendarIcon,
  ChevronDown,
  Plus,
  Save,
  Tag,
  Wallet,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Calendar } from "../../../components/ui/calendar";
import {
  createTransaction,
  updateTransaction,
} from "../../../services/transaction.service";

const INITIAL_FORM = {
  amount: "",
  description: "",
  date: new Date(),
  category_id: "",
  type: "expense",
};

export default function TransactionForm({
  fetchTransactions,
  editTransaction = {},
  inline = false,
}) {
  const categories = useSelector((state) => state.auth.user?.categories || []);
  const token = Cookies.get("token");

  const [form, setForm] = useState(INITIAL_FORM);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    if (!showConfetti) {
      return undefined;
    }

    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, [showConfetti]);

  useEffect(() => {
    if (editTransaction && editTransaction._id) {
      setForm({
        ...editTransaction,
        amount: editTransaction.amount?.toString() || "",
        type: editTransaction.type || "expense",
        date: editTransaction.date ? new Date(editTransaction.date) : new Date(),
      });
      return;
    }

    setForm(INITIAL_FORM);
  }, [editTransaction]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleTypeChange(type) {
    setForm((current) => ({ ...current, type }));
  }

  function handleDateSelect(date) {
    if (!date) {
      return;
    }

    setForm((current) => ({ ...current, date }));
    setIsCalendarOpen(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const isEditing = Boolean(editTransaction && editTransaction._id);
    if (isEditing) {
      await updateTransactionHandler();
      return;
    }

    await createTransactionHandler();
  }

  function handleSuccess(response) {
    if (!response.ok) {
      return;
    }

    setForm(INITIAL_FORM);
    fetchTransactions();
  }

  function validateForm(currentForm) {
    if (!currentForm.description || !currentForm.category_id) {
      toast.warning("Please fill all the fields");
      return false;
    }

    const amount = Number.parseFloat(currentForm.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      toast.warning("Please enter a valid amount");
      return false;
    }

    if (!currentForm.date || Number.isNaN(new Date(currentForm.date).getTime())) {
      toast.warning("Please enter a valid date");
      return false;
    }

    return true;
  }

  async function createTransactionHandler() {
    if (!validateForm(form)) {
      return;
    }

    const body = { ...form, amount: Number.parseFloat(form.amount) };
    try {
      const response = await createTransaction(body);
      handleSuccess({ ok: true }); // handleSuccess expects a response-like object
      setShowConfetti(true);
      toast.success("Transaction added!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create transaction");
    }
  }

  async function updateTransactionHandler() {
    if (!validateForm(form)) {
      return;
    }

    const body = { ...form, amount: Number.parseFloat(form.amount) };
    try {
      await updateTransaction(editTransaction._id, body);
      handleSuccess({ ok: true });
      toast.success("Transaction updated!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update transaction");
    }
  }

  const isEditing = Boolean(editTransaction && editTransaction._id);
  const isIncome = form.type === "income";
  const HeaderIcon = isIncome ? ArrowUpRight : ArrowDownRight;
  const parsedAmount = Number.parseFloat(form.amount || "0");
  const formattedAmount = Number.isFinite(parsedAmount)
    ? parsedAmount.toLocaleString(undefined, {
        minimumFractionDigits: parsedAmount % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
      })
    : "0";
  const selectedCategory = categories.find((category) => category._id === form.category_id);
  const title = isEditing ? "Edit transaction" : "Add transaction";
  const description = inline
    ? "Update your history without leaving the transactions screen."
    : "Track spending and income with a cleaner, faster entry flow.";

  const formContent = (
    <div className="space-y-6 sm:space-y-8">
      {showConfetti && <Confetti numberOfPieces={200} recycle={false} />}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200/80 bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 shadow-sm dark:border-gray-800 dark:bg-gray-900/80 dark:text-gray-400">
                <HeaderIcon className={cn("h-3.5 w-3.5", isIncome ? "text-emerald-500" : "text-rose-500")} />
                {isIncome ? "Income flow" : "Expense flow"}
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-gray-950 dark:text-white sm:text-3xl">
                  {title}
                </h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">
                  {description}
                </p>
              </div>
            </div>

            <div className="flex w-full rounded-2xl bg-gray-100/90 p-1 sm:w-auto dark:bg-gray-900/90">
              <button
                type="button"
                onClick={() => handleTypeChange("expense")}
                className={cn(
                  "flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all sm:min-w-[118px]",
                  !isIncome
                    ? "bg-white text-rose-600 shadow-sm dark:bg-gray-800"
                    : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                )}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange("income")}
                className={cn(
                  "flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all sm:min-w-[118px]",
                  isIncome
                    ? "bg-white text-emerald-600 shadow-sm dark:bg-gray-800"
                    : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                )}
              >
                Income
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="ml-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                Amount
              </label>
              <div className="relative">
                <span
                  className={cn(
                    "absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold",
                    isIncome ? "text-emerald-500" : "text-rose-500"
                  )}
                >
                  $
                </span>
                <Input
                  type="number"
                  name="amount"
                  step="0.01"
                  value={form.amount}
                  onChange={handleChange}
                  className={cn(
                    "h-14 rounded-2xl border bg-white/90 pl-9 pr-16 text-base font-semibold shadow-sm dark:bg-gray-900/70",
                    isIncome
                      ? "border-emerald-200/80 focus:border-emerald-500 focus:ring-emerald-500/20 dark:border-emerald-900/60"
                      : "border-rose-200/80 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-900/60"
                  )}
                  placeholder="0.00"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  USD
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="ml-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                Date
              </label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-14 w-full justify-start rounded-2xl border border-gray-200/80 bg-white/90 px-4 text-left text-sm font-medium shadow-sm hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900/70 dark:hover:bg-gray-900"
                  >
                    <CalendarIcon className="mr-3 h-4 w-4 text-gray-400" />
                    {form.date ? dayjs(form.date).format("MMM DD, YYYY") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto rounded-2xl border-gray-200 p-0 shadow-2xl dark:border-gray-800" align="start">
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

            <div className="space-y-2 sm:col-span-2">
              <label className="ml-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                Description
              </label>
              <Input
                name="description"
                value={form.description}
                onChange={handleChange}
                className="h-14 rounded-2xl border border-gray-200/80 bg-white/90 px-4 text-base shadow-sm transition-all focus:border-primary focus:ring-primary/20 dark:border-gray-800 dark:bg-gray-900/70"
                placeholder="What was this for?"
                required
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="ml-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                Category
              </label>
              <Select
                value={form.category_id}
                onValueChange={(value) =>
                  setForm((current) => ({ ...current, category_id: value }))
                }
                required
              >
                <SelectTrigger className="h-14 rounded-2xl border border-gray-200/80 bg-white/90 text-sm font-medium shadow-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-800 dark:bg-gray-900/70">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id} className="text-sm">
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-200/70 pt-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800/80">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isEditing
                  ? "Save changes to update this transaction immediately."
                  : "Your transaction will appear in the list as soon as you save it."}
              </p>
              <Button
                type="submit"
                className={cn(
                  "h-12 w-full rounded-2xl px-6 font-bold shadow-lg transition-all active:scale-[0.98] sm:w-auto",
                  isEditing
                    ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20"
                    : isIncome
                      ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                      : "bg-primary hover:bg-primary/90 shadow-primary/20"
                )}
              >
                {isEditing ? (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update transaction
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Save transaction
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        <div className="rounded-[1.5rem] border border-gray-200/80 bg-gradient-to-br from-gray-50 via-white to-gray-100/70 p-5 shadow-sm dark:border-gray-800 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900/80">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
              Live preview
            </p>
            <div
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em]",
                isIncome
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300"
                  : "bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300"
              )}
            >
              <HeaderIcon className="h-3.5 w-3.5" />
              {form.type}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-[1.4rem] bg-gray-950 px-5 py-6 text-white shadow-xl dark:bg-black">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                Amount
              </p>
              <p className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                {isIncome ? "+" : "-"}${formattedAmount}
              </p>
              <p className="mt-2 text-sm text-white/60">
                {form.description?.trim() || "Add a description to make this easier to find later."}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-2xl border border-gray-200/80 bg-white/90 p-4 dark:border-gray-800 dark:bg-gray-900/80">
                <CalendarIcon className="mt-0.5 h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                    Date
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                    {form.date ? dayjs(form.date).format("dddd, MMM DD YYYY") : "Pick a date"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-gray-200/80 bg-white/90 p-4 dark:border-gray-800 dark:bg-gray-900/80">
                <Tag className="mt-0.5 h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                    Category
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                    {selectedCategory?.label || "Choose a category"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-gray-200/80 bg-white/90 p-4 dark:border-gray-800 dark:bg-gray-900/80">
                <Wallet className="mt-0.5 h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                    Entry mode
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                    {inline ? "Quick modal entry" : "Full editor"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const wrapperClassName = cn(
    "relative overflow-hidden border backdrop-blur-xl transition-all duration-500",
    "bg-white/95 dark:bg-gray-950/95 border-gray-200/70 dark:border-gray-800/80",
    inline ? "rounded-[1.75rem]" : "mt-8 rounded-[2.5rem] shadow-2xl",
    isIncome ? "shadow-emerald-500/10" : "shadow-rose-500/10"
  );

  return (
    <div className={wrapperClassName}>
      <div
        className={cn(
          "absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl opacity-15",
          isIncome ? "bg-emerald-500" : "bg-rose-500"
        )}
      />

      <div className={cn("relative z-10", inline ? "p-4 sm:p-6 lg:p-7" : "p-8")}>
        {formContent}
      </div>
    </div>
  );
}
