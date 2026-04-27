import React, { useState } from "react";
import Cookies from "js-cookie";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Plus, Save, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { cn } from "../../../lib/utils";
import { createBulkTransactions } from "../../../services/transaction.service";

const INITIAL_ROW = {
  amount: "",
  description: "",
  date: new Date().toISOString().split("T")[0],
  category_id: "",
  type: "expense",
};

export default function BulkTransactionForm({ fetchTransactions, onClose }) {
  const categories = useSelector((state) => state.auth.user?.categories || []);
  const token = Cookies.get("token");

  const [rows, setRows] = useState([{ ...INITIAL_ROW, id: Date.now() }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleAddRow() {
    setRows([...rows, { ...INITIAL_ROW, id: Date.now() }]);
  }

  function handleRemoveRow(id) {
    if (rows.length === 1) {
      toast.warning("You must have at least one transaction row.");
      return;
    }
    setRows(rows.filter((row) => row.id !== id));
  }

  function handleChange(id, field, value) {
    setRows(
      rows.map((row) => {
        if (row.id === id) {
          return { ...row, [field]: value };
        }
        return row;
      })
    );
  }

  function validateRows() {
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.description || !row.category_id || !row.date) {
        toast.warning(`Row ${i + 1}: Please fill all required fields.`);
        return false;
      }
      const amount = Number.parseFloat(row.amount);
      if (Number.isNaN(amount) || amount <= 0) {
        toast.warning(`Row ${i + 1}: Please enter a valid amount.`);
        return false;
      }
    }
    return true;
  }

  async function handleSubmit() {
    if (!validateRows()) return;

    setIsSubmitting(true);
    try {
      const payload = rows.map(({ amount, description, date, category_id, type }) => ({
        amount: Number.parseFloat(amount),
        description,
        date: new Date(date).toISOString(),
        category_id,
        type,
      }));

      const result = await createBulkTransactions(payload);

      if (result.success) {
        toast.success(`Successfully added ${rows.length} transactions!`);
        fetchTransactions();
        if (onClose) onClose();
      }
    } catch (error) {
      console.error("Bulk add failed:", error);
      toast.error(error.message || "An error occurred while saving transactions.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative overflow-hidden border backdrop-blur-xl transition-all duration-500 bg-white/95 dark:bg-gray-950/95 border-gray-200/70 dark:border-gray-800/80 rounded-[1.75rem] p-4 sm:p-6 lg:p-7 shadow-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-black tracking-tight text-gray-950 dark:text-white sm:text-3xl">
          Bulk Add Transactions
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Quickly add multiple transactions at once.
        </p>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="min-w-[800px] space-y-4">
          <div className="grid grid-cols-[100px_1fr_200px_150px_120px_50px] gap-3 px-2 text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">
            <div>Type</div>
            <div>Description</div>
            <div>Category</div>
            <div>Date</div>
            <div>Amount</div>
            <div></div>
          </div>

          {rows.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-[100px_1fr_200px_150px_120px_50px] gap-3 items-center bg-gray-50/50 dark:bg-gray-900/50 p-2 rounded-xl border border-gray-100 dark:border-gray-800"
            >
              <Select
                value={row.type}
                onValueChange={(val) => handleChange(row.id, "type", val)}
              >
                <SelectTrigger className="h-10 bg-white dark:bg-gray-950">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Description"
                value={row.description}
                onChange={(e) => handleChange(row.id, "description", e.target.value)}
                className="h-10 bg-white dark:bg-gray-950"
              />

              <Select
                value={row.category_id}
                onValueChange={(val) => handleChange(row.id, "category_id", val)}
              >
                <SelectTrigger className="h-10 bg-white dark:bg-gray-950">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="date"
                value={row.date}
                onChange={(e) => handleChange(row.id, "date", e.target.value)}
                className="h-10 bg-white dark:bg-gray-950"
              />

              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={row.amount}
                onChange={(e) => handleChange(row.id, "amount", e.target.value)}
                className={cn(
                  "h-10 bg-white dark:bg-gray-950 font-semibold",
                  row.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                )}
              />

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveRow(row.id)}
                className="h-10 w-10 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row justify-between gap-4 pt-4 border-t dark:border-gray-800">
        <Button
          type="button"
          variant="outline"
          onClick={handleAddRow}
          className="gap-2 border-dashed border-2 hover:bg-gray-50 dark:hover:bg-gray-900"
        >
          <Plus className="h-4 w-4" />
          Add Row
        </Button>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              if (onClose) onClose();
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? "Saving..." : "Save All"}
          </Button>
        </div>
      </div>
    </div>
  );
}
