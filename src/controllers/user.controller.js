import userService from "../services/user.service.js";
import asyncHandler from "../middleware/async-handler.middleware.js";
import { sendSuccess } from "../utils/response.util.js";

/**
 * User Controller
 * Handles HTTP requests for user management
 */

/**
 * Get user information
 * GET /user
 */
export const index = (req, res) => {
    res.json({ user: req.user });
};

/**
 * Update user profile
 * PATCH /user
 */
export const update = asyncHandler(async (req, res) => {
    const user = await userService.updateUserProfile(req.user._id, req.body);
    sendSuccess(res, user);
});
