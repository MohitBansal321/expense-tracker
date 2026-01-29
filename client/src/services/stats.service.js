import apiClient from "../api/client.js";

/**
 * Statistics Service
 * Handles all statistics and dashboard-related API calls
 */

/**
 * Get dashboard statistics
 * @returns {Promise<Object>} Dashboard statistics
 */
export const getDashboardStats = async () => {
    return apiClient.get("/stats/dashboard");
};

/**
 * Get category breakdown
 * @param {Object} params - Filter parameters
 * @param {string} params.startDate - Start date
 * @param {string} params.endDate - End date
 * @returns {Promise<Object>} Category breakdown data
 */
export const getCategoryBreakdown = async (params = {}) => {
    const searchParams = new URLSearchParams();

    if (params.startDate) searchParams.append("startDate", params.startDate);
    if (params.endDate) searchParams.append("endDate", params.endDate);

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/stats/category-breakdown?${queryString}` : "/stats/category-breakdown";

    return apiClient.get(endpoint);
};

/**
 * Get monthly trends
 * @param {number} months - Number of months to retrieve
 * @returns {Promise<Object>} Monthly trend data
 */
export const getMonthlyTrends = async (months = 6) => {
    return apiClient.get(`/stats/monthly-trends?months=${months}`);
};

/**
 * Get recent transactions
 * @param {number} limit - Number of recent transactions
 * @returns {Promise<Object>} Recent transactions
 */
export const getRecentTransactions = async (limit = 5) => {
    return apiClient.get(`/stats/recent-transactions?limit=${limit}`);
};

/**
 * Get income vs expense comparison
 * @param {Object} params - Filter parameters
 * @param {string} params.startDate - Start date
 * @param {string} params.endDate - End date
 * @returns {Promise<Object>} Income vs expense data
 */
export const getIncomeVsExpense = async (params = {}) => {
    const searchParams = new URLSearchParams();

    if (params.startDate) searchParams.append("startDate", params.startDate);
    if (params.endDate) searchParams.append("endDate", params.endDate);

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/stats/income-vs-expense?${queryString}` : "/stats/income-vs-expense";

    return apiClient.get(endpoint);
};

/**
 * Get spending trends by category
 * @param {string} categoryId - Category ID
 * @param {number} months - Number of months
 * @returns {Promise<Object>} Category spending trends
 */
export const getCategoryTrends = async (categoryId, months = 6) => {
    return apiClient.get(`/stats/category-trends/${categoryId}?months=${months}`);
};

/**
 * Get financial summary
 * @param {string} period - Period (weekly/monthly/yearly)
 * @returns {Promise<Object>} Financial summary
 */
export const getFinancialSummary = async (period = "monthly") => {
    return apiClient.get(`/stats/summary?period=${period}`);
};
