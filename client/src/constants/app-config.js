/**
 * Application Configuration Constants
 * Centralized location for all app-wide configuration
 */

/**
 * Pagination configuration
 */
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
    MAX_PAGE_SIZE: 100,
};

/**
 * Date format configuration
 */
export const DATE_FORMATS = {
    DISPLAY: "MMM DD, YYYY",
    INPUT: "YYYY-MM-DD",
    DATETIME: "MMM DD, YYYY HH:mm",
    TIME: "HH:mm",
    MONTH_YEAR: "MMM YYYY",
};

/**
 * Transaction types
 */
export const TRANSACTION_TYPES = {
    INCOME: "income",
    EXPENSE: "expense",
};

/**
 * Category types
 */
export const CATEGORY_TYPES = {
    INCOME: "income",
    EXPENSE: "expense",
};

/**
 * Budget periods
 */
export const BUDGET_PERIODS = {
    DAILY: "daily",
    WEEKLY: "weekly",
    MONTHLY: "monthly",
    YEARLY: "yearly",
};

/**
 * Recurring frequency options
 */
export const RECURRING_FREQUENCIES = {
    DAILY: "daily",
    WEEKLY: "weekly",
    MONTHLY: "monthly",
    YEARLY: "yearly",
};

/**
 * Chart colors
 */
export const CHART_COLORS = [
    "#3b82f6", // blue
    "#10b981", // green
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#f97316", // orange
];

/**
 * Status colors
 */
export const STATUS_COLORS = {
    SUCCESS: "#10b981",
    WARNING: "#f59e0b",
    ERROR: "#ef4444",
    INFO: "#3b82f6",
};

/**
 * File upload configuration
 */
export const FILE_UPLOAD = {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: {
        IMAGES: ["image/jpeg", "image/png", "image/jpg"],
        DOCUMENTS: ["application/pdf", "text/csv"],
    },
};

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
    TOKEN: "token",
    USER: "user",
    THEME: "theme",
    LANGUAGE: "language",
    TOUR_COMPLETED: "tour_completed",
};

/**
 * Debounce delays (in milliseconds)
 */
export const DEBOUNCE_DELAYS = {
    SEARCH: 500,
    INPUT: 300,
    RESIZE: 200,
};

/**
 * Toast notification duration (in milliseconds)
 */
export const TOAST_DURATION = {
    SHORT: 2000,
    MEDIUM: 3000,
    LONG: 5000,
};

/**
 * API request timeout (in milliseconds)
 */
export const API_TIMEOUT = 30000; // 30 seconds

/**
 * Currency configuration
 */
export const CURRENCY = {
    CODE: "USD",
    SYMBOL: "$",
    LOCALE: "en-US",
};

/**
 * Application metadata
 */
export const APP_META = {
    NAME: "Expense Tracker",
    VERSION: "1.0.0",
    DESCRIPTION: "Track and manage your expenses efficiently",
};

/**
 * Feature flags
 */
export const FEATURE_FLAGS = {
    ENABLE_VOICE_INPUT: true,
    ENABLE_RECEIPT_SCANNER: true,
    ENABLE_CSV_IMPORT: true,
    ENABLE_NOTIFICATIONS: true,
    ENABLE_DARK_MODE: true,
};

export default {
    PAGINATION,
    DATE_FORMATS,
    TRANSACTION_TYPES,
    CATEGORY_TYPES,
    BUDGET_PERIODS,
    RECURRING_FREQUENCIES,
    CHART_COLORS,
    STATUS_COLORS,
    FILE_UPLOAD,
    STORAGE_KEYS,
    DEBOUNCE_DELAYS,
    TOAST_DURATION,
    API_TIMEOUT,
    CURRENCY,
    APP_META,
    FEATURE_FLAGS,
};
