import RecurringTransaction from "../models/RecurringTransaction.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

// Get all recurring transactions for the authenticated user
export const index = async (req, res) => {
    try {
        const userId = req.user._id;

        const recurringTransactions = await RecurringTransaction.find({
            user_id: userId
        }).sort({ nextExecution: 1 });

        // Get user categories for mapping
        const user = await User.findById(userId);
        const categoryMap = {};
        user.categories.forEach(cat => {
            categoryMap[cat._id.toString()] = cat;
        });

        // Enrich with category info
        const enriched = recurringTransactions.map(rt => ({
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
            createdAt: rt.createdAt
        }));

        res.json({ success: true, data: enriched });
    } catch (error) {
        console.error("Recurring transaction fetch error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch recurring transactions" });
    }
};

// Create a new recurring transaction
export const create = async (req, res) => {
    try {
        const {
            amount,
            description,
            type,
            category_id,
            frequency,
            dayOfWeek,
            dayOfMonth,
            startDate,
            endDate
        } = req.body;
        const userId = req.user._id;

        // Calculate first execution date
        const start = startDate ? new Date(startDate) : new Date();
        let nextExecution = new Date(start);

        // Adjust for specific day settings
        if (frequency === "weekly" && dayOfWeek !== undefined) {
            const currentDay = nextExecution.getDay();
            const daysUntilTarget = (dayOfWeek - currentDay + 7) % 7;
            nextExecution.setDate(nextExecution.getDate() + (daysUntilTarget || 7));
        } else if (frequency === "monthly" && dayOfMonth) {
            nextExecution.setDate(Math.min(dayOfMonth, new Date(nextExecution.getFullYear(), nextExecution.getMonth() + 1, 0).getDate()));
            if (nextExecution <= new Date()) {
                nextExecution.setMonth(nextExecution.getMonth() + 1);
            }
        }

        const recurringTransaction = new RecurringTransaction({
            user_id: userId,
            amount,
            description,
            type: type || "expense",
            category_id,
            frequency,
            dayOfWeek,
            dayOfMonth,
            startDate: start,
            endDate: endDate ? new Date(endDate) : null,
            nextExecution
        });

        await recurringTransaction.save();

        res.status(201).json({
            success: true,
            message: "Recurring transaction created successfully",
            data: recurringTransaction
        });
    } catch (error) {
        console.error("Recurring transaction create error:", error);
        res.status(500).json({ success: false, message: "Failed to create recurring transaction" });
    }
};

// Update a recurring transaction
export const update = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const updates = req.body;

        const recurringTransaction = await RecurringTransaction.findOneAndUpdate(
            { _id: id, user_id: userId },
            { $set: updates },
            { new: true }
        );

        if (!recurringTransaction) {
            return res.status(404).json({ success: false, message: "Recurring transaction not found" });
        }

        res.json({
            success: true,
            message: "Recurring transaction updated successfully",
            data: recurringTransaction
        });
    } catch (error) {
        console.error("Recurring transaction update error:", error);
        res.status(500).json({ success: false, message: "Failed to update recurring transaction" });
    }
};

// Delete a recurring transaction
export const destroy = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const result = await RecurringTransaction.findOneAndDelete({ _id: id, user_id: userId });

        if (!result) {
            return res.status(404).json({ success: false, message: "Recurring transaction not found" });
        }

        res.json({ success: true, message: "Recurring transaction deleted successfully" });
    } catch (error) {
        console.error("Recurring transaction delete error:", error);
        res.status(500).json({ success: false, message: "Failed to delete recurring transaction" });
    }
};

// Toggle active status
export const toggleActive = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const recurringTransaction = await RecurringTransaction.findOne({ _id: id, user_id: userId });

        if (!recurringTransaction) {
            return res.status(404).json({ success: false, message: "Recurring transaction not found" });
        }

        recurringTransaction.isActive = !recurringTransaction.isActive;
        await recurringTransaction.save();

        res.json({
            success: true,
            message: `Recurring transaction ${recurringTransaction.isActive ? "activated" : "paused"}`,
            data: recurringTransaction
        });
    } catch (error) {
        console.error("Toggle active error:", error);
        res.status(500).json({ success: false, message: "Failed to toggle status" });
    }
};

// Process due recurring transactions (called by scheduler)
export const processDueTransactions = async (req, res) => {
    try {
        const now = new Date();

        // Find all active recurring transactions due for execution
        const dueTransactions = await RecurringTransaction.find({
            isActive: true,
            nextExecution: { $lte: now },
            $or: [
                { endDate: null },
                { endDate: { $gte: now } }
            ]
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
                date: now
            });

            await transaction.save();

            // Update the recurring transaction
            recurring.lastExecuted = now;
            recurring.nextExecution = recurring.calculateNextExecution();

            // Check if end date is reached
            if (recurring.endDate && recurring.nextExecution > recurring.endDate) {
                recurring.isActive = false;
            }

            await recurring.save();

            results.push({
                recurringId: recurring._id,
                transactionId: transaction._id,
                amount: recurring.amount,
                description: recurring.description
            });
        }

        res.json({
            success: true,
            message: `Processed ${results.length} recurring transactions`,
            data: results
        });
    } catch (error) {
        console.error("Process recurring transactions error:", error);
        res.status(500).json({ success: false, message: "Failed to process recurring transactions" });
    }
};

// Manually execute a recurring transaction
export const executeNow = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const now = new Date();

        const recurring = await RecurringTransaction.findOne({ _id: id, user_id: userId });

        if (!recurring) {
            return res.status(404).json({ success: false, message: "Recurring transaction not found" });
        }

        // Create the transaction
        const transaction = new Transaction({
            user_id: userId,
            amount: recurring.amount,
            description: `${recurring.description} (Manual)`,
            type: recurring.type,
            category_id: recurring.category_id,
            date: now
        });

        await transaction.save();

        // Update last executed
        recurring.lastExecuted = now;
        recurring.nextExecution = recurring.calculateNextExecution();
        await recurring.save();

        res.json({
            success: true,
            message: "Transaction created successfully",
            data: transaction
        });
    } catch (error) {
        console.error("Execute now error:", error);
        res.status(500).json({ success: false, message: "Failed to execute transaction" });
    }
};
