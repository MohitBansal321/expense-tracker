import authService from "../services/auth.service.js";
import asyncHandler from "../middleware/async-handler.middleware.js";
import { sendSuccess, sendCreated } from "../utils/response.util.js";

/**
 * Authentication Controller
 * Handles HTTP requests for authentication
 */

/**
 * Register a new user
 * POST /auth/register
 */
export const register = asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);
    sendCreated(res, null, result.message);
});

/**
 * Login user
 * POST /auth/login
 */
export const login = asyncHandler(async (req, res) => {
    const result = await authService.login(req.body);
    sendSuccess(res, { token: result.token, user: result.user }, result.message);
});
