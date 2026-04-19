---
name: expense-database
description: Use this skill when working with MongoDB/Mongoose in the Expense Tracker backend. Covers the 4 existing models (User, Transaction, Budget, RecurringTransaction), schema design patterns, query patterns, aggregation pipelines, indexing, Redis caching, and the shared model location. Trigger when user mentions database, schema, model, query, aggregation, populate, indexes, MongoDB, Mongoose, Redis, or caching.

# Expense Tracker — Database Patterns

## Connection

`src/config/database.js` — connects via env vars `MONGO_DB_USERNAME`, `MONGO_DB_PASSWORD`, `MONGO_DB_URL`:

```
mongodb+srv://${username}:${password}@${url}/?retryWrites=true&w=majority
```

## Existing Models

All models live in `src/models/` (flat, no module subdirectories).

### User (`User.js`)
```javascript
{
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    categories: [{ label: String, icon: String }]  // User-specific categories
}  // { timestamps: true }
```

### Transaction (`Transaction.js`)
```javascript
{
    amount: Number,
    description: String,
    type: { type: String, enum: ["expense", "income", "transfer"], default: "expense" },
    user_id: mongoose.Types.ObjectId,
    category_id: mongoose.Types.ObjectId,
    date: { type: Date, default: new Date() },
    createdAt: { type: Date, default: Date.now }
}
```

### Budget (`Budget.js`)
```javascript
{
    user_id: { type: ObjectId, required: true, index: true },
    category_id: { type: ObjectId, required: true },
    amount: { type: Number, required: true, min: 0 },
    period: { type: String, enum: ["monthly", "weekly", "yearly"], default: "monthly" },
    alertThreshold: { type: Number, default: 80, min: 0, max: 100 },
    isActive: { type: Boolean, default: true },
    startDate: { type: Date, default: Date.now }
}  // { timestamps: true }
// Compound index: { user_id: 1, category_id: 1 } (unique)
```

### RecurringTransaction (`RecurringTransaction.js`)
```javascript
{
    user_id: { type: ObjectId, required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, required: true },
    type: { type: String, enum: ["income", "expense"], default: "expense" },
    category_id: { type: ObjectId, required: true },
    frequency: { type: String, enum: ["daily", "weekly", "biweekly", "monthly", "yearly"], required: true },
    dayOfWeek: { type: Number, min: 0, max: 6 },     // 0=Sunday
    dayOfMonth: { type: Number, min: 1, max: 31 },
    startDate: { type: Date, required: true },
    endDate: Date,                                     // Optional, null = indefinite
    lastExecuted: Date,
    nextExecution: { type: Date, required: true },
    isActive: { type: Boolean, default: true }
}  // { timestamps: true }
// Index: { nextExecution: 1, isActive: 1 }
// Instance method: calculateNextExecution()
```

## Schema Conventions

| Convention | Example |
|-----------|---------|
| Timestamps | Always `{ timestamps: true }` |
| References | `mongoose.Types.ObjectId` (NOT `Schema.Types.ObjectId` with ref) |
| Defaults | `default: Date.now` for dates, enums with defaults |
| Indexes | Compound indexes for frequent query patterns |
| Enums | String enums for fixed-set fields |
| Soft delete | `isActive: Boolean` pattern (used in Budget and RecurringTransaction) |

## Query Patterns

### Aggregation (Transactions grouped by month)
```javascript
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

### Date Range Filtering
```javascript
const dateFilter = {};
if (startDate) dateFilter.$gte = new Date(startDate);
if (endDate) dateFilter.$lte = new Date(endDate);
Transaction.find({ user_id: userId, ...(Object.keys(dateFilter).length && { date: dateFilter }) });
```

### Concurrent Independent Queries
```javascript
const [transactions, budgets, total] = await Promise.all([
    Transaction.find({ user_id: userId }),
    Budget.find({ user_id: userId, isActive: true }),
    Transaction.countDocuments({ user_id: userId })
]);
```

## Redis Caching

`src/config/redis.js` — Redis Cloud instance. Used in `stats.service.js`:

```javascript
import client from "../config/redis.js";

// Cache with TTL
await client.set("stats:global", JSON.stringify(data), { EX: 3600 });

// Read cache
const cached = await client.get("stats:global");
if (cached) return JSON.parse(cached);
```

> **Warning**: Redis config currently has hardcoded host/port. Connection failure crashes server. See `BACKEND_CHECKLIST.md` for recommended fix.

## Related Skills

- **expense-api-scaffold** — how to create services that query these models
- **expense-financial-logic** — domain-specific query patterns (budgets, reports, analytics)
