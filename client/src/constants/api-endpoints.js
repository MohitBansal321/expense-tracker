/**
 * API Endpoints Constants
 * Centralized location for all API endpoint paths
 */

export const API_ENDPOINTS = {
    // Auth endpoints
    AUTH: {
        LOGIN: "/auth/login",
        REGISTER: "/auth/register",
        LOGOUT: "/auth/logout",
        FORGOT_PASSWORD: "/auth/forgot-password",
        RESET_PASSWORD: "/auth/reset-password",
    },

    // User endpoints
    USER: {
        PROFILE: "/user",
        UPDATE_PROFILE: "/user/profile",
        CHANGE_PASSWORD: "/user/password",
    },

    // Transaction endpoints
    TRANSACTION: {
        BASE: "/transaction",
        BY_ID: (id) => `/transaction/${id}`,
        BY_CATEGORY: (categoryId) => `/transaction/${categoryId}`,
        SEARCH: "/transaction/search",
        EXPORT: "/transaction/export",
        BULK_DELETE: "/transaction/bulk-delete",
        DATE_RANGE: "/transaction/range",
    },

    // Category endpoints
    CATEGORY: {
        BASE: "/category",
        BY_ID: (id) => `/category/${id}`,
        BY_TYPE: (type) => `/category/type/${type}`,
        STATS: (id) => `/category/${id}/stats`,
    },

    // Budget endpoints
    BUDGET: {
        BASE: "/budget",
        BY_ID: (id) => `/budget/${id}`,
        STATUS: (id) => `/budget/${id}/status`,
        STATUS_ALL: "/budget/status/all",
        ALERTS: "/budget/alerts",
    },

    // Recurring transaction endpoints
    RECURRING: {
        BASE: "/recurring",
        BY_ID: (id) => `/recurring/${id}`,
        TOGGLE: (id) => `/recurring/${id}/toggle`,
        PROCESS: "/recurring/process",
    },

    // Statistics endpoints
    STATS: {
        DASHBOARD: "/stats/dashboard",
        CATEGORY_BREAKDOWN: "/stats/category-breakdown",
        MONTHLY_TRENDS: "/stats/monthly-trends",
        RECENT_TRANSACTIONS: "/stats/recent-transactions",
        INCOME_VS_EXPENSE: "/stats/income-vs-expense",
        CATEGORY_TRENDS: (id) => `/stats/category-trends/${id}`,
        SUMMARY: "/stats/summary",
    },
};

export default API_ENDPOINTS;
