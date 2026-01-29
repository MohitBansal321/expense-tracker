import apiClient from "../api/client.js";

/**
 * Category Service
 * Handles all category-related API calls
 */

/**
 * Fetch all categories
 * @returns {Promise<Object>} Categories data
 */
export const fetchCategories = async () => {
    return apiClient.get("/category");
};

/**
 * Get category by ID
 * @param {string} id - Category ID
 * @returns {Promise<Object>} Category data
 */
export const getCategoryById = async (id) => {
    return apiClient.get(`/category/${id}`);
};

/**
 * Create new category
 * @param {Object} data - Category data
 * @param {string} data.name - Category name
 * @param {string} data.type - Category type (income/expense)
 * @param {string} data.icon - Category icon
 * @param {string} data.color - Category color
 * @returns {Promise<Object>} Created category
 */
export const createCategory = async (data) => {
    return apiClient.post("/category", data);
};

/**
 * Update existing category
 * @param {string} id - Category ID
 * @param {Object} data - Updated category data
 * @returns {Promise<Object>} Updated category
 */
export const updateCategory = async (id, data) => {
    return apiClient.put(`/category/${id}`, data);
};

/**
 * Delete category
 * @param {string} id - Category ID
 * @returns {Promise<Object>} Success response
 */
export const deleteCategory = async (id) => {
    return apiClient.delete(`/category/${id}`);
};

/**
 * Get categories by type
 * @param {string} type - Category type (income/expense)
 * @returns {Promise<Object>} Categories of specified type
 */
export const getCategoriesByType = async (type) => {
    return apiClient.get(`/category/type/${type}`);
};

/**
 * Get category statistics
 * @param {string} id - Category ID
 * @returns {Promise<Object>} Category statistics
 */
export const getCategoryStats = async (id) => {
    return apiClient.get(`/category/${id}/stats`);
};
