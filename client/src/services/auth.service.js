import apiClient from "../api/client.js";

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

/**
 * Login user
 * @param {Object} credentials - User credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise<Object>} User data and token
 */
export const login = async (credentials) => {
    return apiClient.post("/auth/login", credentials);
};

/**
 * Register new user
 * @param {Object} userData - User registration data
 * @param {string} userData.name - User name
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @returns {Promise<Object>} User data and token
 */
export const register = async (userData) => {
    return apiClient.post("/auth/register", userData);
};

/**
 * Logout user
 * @returns {Promise<void>}
 */
export const logout = async () => {
    return apiClient.post("/auth/logout");
};

/**
 * Get current user
 * @returns {Promise<Object>} Current user data
 */
export const getCurrentUser = async () => {
    return apiClient.get("/user");
};

/**
 * Update user profile
 * @param {Object} data - Profile update data
 * @returns {Promise<Object>} Updated user data
 */
export const updateProfile = async (data) => {
    return apiClient.put("/user/profile", data);
};

/**
 * Change password
 * @param {Object} data - Password change data
 * @param {string} data.currentPassword - Current password
 * @param {string} data.newPassword - New password
 * @returns {Promise<Object>} Success response
 */
export const changePassword = async (data) => {
    return apiClient.put("/user/password", data);
};

/**
 * Request password reset
 * @param {string} email - User email
 * @returns {Promise<Object>} Success response
 */
export const requestPasswordReset = async (email) => {
    return apiClient.post("/auth/forgot-password", { email });
};

/**
 * Reset password with token
 * @param {Object} data - Reset data
 * @param {string} data.token - Reset token
 * @param {string} data.password - New password
 * @returns {Promise<Object>} Success response
 */
export const resetPassword = async (data) => {
    return apiClient.post("/auth/reset-password", data);
};
