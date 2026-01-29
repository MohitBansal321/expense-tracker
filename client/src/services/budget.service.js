import apiClient from "../api/client.js";

/**
 * Budget Service
 * Handles all budget-related API calls
 */

/**
 * Fetch all budgets
 * @returns {Promise<Object>} Budgets data
 */
export const fetchBudgets = async () => {
    return apiClient.get("/budget");
};

/**
 * Get budget by ID
 * @param {string} id - Budget ID
 * @returns {Promise<Object>} Budget data
 */
export const getBudgetById = async (id) => {
    return apiClient.get(`/budget/${id}`);
};

/**
 * Create new budget
 * @param {Object} data - Budget data
 * @param {string} data.category_id - Category ID
 * @param {number} data.limit - Budget limit amount
 * @param {string} data.period - Budget period (monthly/yearly)
 * @returns {Promise<Object>} Created budget
 */
export const createBudget = async (data) => {
    return apiClient.post("/budget", data);
};

/**
 * Update existing budget
 * @param {string} id - Budget ID
 * @param {Object} data - Updated budget data
 * @returns {Promise<Object>} Updated budget
 */
export const updateBudget = async (id, data) => {
    return apiClient.put(`/budget/${id}`, data);
};

/**
 * Delete budget
 * @param {string} id - Budget ID
 * @returns {Promise<Object>} Success response
 */
export const deleteBudget = async (id) => {
    return apiClient.delete(`/budget/${id}`);
};

/**
 * Get budget status/progress
 * @param {string} id - Budget ID
 * @returns {Promise<Object>} Budget status with spending info
 */
export const getBudgetStatus = async (id) => {
    return apiClient.get(`/budget/${id}/status`);
};

/**
 * Get all budgets with current status
 * @returns {Promise<Object>} All budgets with status
 */
export const getBudgetsWithStatus = async () => {
    return apiClient.get("/budget/status/all");
};

/**
 * Get budget alerts
 * @returns {Promise<Object>} Budget alerts for exceeded budgets
 */
export const getBudgetAlerts = async () => {
    return apiClient.get("/budget/alerts");
};
