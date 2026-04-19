---
name: expense-financial-logic
description: Use this skill when implementing or modifying financial domain logic in the Expense Tracker. Covers transaction CRUD with category management, budget period calculations and spending tracking, recurring transaction scheduling (next occurrence), CSV export, dashboard analytics aggregation (income vs expense, top categories, trends), report generation, duplicate detection via string similarity, smart entry features (receipt scanning, voice input, CSV import), and category suggestion. Trigger when user mentions transactions, budgets, spending, reports, analytics, dashboard data, recurring, duplicates, CSV, receipt scanning, voice input, categories, or financial calculations.

# Expense Tracker — Financial Domain Logic

## Core Domain Services

### Transaction Service (`services/transaction.service.js`)

**Capabilities:**
- CRUD with user scoping (`user_id` filtering)
- Transactions grouped by month (aggregation pipeline)
- Filter by category
- Search with query params (description, type, date range, min/max amount)
- CSV export
- Duplicate detection (Dice coefficient string similarity)
- Category suggestion based on past patterns
- Category spending patterns

**Key patterns:**

```javascript
// Group by month — aggregation pipeline
Transaction.aggregate([
    { $match: { user_id: new mongoose.Types.ObjectId(userId) } },
    { $sort: { date: -1 } },
    { $group: {
        _id: { year: { $year: "$date" }, month: { $month: "$date" } },
        transactions: { $push: "$$ROOT" },
        totalExpenses: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } }
    }}
]);
```

### Budget Service (`services/budget.service.js`)

**Capabilities:**
- Budget CRUD with user scoping
- Budget status calculation (spent vs limit)
- Period-based date range calculation (weekly/monthly/yearly)
- Alert threshold checking (default 80%)
- Bulk status for all budgets

**Budget period date ranges:**
```javascript
// Monthly: 1st of current month → now
// Weekly: last Monday → now  
// Yearly: Jan 1st → now
```

**Spending calculation:**
```javascript
// Sum transactions matching budget's category within the period's date range
const spending = await Transaction.aggregate([
    { $match: { user_id, category_id, date: { $gte: periodStart, $lte: periodEnd }, type: "expense" } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
]);
```

### Recurring Transaction Service (`services/recurring-transaction.service.js`)

**Capabilities:**
- CRUD for recurring rules
- Toggle active/paused
- Process due transactions (create actual transactions from recurring rules)
- Next execution calculation

**Scheduling logic** (model method `calculateNextExecution()`):
```
daily     → +1 day
weekly    → +7 days
biweekly  → +14 days
monthly   → +1 month (clamp to valid day if needed)
yearly    → +1 year
```

If `lastExecuted + interval` is in the past, advance until next occurrence is in the future.

### Dashboard Service (`services/dashboard.service.js`)

**Aggregates:**
- Total income vs total expenses
- Net balance
- Top spending categories
- Monthly trend data
- Recent transactions

### Reports Service (`services/reports.service.js`)

**Generates:**
- Category breakdowns with totals and percentages
- Date range reports (custom start/end)
- Income vs expense comparison
- Spending trends over time

## Utility Functions

### CSV Export (`utils/csv.util.js`)
```javascript
import { generateCSVFilename, setCSVHeaders } from "../utils/csv.util.js";

// In controller:
const csvContent = await transactionService.exportTransactionsCSV(userId, query);
const filename = generateCSVFilename("transactions");
setCSVHeaders(res, filename);
res.send(csvContent);
```

### String Similarity (`utils/similarity.util.js`)
Uses Dice coefficient for duplicate detection:
```javascript
// Compare descriptions to find similar transactions
// Threshold-based matching for potential duplicate flagging
```

### Date Utilities (`utils/date.util.js`)
Budget period calculations, recurring transaction date math.

## Smart Entry Features (Frontend)

### Receipt Scanner (`features/smart-entry/components/ReceiptScanner.jsx`)
Uses `tesseract.js` for OCR on receipt images to extract transaction data.

### Voice Input (`features/smart-entry/components/VoiceInput.jsx`)
Speech-to-text for hands-free transaction entry.

### CSV Import (`features/smart-entry/components/CSVImport.jsx`)
Bulk import transactions from CSV files.

## Default Categories

New users start with:
```javascript
[
    { label: "Travel", icon: "✈️" },
    { label: "Shopping", icon: "🛍️" },
    { label: "Investment", icon: "📈" },
    { label: "Bills", icon: "🧾" },
    { label: "Food", icon: "🍔" },
]
```

Users can add custom categories (stored as subdocument array on User model).

## Related Skills

- **expense-database** — Mongoose schemas and query patterns underlying these services
- **expense-api-scaffold** — controller wiring for these services
- **expense-state-api** — frontend hooks that consume these APIs
