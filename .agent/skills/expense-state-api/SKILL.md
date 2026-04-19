---
name: expense-state-api
description: Use this skill when working with state management, API calls, custom hooks, or the frontend data layer of the Expense Tracker. Covers the API client (fetch wrapper), service functions, custom hooks pattern (useTransactions, useBudgets, useAuth, etc.), Redux Toolkit store, API endpoint constants, and data flow conventions. Trigger when user mentions API calls, hooks, state, Redux, services, fetch, data fetching, loading states, error handling frontend, or the client-server data contract.

# Expense Tracker — State Management & API Layer

## Data Flow Architecture

```
Component → Custom Hook → Service Function → ApiClient → Backend API
                ↕
          useState (loading, error, data)
```

## API Client (`api/client.js`)

A singleton `ApiClient` class wrapping native `fetch`:

```javascript
import Cookies from "js-cookie";

const BASE_URL = import.meta.env.VITE_BASE_URL;

class ApiClient {
    async get(endpoint, options = {}) { ... }
    async post(endpoint, data, options = {}) { ... }
    async put(endpoint, data, options = {}) { ... }
    async patch(endpoint, data, options = {}) { ... }
    async delete(endpoint, options = {}) { ... }

    async request(endpoint, options = {}) {
        // Adds Authorization: Bearer <token> from cookies
        // Handles JSON and blob responses
        // Throws on non-ok responses
    }
}

export default new ApiClient();
```

**Key behaviors:**
- Token read from `Cookies.get("token")` on every request
- Supports JSON and blob (file download) responses
- Base URL from `import.meta.env.VITE_BASE_URL`

## API Endpoints (`constants/api-endpoints.js`)

All endpoints centralized with dynamic ID helpers:

```javascript
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: "/auth/login",
        REGISTER: "/auth/register",
    },
    TRANSACTION: {
        BASE: "/transaction",
        BY_ID: (id) => `/transaction/${id}`,
        SEARCH: "/transaction/search",
        EXPORT: "/transaction/export",
    },
    BUDGET: {
        BASE: "/budget",
        BY_ID: (id) => `/budget/${id}`,
        STATUS_ALL: "/budget/status/all",
        ALERTS: "/budget/alerts",
    },
    RECURRING: {
        BASE: "/recurring",
        BY_ID: (id) => `/recurring/${id}`,
        TOGGLE: (id) => `/recurring/${id}/toggle`,
    },
    CATEGORY: { ... },
    STATS: { ... },
    USER: { ... },
};
```

## Service Functions (`services/*.service.js`)

One file per domain, wrapping `ApiClient` calls:

```javascript
import api from "../api/client.js";
import { API_ENDPOINTS } from "../constants/api-endpoints.js";

export const fetchTransactions = (categoryFilter) =>
    api.get(categoryFilter ? API_ENDPOINTS.TRANSACTION.BY_ID(categoryFilter) : API_ENDPOINTS.TRANSACTION.BASE);

export const createTransaction = (data) =>
    api.post(API_ENDPOINTS.TRANSACTION.BASE, data);

export const updateTransaction = (id, data) =>
    api.patch(API_ENDPOINTS.TRANSACTION.BY_ID(id), data);

export const deleteTransaction = (id) =>
    api.delete(API_ENDPOINTS.TRANSACTION.BY_ID(id));
```

**Service files:** `auth.service.js`, `transaction.service.js`, `budget.service.js`, `category.service.js`, `recurring.service.js`, `stats.service.js`

## Custom Hooks (`hooks/`)

Standard pattern with `useState` for loading/error/data:

```javascript
import { useState, useCallback } from "react";
import * as transactionService from "../services/transaction.service.js";

export const useTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchTransactions = useCallback(async (categoryFilter = "") => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await transactionService.fetchTransactions(categoryFilter);
            setTransactions(response.data || []);
            setIsLoading(false);
            return response.data;
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
            return [];
        }
    }, []);

    // createTransaction, updateTransaction, deleteTransaction, exportTransactions...

    return {
        transactions, isLoading, error,
        fetchTransactions, createTransaction, updateTransaction,
        deleteTransaction, exportTransactions, setTransactions,
    };
};
```

**Available hooks:** `useAuth`, `useTransactions`, `useBudgets`, `useCategories`, `useDashboard`, `useSearch`

## Adding a New Feature's Data Layer

1. Add endpoints to `constants/api-endpoints.js`
2. Create service file: `services/feature.service.js`
3. Create hook: `hooks/useFeature.js`
4. Use hook in component: `const { data, isLoading, error, fetch } = useFeature();`

## Conventions

| Rule | Pattern |
|------|---------|
| Base URL | `import.meta.env.VITE_BASE_URL` (never hardcode) |
| Token storage | `js-cookie` — `Cookies.get("token")` / `Cookies.set("token")` |
| Error handling | Service throws, hook catches and sets `error` state |
| Loading states | Always track with `isLoading` boolean |
| Export pattern | Named exports for service functions |
| Hook returns | Object with `{ data, isLoading, error, ...methods }` |

## Related Skills

- **expense-frontend-ui** — how to use hooks in components
- **expense-api-scaffold** — backend endpoints that these services call
