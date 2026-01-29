import RecurringTransaction from "../../models/RecurringTransaction.js";
import Transaction from "../../models/Transaction.js";
import User from "../../models/User.js";
import { AppError } from "../middleware/error.middleware.js";
import { ERROR_MESSAGES } from "../constants/index.js";
import { calculateFirstExecution, calculateNextExecution, isEndDateReached } from "../utils/date.util.js";

/**
 * Recurring Transaction Service
 * Handles all recurring transaction-related business logic
 */

class RecurringTransactionService {
    /**
     * Get all recurring transactions for a user
     * @param {String} userId - User ID
     * @returns {Array} Recurring transactions with category info
     */
    async getAllRecurringTransactions(userId) {
        const recurringTransactions = await RecurringTransaction.find({
            user_id: userId,
        }).sort({ nextExecution: 1 });

        // Get user categories for mapping
        const user = await User.findById(userId);
        const categoryMap = {};
        user.categories.forEach((cat) => {
            categoryMap[cat._id.toString()] = cat;
        });

        // Enrich with category info
        const enriched = recurringTransactions.map((rt) => ({
            _id: rt._id,
            amount: rt.amount,
            description: rt.description,
            type: rt.type,
            category_id: rt.category_id,
            categoryName: categoryMap[rt.category_id?.toString()]?.label || "Unknown",
            categoryIcon: categoryMap[rt.category_id?.toString()]?.icon || "",
            frequency: rt.frequency,
            dayOfWeek: rt.dayOfWeek,
            dayOfMonth: rt.dayOfMonth,
            startDate: rt.startDate,
            endDate: rt.endDate,
            nextExecution: rt.nextExecution,
            lastExecuted: rt.lastExecuted,
            isActive: rt.isActive,
            createdAt: rt.createdAt,
        }));

        return enriched;
    }

    /**
     * Create a recurring transaction
     * @param {Object} data - Recurring transaction data
     * @param {String} userId - User ID
     * @returns {Object} Created recurring transaction
     */
    async createRecurringTransaction(data, userId) {
        const {
            amount,
            description,
            type,
            category_id,
            frequency,
            dayOfWeek,
            dayOfMonth,
            startDate,
            endDate,
        } = data;

        // Calculate first execution date
        const nextExecution = calculateFirstExecution(startDate, frequency, dayOfWeek, dayOfMonth);

        const recurringTransaction = new RecurringTransaction({
            user_id: userId,
            amount,
            description,
            type: type || "expense",
            category_id,
            frequency,
            dayOfWeek,
            dayOfMonth,
            startDate: startDate ? new Date(startDate) : new Date(),
            endDate: endDate ? new Date(endDate) : null,
            nextExecution,
        });

        await recurringTransaction.save();

        return recurringTransaction;
    }

    /**
     * Update a recurring transaction
     * @param {String} id - Recurring transaction ID
     * @param {Object} updates - Update data
     * @param {String} userId - User ID
     * @returns {Object} Updated recurring transaction
     */
    async updateRecurringTransaction(id, updates, userId) {
        const recurringTransaction = await RecurringTransaction.findOneAndUpdate(
            { _id: id, user_id: userId },
            { $set: updates },
            { new: true }
        );

        if (!recurringTransaction) {
            throw new AppError(ERROR_MESSAGES.RECURRING_NOT_FOUND, 404);
        }

        return recurringTransaction;
    }

    /**
     * Delete a recurring transaction
     * @param {String} id - Recurring transaction ID
     * @param {String} userId - User ID
     * @returns {Object} Deleted recurring transaction
     */
    async deleteRecurringTransaction(id, userId) {
        const result = await RecurringTransaction.findOneAndDelete({ _id: id, user_id: userId });

        if (!result) {
            throw new AppError(ERROR_MESSAGES.RECURRING_NOT_FOUND, 404);
        }

        return result;
    }

    /**
     * Toggle active status of a recurring transaction
     * @param {String} id - Recurring transaction ID
     * @param {String} userId - User ID
     * @returns {Object} Updated recurring transaction
     */
    async toggleActive(id, userId) {
        const recurringTransaction = await RecurringTransaction.findOne({ _id: id, user_id: userId });

        if (!recurringTransaction) {
            throw new AppError(ERROR_MESSAGES.RECURRING_NOT_FOUND, 404);
        }

        recurringTransaction.isActive = !recurringTransaction.isActive;
        await recurringTransaction.save();

        return recurringTransaction;
    }

    /**
     * Process due recurring transactions
     * @returns {Array} Processed transactions
     */
    async processDueTransactions() {
        const now = new Date();

        // Find all active recurring transactions due for execution
        const dueTransactions = await RecurringTransaction.find({
            isActive: true,
            nextExecution: { $lte: now },
            $or: [{ endDate: null }, { endDate: { $gte: now } }],
        });

        const results = [];

        for (const recurring of dueTransactions) {
            // Create the actual transaction
            const transaction = new Transaction({
                user_id: recurring.user_id,
                amount: recurring.amount,
                description: `${recurring.description} (Recurring)`,
                type: recurring.type,
                category_id: recurring.category_id,
                date: now,
            });

            await transaction.save();

            // Update the recurring transaction
            recurring.lastExecuted = now;
            recurring.nextExecution = recurring.calculateNextExecution();

            // Check if end date is reached
            if (isEndDateReached(recurring.nextExecution, recurring.endDate)) {
                recurring.isActive = false;
            }

            await recurring.save();

            results.push({
                recurringId: recurring._id,
                transactionId: transaction._id,
                amount: recurring.amount,
                description: recurring.description,
            });
        }

        return results;
    }

    /**
     * Manually execute a recurring transaction
     * @param {String} id - Recurring transaction ID
     * @param {String} userId - User ID
     * @returns {Object} Created transaction
     */
    async executeNow(id, userId) {
        const now = new Date();

        const recurring = await RecurringTransaction.findOne({ _id: id, user_id: userId });

        if (!recurring) {
            throw new AppError(ERROR_MESSAGES.RECURRING_NOT_FOUND, 404);
        }

        // Create the transaction
        const transaction = new Transaction({
            user_id: userId,
            amount: recurring.amount,
            description: `${recurring.description} (Manual)`,
            type: recurring.type,
            category_id: recurring.category_id,
            date: now,
        });

        await transaction.save();

        // Update last executed
        recurring.lastExecuted = now;
        recurring.nextExecution = recurring.calculateNextExecution();
        await recurring.save();

        return transaction;
    }
}

export default new RecurringTransactionService();
