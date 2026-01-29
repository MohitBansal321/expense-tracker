import Budget from "../models/Budget.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

// Get all budgets for the authenticated user with spending data
export const index = async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();

        // Get all budgets for the user
        const budgets = await Budget.find({ user_id: userId, isActive: true });

        // Get user categories for mapping
        const user = await User.findById(userId);
        const categoryMap = {};
        user.categories.forEach(cat => {
            categoryMap[cat._id.toString()] = cat;
        });

        // Calculate current period spending for each budget
        const budgetsWithSpending = await Promise.all(
            budgets.map(async (budget) => {
                // Calculate period start date
                let periodStart;
                if (budget.period === "monthly") {
                    periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
                } else if (budget.period === "weekly") {
                    const day = now.getDay();
                    periodStart = new Date(now);
                    periodStart.setDate(now.getDate() - day);
                    periodStart.setHours(0, 0, 0, 0);
                } else {
                    periodStart = new Date(now.getFullYear(), 0, 1);
                }

                // Get spending for this category in the current period
                const spending = await Transaction.aggregate([
                    {
                        $match: {
                            user_id: userId,
                            category_id: budget.category_id,
                            type: { $ne: "income" },
                            date: { $gte: periodStart, $lte: now }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: "$amount" }
                        }
                    }
                ]);

                const currentSpending = spending[0]?.total || 0;
                const percentageUsed = budget.amount > 0
                    ? Math.round((currentSpending / budget.amount) * 100)
                    : 0;
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
                    createdAt: budget.createdAt
                };
            })
        );

        // Calculate summary
        const summary = {
            totalBudget: budgetsWithSpending.reduce((sum, b) => sum + b.amount, 0),
            totalSpending: budgetsWithSpending.reduce((sum, b) => sum + b.currentSpending, 0),
            budgetsOverLimit: budgetsWithSpending.filter(b => b.isOverBudget).length,
            budgetsNearLimit: budgetsWithSpending.filter(b => b.isNearLimit && !b.isOverBudget).length,
        };

        res.json({
            success: true,
            data: {
                budgets: budgetsWithSpending,
                summary
            }
        });
    } catch (error) {
        console.error("Budget fetch error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch budgets" });
    }
};

// Create a new budget
export const create = async (req, res) => {
    try {
        const { category_id, amount, period, alertThreshold } = req.body;
        const userId = req.user._id;

        // Check if budget already exists for this category
        const existingBudget = await Budget.findOne({
            user_id: userId,
            category_id
        });

        if (existingBudget) {
            return res.status(400).json({
                success: false,
                message: "Budget already exists for this category. Please update the existing budget."
            });
        }

        const budget = new Budget({
            user_id: userId,
            category_id,
            amount,
            period: period || "monthly",
            alertThreshold: alertThreshold || 80
        });

        await budget.save();

        res.status(201).json({
            success: true,
            message: "Budget created successfully",
            data: budget
        });
    } catch (error) {
        console.error("Budget create error:", error);
        res.status(500).json({ success: false, message: "Failed to create budget" });
    }
};

// Update an existing budget
export const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, period, alertThreshold, isActive } = req.body;
        const userId = req.user._id;

        const budget = await Budget.findOneAndUpdate(
            { _id: id, user_id: userId },
            {
                $set: {
                    amount,
                    period,
                    alertThreshold,
                    isActive
                }
            },
            { new: true }
        );

        if (!budget) {
            return res.status(404).json({ success: false, message: "Budget not found" });
        }

        res.json({
            success: true,
            message: "Budget updated successfully",
            data: budget
        });
    } catch (error) {
        console.error("Budget update error:", error);
        res.status(500).json({ success: false, message: "Failed to update budget" });
    }
};

// Delete a budget
export const destroy = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const budget = await Budget.findOneAndDelete({ _id: id, user_id: userId });

        if (!budget) {
            return res.status(404).json({ success: false, message: "Budget not found" });
        }

        res.json({ success: true, message: "Budget deleted successfully" });
    } catch (error) {
        console.error("Budget delete error:", error);
        res.status(500).json({ success: false, message: "Failed to delete budget" });
    }
};

// Get budget alerts (budgets that are near or over limit)
export const getAlerts = async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();

        const budgets = await Budget.find({ user_id: userId, isActive: true });
        const alerts = [];

        for (const budget of budgets) {
            let periodStart;
            if (budget.period === "monthly") {
                periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
            } else if (budget.period === "weekly") {
                const day = now.getDay();
                periodStart = new Date(now);
                periodStart.setDate(now.getDate() - day);
                periodStart.setHours(0, 0, 0, 0);
            } else {
                periodStart = new Date(now.getFullYear(), 0, 1);
            }

            const spending = await Transaction.aggregate([
                {
                    $match: {
                        user_id: userId,
                        category_id: budget.category_id,
                        type: { $ne: "income" },
                        date: { $gte: periodStart, $lte: now }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$amount" }
                    }
                }
            ]);

            const currentSpending = spending[0]?.total || 0;
            const percentageUsed = budget.amount > 0
                ? Math.round((currentSpending / budget.amount) * 100)
                : 0;

            if (percentageUsed >= budget.alertThreshold) {
                const user = await User.findById(userId);
                const category = user.categories.find(
                    c => c._id.toString() === budget.category_id?.toString()
                );

                alerts.push({
                    budgetId: budget._id,
                    categoryName: category?.label || "Unknown",
                    amount: budget.amount,
                    currentSpending,
                    percentageUsed,
                    isOverBudget: currentSpending > budget.amount,
                    severity: currentSpending > budget.amount ? "error" : "warning"
                });
            }
        }

        res.json({ success: true, data: alerts });
    } catch (error) {
        console.error("Budget alerts error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch budget alerts" });
    }
};
