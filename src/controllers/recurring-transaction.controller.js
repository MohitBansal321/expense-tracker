import recurringTransactionService from "../services/recurring-transaction.service.js";
import asyncHandler from "../middleware/async-handler.middleware.js";
import { sendSuccess, sendCreated } from "../utils/response.util.js";

/**
 * Recurring Transaction Controller
 * Handles HTTP requests for recurring transactions
 */

/**
 * Get all recurring transactions
 * GET /recurring
 */
export const index = asyncHandler(async (req, res) => {
    const data = await recurringTransactionService.getAllRecurringTransactions(req.user._id);
    sendSuccess(res, data);
});

/**
 * Create a recurring transaction
 * POST /recurring
 */
export const create = asyncHandler(async (req, res) => {
    const recurring = await recurringTransactionService.createRecurringTransaction(
        req.body,
        req.user._id
    );
    sendCreated(res, recurring, "Recurring transaction created successfully");
});

/**
 * Update a recurring transaction
 * PATCH /recurring/:id
 */
export const update = asyncHandler(async (req, res) => {
    const recurring = await recurringTransactionService.updateRecurringTransaction(
        req.params.id,
        req.body,
        req.user._id
    );
    sendSuccess(res, recurring, "Recurring transaction updated successfully");
});

/**
 * Delete a recurring transaction
 * DELETE /recurring/:id
 */
export const destroy = asyncHandler(async (req, res) => {
    await recurringTransactionService.deleteRecurringTransaction(req.params.id, req.user._id);
    sendSuccess(res, null, "Recurring transaction deleted successfully");
});

/**
 * Toggle active status
 * PATCH /recurring/:id/toggle
 */
export const toggleActive = asyncHandler(async (req, res) => {
    const recurring = await recurringTransactionService.toggleActive(req.params.id, req.user._id);
    const message = `Recurring transaction ${recurring.isActive ? "activated" : "paused"}`;
    sendSuccess(res, recurring, message);
});

/**
 * Process due recurring transactions (scheduler endpoint)
 * POST /recurring/process
 */
export const processDueTransactions = asyncHandler(async (req, res) => {
    const results = await recurringTransactionService.processDueTransactions();
    sendSuccess(res, results, `Processed ${results.length} recurring transactions`);
});

/**
 * Manually execute a recurring transaction now
 * POST /recurring/:id/execute
 */
export const executeNow = asyncHandler(async (req, res) => {
    const transaction = await recurringTransactionService.executeNow(req.params.id, req.user._id);
    sendSuccess(res, transaction, "Transaction created successfully");
});
