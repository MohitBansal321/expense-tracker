import statsService from "../services/stats.service.js";
import asyncHandler from "../middleware/async-handler.middleware.js";

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
    res.json({ data });
});
