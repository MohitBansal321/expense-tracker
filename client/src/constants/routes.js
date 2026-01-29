/**
 * Application Route Constants
 * Centralized location for all route paths
 */

export const ROUTES = {
    // Public routes
    HOME: "/",
    LANDING: "/",
    LOGIN: "/login",
    REGISTER: "/register",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",

    // Protected routes
    DASHBOARD: "/dashboard",
    TRANSACTIONS: "/transactions",
    CATEGORIES: "/category",
    BUDGET: "/budget",
    RECURRING: "/recurring",
    REPORTS: "/reports",
    SMART_ENTRY: "/smart-entry",
    SETTINGS: "/settings",

    // Dynamic routes
    TRANSACTION_DETAILS: (id) => `/transactions/${id}`,
    CATEGORY_DETAILS: (id) => `/category/${id}`,
    BUDGET_DETAILS: (id) => `/budget/${id}`,
};

/**
 * Route groups for easier management
 */
export const ROUTE_GROUPS = {
    PUBLIC: [
        ROUTES.HOME,
        ROUTES.LANDING,
        ROUTES.LOGIN,
        ROUTES.REGISTER,
        ROUTES.FORGOT_PASSWORD,
        ROUTES.RESET_PASSWORD,
    ],
    PROTECTED: [
        ROUTES.DASHBOARD,
        ROUTES.TRANSACTIONS,
        ROUTES.CATEGORIES,
        ROUTES.BUDGET,
        ROUTES.RECURRING,
        ROUTES.REPORTS,
        ROUTES.SMART_ENTRY,
        ROUTES.SETTINGS,
    ],
};

/**
 * Check if route is public
 */
export const isPublicRoute = (path) => {
    return ROUTE_GROUPS.PUBLIC.includes(path);
};

/**
 * Check if route is protected
 */
export const isProtectedRoute = (path) => {
    return ROUTE_GROUPS.PROTECTED.includes(path);
};

export default ROUTES;
