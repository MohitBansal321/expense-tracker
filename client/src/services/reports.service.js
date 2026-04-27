import apiClient from "../api/client.js";

/**
 * Reports Service
 * Handles all report-related API calls
 */

/**
 * Get monthly report
 * @param {number} month - Month (1-12)
 * @param {number} year - Year
 * @returns {Promise<Object>} Monthly report data
 */
export const getMonthlyReport = async (month, year) => {
    return apiClient.get(`/reports/monthly?month=${month}&year=${year}`);
};

/**
 * Get yearly report
 * @param {number} year - Year
 * @returns {Promise<Object>} Yearly report data
 */
export const getYearlyReport = async (year) => {
    return apiClient.get(`/reports/yearly?year=${year}`);
};
