import apiClient from "../api/client.js";

/**
 * Recurring Transactions Service
 * Handles all recurring transaction-related API calls
 */

/**
 * Fetch all recurring transactions
 * @returns {Promise<Object>} Recurring transactions data
 */
export const fetchRecurringTransactions = async () => {
    return apiClient.get("/recurring");
};

/**
 * Get recurring transaction by ID
 * @param {string} id - Recurring transaction ID
 * @returns {Promise<Object>} Recurring transaction data
 */
export const getRecurringTransactionById = async (id) => {
    return apiClient.get(`/recurring/${id}`);
};

/**
 * Create new recurring transaction
 * @param {Object} data - Recurring transaction data
 * @param {number} data.amount - Transaction amount
 * @param {string} data.description - Transaction description
 * @param {string} data.category_id - Category ID
 * @param {string} data.type - Transaction type (income/expense)
 * @param {string} data.frequency - Frequency (daily/weekly/monthly/yearly)
 * @param {Date} data.startDate - Start date
 * @param {Date} data.endDate - Optional end date
 * @returns {Promise<Object>} Created recurring transaction
 */
export const createRecurringTransaction = async (data) => {
    return apiClient.post("/recurring", data);
};

/**
 * Update existing recurring transaction
 * @param {string} id - Recurring transaction ID
 * @param {Object} data - Updated data
 * @returns {Promise<Object>} Updated recurring transaction
 */
export const updateRecurringTransaction = async (id, data) => {
    return apiClient.put(`/recurring/${id}`, data);
};

/**
 * Delete recurring transaction
 * @param {string} id - Recurring transaction ID
 * @returns {Promise<Object>} Success response
 */
export const deleteRecurringTransaction = async (id) => {
    return apiClient.delete(`/recurring/${id}`);
};

/**
 * Toggle recurring transaction active status
 * @param {string} id - Recurring transaction ID
 * @returns {Promise<Object>} Updated recurring transaction
 */
export const toggleRecurringTransaction = async (id) => {
    return apiClient.patch(`/recurring/${id}/toggle`);
};

/**
 * Process due recurring transactions
 * @returns {Promise<Object>} Processing result
 */
export const processDueRecurringTransactions = async () => {
    return apiClient.post("/recurring/process");
};
