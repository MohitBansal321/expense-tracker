import Budget from "../../models/Budget.js";
import Transaction from "../../models/Transaction.js";
import User from "../../models/User.js";
import { AppError } from "../middleware/error.middleware.js";
import { ERROR_MESSAGES } from "../constants/index.js";

/**
 * Budget Service
 * Handles all budget-related business logic
 */

class BudgetService {
    /**
     * Calculate period start date based on budget period
     * @param {String} period - Budget period (monthly, weekly, yearly)
     * @param {Date} currentDate - Current date
     * @returns {Date} Period start date
     */
    calculatePeriodStart(period, currentDate = new Date()) {
        let periodStart;

        if (period === "monthly") {
            periodStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        } else if (period === "weekly") {
            const day = currentDate.getDay();
            periodStart = new Date(currentDate);
            periodStart.setDate(currentDate.getDate() - day);
            periodStart.setHours(0, 0, 0, 0);
        } else {
            // yearly
            periodStart = new Date(currentDate.getFullYear(), 0, 1);
        }

        return periodStart;
    }

    /**
     * Calculate current spending for a budget
     * @param {String} userId - User ID
     * @param {String} categoryId - Category ID
     * @param {Date} periodStart - Period start date
     * @param {Date} periodEnd - Period end date
     * @returns {Number} Current spending amount
     */
    async calculateSpending(userId, categoryId, periodStart, periodEnd) {
        const spending = await Transaction.aggregate([
            {
                $match: {
                    user_id: userId,
                    category_id: categoryId,
                    type: { $ne: "income" },
                    date: { $gte: periodStart, $lte: periodEnd },
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" },
                },
            },
        ]);

        return spending[0]?.total || 0;
    }

    /**
     * Get all budgets with spending data
     * @param {String} userId - User ID
     * @returns {Object} Budgets with spending data and summary
     */
    async getAllBudgets(userId) {
        const now = new Date();

        // Get all budgets for the user
        const budgets = await Budget.find({ user_id: userId, isActive: true });

        // Get user categories for mapping
        const user = await User.findById(userId);
        const categoryMap = {};
        user.categories.forEach((cat) => {
            categoryMap[cat._id.toString()] = cat;
        });

        // Calculate current period spending for each budget
        const budgetsWithSpending = await Promise.all(
            budgets.map(async (budget) => {
                // Calculate period start date
                const periodStart = this.calculatePeriodStart(budget.period, now);

                // Get spending for this category in the current period
                const currentSpending = await this.calculateSpending(
                    userId,
                    budget.category_id,
                    periodStart,
                    now
                );

                const percentageUsed =
                    budget.amount > 0 ? Math.round((currentSpending / budget.amount) * 100) : 0;
                const isOverBudget = currentSpending > budget.amount;
                const isNearLimit = percentageUsed >= budget.alertThreshold;

                return {
                    _id: budget._id,
                    category_id: budget.category_id,
                    categoryName: categoryMap[budget.category_id?.toString()]?.label || "Unknown",
                    categoryIcon: categoryMap[budget.category_id?.toString()]?.icon || "",
                    amount: budget.amount,
                    period: budget.period,
                    alertThreshold: budget.alertThreshold,
                    currentSpending,
                    percentageUsed,
                    remaining: Math.max(0, budget.amount - currentSpending),
                    isOverBudget,
                    isNearLimit,
                    periodStart,
                    createdAt: budget.createdAt,
                };
            })
        );

        // Calculate summary
        const summary = {
            totalBudget: budgetsWithSpending.reduce((sum, b) => sum + b.amount, 0),
            totalSpending: budgetsWithSpending.reduce((sum, b) => sum + b.currentSpending, 0),
            budgetsOverLimit: budgetsWithSpending.filter((b) => b.isOverBudget).length,
            budgetsNearLimit: budgetsWithSpending.filter((b) => b.isNearLimit && !b.isOverBudget)
                .length,
        };

        return {
            budgets: budgetsWithSpending,
            summary,
        };
    }

    /**
     * Create a new budget
     * @param {Object} budgetData - Budget data
     * @param {String} userId - User ID
     * @returns {Object} Created budget
     */
    async createBudget(budgetData, userId) {
        const { category_id, amount, period, alertThreshold } = budgetData;

        // Check if budget already exists for this category
        const existingBudget = await Budget.findOne({
            user_id: userId,
            category_id,
        });

        if (existingBudget) {
            throw new AppError(
                "Budget already exists for this category. Please update the existing budget.",
                400
            );
        }

        const budget = new Budget({
            user_id: userId,
            category_id,
            amount,
            period: period || "monthly",
            alertThreshold: alertThreshold || 80,
        });

        await budget.save();

        return budget;
    }

    /**
     * Update a budget
     * @param {String} budgetId - Budget ID
     * @param {Object} updateData - Update data
     * @param {String} userId - User ID
     * @returns {Object} Updated budget
     */
    async updateBudget(budgetId, updateData, userId) {
        const { amount, period, alertThreshold, isActive } = updateData;

        const budget = await Budget.findOneAndUpdate(
            { _id: budgetId, user_id: userId },
            {
                $set: {
                    amount,
                    period,
                    alertThreshold,
                    isActive,
                },
            },
            { new: true }
        );

        if (!budget) {
            throw new AppError(ERROR_MESSAGES.BUDGET_NOT_FOUND, 404);
        }

        return budget;
    }

    /**
     * Delete a budget
     * @param {String} budgetId - Budget ID
     * @param {String} userId - User ID
     * @returns {Object} Deleted budget
     */
    async deleteBudget(budgetId, userId) {
        const budget = await Budget.findOneAndDelete({ _id: budgetId, user_id: userId });

        if (!budget) {
            throw new AppError(ERROR_MESSAGES.BUDGET_NOT_FOUND, 404);
        }

        return budget;
    }

    /**
     * Get budget alerts
     * @param {String} userId - User ID
     * @returns {Array} Budget alerts
     */
    async getBudgetAlerts(userId) {
        const now = new Date();
        const budgets = await Budget.find({ user_id: userId, isActive: true });
        const alerts = [];

        for (const budget of budgets) {
            const periodStart = this.calculatePeriodStart(budget.period, now);

            const currentSpending = await this.calculateSpending(
                userId,
                budget.category_id,
                periodStart,
                now
            );

            const percentageUsed =
                budget.amount > 0 ? Math.round((currentSpending / budget.amount) * 100) : 0;

            if (percentageUsed >= budget.alertThreshold) {
                const user = await User.findById(userId);
                const category = user.categories.find(
                    (c) => c._id.toString() === budget.category_id?.toString()
                );

                alerts.push({
                    budgetId: budget._id,
                    categoryName: category?.label || "Unknown",
                    amount: budget.amount,
                    currentSpending,
                    percentageUsed,
                    isOverBudget: currentSpending > budget.amount,
                    severity: currentSpending > budget.amount ? "error" : "warning",
                });
            }
        }

        return alerts;
    }
}

export default new BudgetService();
