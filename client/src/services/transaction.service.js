import apiClient from "../api/client.js";

/**
 * Transaction Service
 * Handles all transaction-related API calls
 */

/**
 * Fetch all transactions
 * @param {string} categoryFilter - Optional category ID filter
 * @returns {Promise<Object>} Transaction data
 */
export const fetchTransactions = async (categoryFilter = "") => {
    const endpoint = categoryFilter
        ? `/transaction/${categoryFilter}`
        : "/transaction";
    return apiClient.get(endpoint);
};

/**
 * Search transactions
 * @param {Object} params - Search parameters
 * @param {string} params.query - Search query
 * @param {string} params.startDate - Start date filter
 * @param {string} params.endDate - End date filter
 * @param {string} params.type - Transaction type (income/expense)
 * @returns {Promise<Object>} Search results
 */
export const searchTransactions = async (params) => {
    const searchParams = new URLSearchParams();

    if (params.query) searchParams.append("query", params.query);
    if (params.startDate) searchParams.append("startDate", params.startDate);
    if (params.endDate) searchParams.append("endDate", params.endDate);
    if (params.type && params.type !== "all") searchParams.append("type", params.type);

    return apiClient.get(`/transaction/search?${searchParams.toString()}`);
};

/**
 * Create new transaction
 * @param {Object} data - Transaction data
 * @param {number} data.amount - Transaction amount
 * @param {string} data.description - Transaction description
 * @param {Date} data.date - Transaction date
 * @param {string} data.category_id - Category ID
 * @param {string} data.type - Transaction type (income/expense)
 * @returns {Promise<Object>} Created transaction
 */
export const createTransaction = async (data) => {
    return apiClient.post("/transaction", data);
};

/**
 * Update existing transaction
 * @param {string} id - Transaction ID
 * @param {Object} data - Updated transaction data
 * @returns {Promise<Object>} Updated transaction
 */
export const updateTransaction = async (id, data) => {
    return apiClient.put(`/transaction/${id}`, data);
};

/**
 * Delete transaction
 * @param {string} id - Transaction ID
 * @returns {Promise<Object>} Success response
 */
export const deleteTransaction = async (id) => {
    return apiClient.delete(`/transaction/${id}`);
};

/**
 * Export transactions as CSV
 * @param {Object} params - Export parameters
 * @param {string} params.startDate - Start date filter
 * @param {string} params.endDate - End date filter
 * @returns {Promise<Blob>} CSV file blob
 */
export const exportTransactions = async (params = {}) => {
    const searchParams = new URLSearchParams();

    if (params.startDate) searchParams.append("startDate", params.startDate);
    if (params.endDate) searchParams.append("endDate", params.endDate);

    return apiClient.get(`/transaction/export?${searchParams.toString()}`);
};

/**
 * Get transaction by ID
 * @param {string} id - Transaction ID
 * @returns {Promise<Object>} Transaction data
 */
export const getTransactionById = async (id) => {
    return apiClient.get(`/transaction/${id}`);
};

/**
 * Bulk delete transactions
 * @param {Array<string>} ids - Array of transaction IDs
 * @returns {Promise<Object>} Success response
 */
export const bulkDeleteTransactions = async (ids) => {
    return apiClient.post("/transaction/bulk-delete", { ids });
};

/**
 * Get transactions by date range
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @returns {Promise<Object>} Transactions in date range
 */
export const getTransactionsByDateRange = async (startDate, endDate) => {
    return apiClient.get(`/transaction/range?startDate=${startDate}&endDate=${endDate}`);
};
