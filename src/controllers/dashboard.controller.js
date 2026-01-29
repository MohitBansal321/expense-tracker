import dashboardService from "../services/dashboard.service.js";
import asyncHandler from "../middleware/async-handler.middleware.js";
import { sendSuccess } from "../utils/response.util.js";

/**
 * Dashboard Controller
 * Handles HTTP requests for dashboard data
 */

/**
 * Get dashboard analytics data
 * GET /dashboard
 */
export const getDashboardData = asyncHandler(async (req, res) => {
    const data = await dashboardService.getDashboardData(req.user._id);
    sendSuccess(res, data);
});
