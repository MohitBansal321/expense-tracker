import Transaction from "../../models/Transaction.js";
import User from "../../models/User.js";
import mongoose from "mongoose";
import { AppError } from "../middleware/error.middleware.js";
import { ERROR_MESSAGES } from "../constants/index.js";
import { calculateSimilarity } from "../utils/similarity.util.js";
import { convertToCSV } from "../utils/csv.util.js";

/**
 * Transaction Service
 * Handles all transaction-related business logic
 */

class TransactionService {
    /**
     * Get all transactions grouped by month
     * @param {String} userId - User ID
     * @returns {Array} Transactions grouped by month
     */
    async getTransactions(userId) {
        const transactions = await Transaction.aggregate([
            {
                $match: { user_id: userId },
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$date" },
                        month: { $month: "$date" },
                    },
                    transactions: {
                        $push: {
                            amount: "$amount",
                            description: "$description",
                            date: "$date",
                            type: "$type",
                            _id: "$_id",
                            category_id: "$category_id",
                        },
                    },
                    totalExpenses: { $sum: "$amount" },
                },
            },
            { $sort: { "_id.year": -1, "_id.month": -1 } },
        ]);

        return transactions;
    }

    /**
     * Get transactions filtered by category
     * @param {String} userId - User ID
     * @param {String} categoryId - Category ID
     * @returns {Array} Filtered transactions
     */
    async getTransactionsByCategory(userId, categoryId) {
        const category_id = mongoose.Types.ObjectId.isValid(categoryId)
            ? new mongoose.Types.ObjectId(categoryId)
            : categoryId;

        const transactions = await Transaction.aggregate([
            {
                $match: { user_id: userId, category_id: category_id },
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$date" },
                        month: { $month: "$date" },
                    },
                    transactions: {
                        $push: {
                            amount: "$amount",
                            description: "$description",
                            date: "$date",
                            type: "$type",
                            _id: "$_id",
                            category_id: "$category_id",
                        },
                    },
                    totalExpenses: { $sum: "$amount" },
                },
            },
            { $sort: { "_id.year": -1, "_id.month": -1 } },
        ]);

        return transactions;
    }

    /**
     * Search transactions with filters
     * @param {String} userId - User ID
     * @param {Object} filters - Search filters
     * @returns {Array} Matching transactions
     */
    async searchTransactions(userId, filters) {
        const { query, startDate, endDate, type, minAmount, maxAmount, category_id } = filters;

        // Build match conditions
        const matchConditions = { user_id: userId };

        // Search by description
        if (query) {
            matchConditions.description = { $regex: query, $options: "i" };
        }

        // Filter by date range
        if (startDate || endDate) {
            matchConditions.date = {};
            if (startDate) {
                matchConditions.date.$gte = new Date(startDate);
            }
            if (endDate) {
                matchConditions.date.$lte = new Date(endDate);
            }
        }

        // Filter by category
        if (category_id) {
            matchConditions.category_id = mongoose.Types.ObjectId.isValid(category_id)
                ? new mongoose.Types.ObjectId(category_id)
                : category_id;
        }

        // Filter by type
        if (type && ["income", "expense"].includes(type)) {
            matchConditions.type = type;
        }

        // Filter by amount range
        if (minAmount || maxAmount) {
            matchConditions.amount = {};
            if (minAmount) {
                matchConditions.amount.$gte = parseFloat(minAmount);
            }
            if (maxAmount) {
                matchConditions.amount.$lte = parseFloat(maxAmount);
            }
        }

        const transactions = await Transaction.find(matchConditions)
            .sort({ date: -1 })
            .limit(100);

        return transactions;
    }

    /**
     * Export transactions to CSV
     * @param {String} userId - User ID
     * @param {Object} filters - Date filters
     * @returns {Object} CSV content and user categories
     */
    async exportTransactionsCSV(userId, filters) {
        const { startDate, endDate } = filters;

        // Build match conditions
        const matchConditions = { user_id: userId };

        if (startDate || endDate) {
            matchConditions.date = {};
            if (startDate) {
                matchConditions.date.$gte = new Date(startDate);
            }
            if (endDate) {
                matchConditions.date.$lte = new Date(endDate);
            }
        }

        // Get transactions
        const transactions = await Transaction.find(matchConditions).sort({ date: -1 });

        // Get user categories for mapping
        const user = await User.findById(userId);
        const categoryMap = {};
        user.categories.forEach((cat) => {
            categoryMap[cat._id.toString()] = cat;
        });

        // Build CSV content
        const csvContent = convertToCSV(transactions, categoryMap);

        return csvContent;
    }

    /**
     * Create a new transaction
     * @param {Object} transactionData - Transaction data
     * @param {String} userId - User ID
     * @returns {Object} Created transaction
     */
    async createTransaction(transactionData, userId) {
        const { amount, description, date, category_id, type } = transactionData;

        const transaction = new Transaction({
            amount,
            description,
            date,
            user_id: userId,
            category_id,
            type: type || "expense",
        });

        await transaction.save();

        return transaction;
    }

    /**
     * Update a transaction
     * @param {String} transactionId - Transaction ID
     * @param {Object} updateData - Update data
     * @returns {Object} Updated transaction
     */
    async updateTransaction(transactionId, updateData) {
        const transaction = await Transaction.findByIdAndUpdate(
            transactionId,
            { $set: updateData },
            { new: true }
        );

        if (!transaction) {
            throw new AppError(ERROR_MESSAGES.TRANSACTION_NOT_FOUND, 404);
        }

        return transaction;
    }

    /**
     * Delete a transaction
     * @param {String} transactionId - Transaction ID
     * @returns {Object} Deletion result
     */
    async deleteTransaction(transactionId) {
        const result = await Transaction.deleteOne({ _id: transactionId });

        if (result.deletedCount === 0) {
            throw new AppError(ERROR_MESSAGES.TRANSACTION_NOT_FOUND, 404);
        }

        return result;
    }

    /**
     * Find duplicate transactions
     * @param {String} userId - User ID
     * @returns {Array} Duplicate transaction pairs
     */
    async findDuplicates(userId) {
        // Get all transactions for the user
        const transactions = await Transaction.find({ user_id: userId })
            .sort({ date: -1 })
            .limit(500);

        const duplicates = [];
        const seen = new Map();

        for (const tx of transactions) {
            // Create a key based on amount and approximate date (within 3 days)
            const dateKey = new Date(tx.date);
            dateKey.setHours(0, 0, 0, 0);

            // Check for similar transactions
            for (const [key, existingTx] of seen) {
                const [existingAmount, existingDate, existingDesc] = key.split("|");
                const daysDiff = Math.abs(dateKey - new Date(existingDate)) / (1000 * 60 * 60 * 24);

                // Same amount, within 3 days, and similar description
                if (
                    Math.abs(tx.amount - parseFloat(existingAmount)) < 0.01 &&
                    daysDiff <= 3 &&
                    tx._id.toString() !== existingTx._id.toString()
                ) {
                    // Check description similarity
                    const descSimilarity = calculateSimilarity(
                        tx.description?.toLowerCase() || "",
                        existingTx.description?.toLowerCase() || ""
                    );

                    if (descSimilarity > 0.6 || tx.amount === parseFloat(existingAmount)) {
                        duplicates.push({
                            original: existingTx,
                            duplicate: tx,
                            similarity: descSimilarity,
                            daysDiff: Math.round(daysDiff),
                        });
                    }
                }
            }

            const key = `${tx.amount}|${dateKey.toISOString()}|${tx.description}`;
            seen.set(key, tx);
        }

        return duplicates;
    }

    /**
     * Check if a transaction is a potential duplicate
     * @param {Object} transactionData - Transaction data to check
     * @param {String} userId - User ID
     * @returns {Object} Duplicate check result
     */
    async checkDuplicate(transactionData, userId) {
        const { amount, description, date } = transactionData;

        const targetDate = new Date(date);
        const startDate = new Date(targetDate);
        startDate.setDate(startDate.getDate() - 3);
        const endDate = new Date(targetDate);
        endDate.setDate(endDate.getDate() + 3);

        // Find similar transactions
        const similar = await Transaction.find({
            user_id: userId,
            amount: { $gte: amount * 0.99, $lte: amount * 1.01 },
            date: { $gte: startDate, $lte: endDate },
        }).limit(5);

        const matches = similar.filter((tx) => {
            const similarity = calculateSimilarity(
                description?.toLowerCase() || "",
                tx.description?.toLowerCase() || ""
            );
            return similarity > 0.5;
        });

        return {
            isDuplicate: matches.length > 0,
            matches: matches.map((m) => ({
                _id: m._id,
                amount: m.amount,
                description: m.description,
                date: m.date,
            })),
        };
    }

    /**
     * Suggest category based on past transactions
     * @param {String} description - Transaction description
     * @param {String} userId - User ID
     * @returns {Object} Category suggestion with confidence
     */
    async suggestCategory(description, userId) {
        if (!description || description.trim().length < 2) {
            return { suggestion: null, confidence: 0 };
        }

        const descLower = description.toLowerCase().trim();

        // Get user's past transactions with categories
        const pastTransactions = await Transaction.find({
            user_id: userId,
            description: { $exists: true, $ne: "" },
        })
            .select("description category_id")
            .limit(500);

        // Build category frequency map based on similar descriptions
        const categoryScores = new Map();

        for (const tx of pastTransactions) {
            if (!tx.description || !tx.category_id) continue;

            const txDescLower = tx.description.toLowerCase();
            const similarity = calculateSimilarity(descLower, txDescLower);

            // Also check for keyword matching
            const words = descLower.split(/\s+/);
            const txWords = txDescLower.split(/\s+/);
            let keywordMatch = 0;
            for (const word of words) {
                if (word.length > 2 && txWords.some((tw) => tw.includes(word) || word.includes(tw))) {
                    keywordMatch += 0.3;
                }
            }

            const totalScore = Math.min(similarity + keywordMatch, 1);

            if (totalScore > 0.3) {
                const catId = tx.category_id.toString();
                const existing = categoryScores.get(catId) || { score: 0, count: 0 };
                categoryScores.set(catId, {
                    score: existing.score + totalScore,
                    count: existing.count + 1,
                    category_id: tx.category_id,
                });
            }
        }

        // Find best matching category
        let bestMatch = null;
        let bestScore = 0;

        for (const [catId, data] of categoryScores) {
            const avgScore = data.score / data.count;
            const confidenceBoost = Math.min(data.count * 0.1, 0.3);
            const finalScore = avgScore + confidenceBoost;

            if (finalScore > bestScore) {
                bestScore = finalScore;
                bestMatch = {
                    category_id: data.category_id,
                    confidence: Math.min(finalScore, 1),
                    matchCount: data.count,
                };
            }
        }

        return {
            suggestion: bestMatch?.category_id || null,
            confidence: bestMatch?.confidence || 0,
            matchCount: bestMatch?.matchCount || 0,
        };
    }

    /**
     * Get category patterns for analytics
     * @param {String} userId - User ID
     * @returns {Array} Category patterns with keywords
     */
    async getCategoryPatterns(userId) {
        // Aggregate transactions to find common keywords per category
        const patterns = await Transaction.aggregate([
            { $match: { user_id: userId, description: { $exists: true, $ne: "" } } },
            {
                $group: {
                    _id: "$category_id",
                    descriptions: { $push: "$description" },
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
        ]);

        // Extract common keywords per category
        const categoryPatterns = patterns.map((p) => {
            const allWords = p.descriptions
                .join(" ")
                .toLowerCase()
                .split(/\s+/)
                .filter((w) => w.length > 3);

            // Count word frequency
            const wordCount = {};
            for (const word of allWords) {
                wordCount[word] = (wordCount[word] || 0) + 1;
            }

            // Get top keywords
            const topKeywords = Object.entries(wordCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([word]) => word);

            return {
                category_id: p._id,
                transactionCount: p.count,
                topKeywords,
            };
        });

        return categoryPatterns;
    }
}

export default new TransactionService();
