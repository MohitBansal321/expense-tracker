import budgetService from "../services/budget.service.js";
import asyncHandler from "../middleware/async-handler.middleware.js";
import { sendSuccess, sendCreated } from "../utils/response.util.js";

/**
 * Budget Controller
 * Handles HTTP requests for budgets
 */

/**
 * Get all budgets with spending data
 * GET /budget
 */
export const index = asyncHandler(async (req, res) => {
    const data = await budgetService.getAllBudgets(req.user._id);
    sendSuccess(res, data);
});

/**
 * Create a new budget
 * POST /budget
 */
export const create = asyncHandler(async (req, res) => {
    const budget = await budgetService.createBudget(req.body, req.user._id);
    sendCreated(res, budget, "Budget created successfully");
});

/**
 * Update a budget
 * PATCH /budget/:id
 */
export const update = asyncHandler(async (req, res) => {
    const budget = await budgetService.updateBudget(req.params.id, req.body, req.user._id);
    sendSuccess(res, budget, "Budget updated successfully");
});

/**
 * Delete a budget
 * DELETE /budget/:id
 */
export const destroy = asyncHandler(async (req, res) => {
    await budgetService.deleteBudget(req.params.id, req.user._id);
    sendSuccess(res, null, "Budget deleted successfully");
});

/**
 * Get budget alerts
 * GET /budget/alerts
 */
export const getAlerts = asyncHandler(async (req, res) => {
    const alerts = await budgetService.getBudgetAlerts(req.user._id);
    sendSuccess(res, alerts);
});
