import transactionService from "../services/transaction.service.js";
import asyncHandler from "../middleware/async-handler.middleware.js";
import { sendSuccess, sendCreated } from "../utils/response.util.js";
import { generateCSVFilename, setCSVHeaders } from "../utils/csv.util.js";

/**
 * Transaction Controller
 * Handles HTTP requests for transactions
 */

/**
 * Get all transactions grouped by month
 * GET /transaction
 */
export const index = asyncHandler(async (req, res) => {
    const transactions = await transactionService.getTransactions(req.user._id);
    res.json({ data: transactions });
});

/**
 * Get transactions filtered by category
 * GET /transaction/:id
 */
export const filter = asyncHandler(async (req, res) => {
    const transactions = await transactionService.getTransactionsByCategory(
        req.user._id,
        req.params.id
    );
    res.json({ data: transactions });
});

/**
 * Search transactions with filters
 * GET /transaction/search
 */
export const search = asyncHandler(async (req, res) => {
    const transactions = await transactionService.searchTransactions(req.user._id, req.query);
    sendSuccess(res, transactions);
});

/**
 * Export transactions as CSV
 * GET /transaction/export
 */
export const exportCSV = asyncHandler(async (req, res) => {
    const csvContent = await transactionService.exportTransactionsCSV(req.user._id, req.query);

    const filename = generateCSVFilename("transactions");
    setCSVHeaders(res, filename);
    res.send(csvContent);
});

/**
 * Create a new transaction
 * POST /transaction
 */
export const create = asyncHandler(async (req, res) => {
    await transactionService.createTransaction(req.body, req.user._id);
    res.json({ message: "Success" });
});

/**
 * Update a transaction
 * PATCH /transaction/:id
 */
export const update = asyncHandler(async (req, res) => {
    await transactionService.updateTransaction(req.params.id, req.body);
    res.json({ message: "success" });
});

/**
 * Delete a transaction
 * DELETE /transaction/:id
 */
export const destroy = asyncHandler(async (req, res) => {
    await transactionService.deleteTransaction(req.params.id);
    res.json({ message: "success" });
});

/**
 * Find duplicate transactions
 * GET /transaction/duplicates
 */
export const findDuplicates = asyncHandler(async (req, res) => {
    const duplicates = await transactionService.findDuplicates(req.user._id);
    sendSuccess(res, { duplicates, count: duplicates.length });
});

/**
 * Check if a transaction is a potential duplicate
 * POST /transaction/check-duplicate
 */
export const checkDuplicate = asyncHandler(async (req, res) => {
    const result = await transactionService.checkDuplicate(req.body, req.user._id);
    sendSuccess(res, result);
});

/**
 * Suggest category based on description
 * POST /transaction/suggest-category
 */
export const suggestCategory = asyncHandler(async (req, res) => {
    const result = await transactionService.suggestCategory(req.body.description, req.user._id);
    sendSuccess(res, result);
});

/**
 * Get category patterns for analytics
 * GET /transaction/patterns
 */
export const getCategoryPatterns = asyncHandler(async (req, res) => {
    const patterns = await transactionService.getCategoryPatterns(req.user._id);
    sendSuccess(res, { patterns });
});
