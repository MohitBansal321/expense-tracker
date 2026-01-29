import reportsService from "../services/reports.service.js";
import asyncHandler from "../middleware/async-handler.middleware.js";
import { sendSuccess } from "../utils/response.util.js";

/**
 * Reports Controller
 * Handles HTTP requests for reports
 */

/**
 * Get monthly report
 * GET /reports/monthly
 */
export const getMonthlyReport = asyncHandler(async (req, res) => {
    const data = await reportsService.getMonthlyReport(
        req.user._id,
        req.query.month,
        req.query.year
    );
    sendSuccess(res, data);
});

/**
 * Get yearly report
 * GET /reports/yearly
 */
export const getYearlyReport = asyncHandler(async (req, res) => {
    const data = await reportsService.getYearlyReport(req.user._id, req.query.year);
    sendSuccess(res, data);
});
