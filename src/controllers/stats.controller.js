import statsService from "../services/stats.service.js";
import asyncHandler from "../middleware/async-handler.middleware.js";
import { sendSuccess } from "../utils/response.util.js";

/**
 * Stats Controller
 * Handles HTTP requests for statistics
 */

/**
 * Get global statistics
 * GET /stats
 */
export const index = asyncHandler(async (req, res) => {
    const data = await statsService.getGlobalStats();
    sendSuccess(res, data);
});
