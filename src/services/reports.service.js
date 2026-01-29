import Transaction from "../../models/Transaction.js";
import User from "../../models/User.js";
import mongoose from "mongoose";

/**
 * Reports Service
 * Handles report generation logic
 */

class ReportsService {
    /**
     * Generate monthly report
     * @param {String} userId - User ID
     * @param {Number} month - Target month (1-12)
     * @param {Number} year - Target year
     * @returns {Object} Monthly report data
     */
    async getMonthlyReport(userId, month, year) {
        const targetMonth = parseInt(month) || new Date().getMonth() + 1;
        const targetYear = parseInt(year) || new Date().getFullYear();

        const startDate = new Date(targetYear, targetMonth - 1, 1);
        const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

        // Get user categories
        const user = await User.findById(userId);
        const categoryMap = {};
        user.categories.forEach((cat) => {
            categoryMap[cat._id.toString()] = cat;
        });

        // Aggregate transactions for the month
        const transactions = await Transaction.find({
            user_id: new mongoose.Types.ObjectId(userId),
            date: { $gte: startDate, $lte: endDate },
        }).sort({ date: -1 });

        // Calculate totals
        let totalIncome = 0;
        let totalExpenses = 0;
        const categoryBreakdown = {};
        const dailyData = {};

        transactions.forEach((tx) => {
            const isIncome = tx.type === "income";
            const catId = tx.category_id?.toString();
            const day = new Date(tx.date).getDate();

            if (isIncome) {
                totalIncome += tx.amount;
            } else {
                totalExpenses += tx.amount;
            }

            // Category breakdown (expenses only)
            if (!isIncome && catId) {
                if (!categoryBreakdown[catId]) {
                    categoryBreakdown[catId] = {
                        category: categoryMap[catId]?.label || "Unknown",
                        icon: categoryMap[catId]?.icon || "",
                        amount: 0,
                        count: 0,
                    };
                }
                categoryBreakdown[catId].amount += tx.amount;
                categoryBreakdown[catId].count += 1;
            }

            // Daily breakdown
            if (!dailyData[day]) {
                dailyData[day] = { day, income: 0, expense: 0 };
            }
            if (isIncome) {
                dailyData[day].income += tx.amount;
            } else {
                dailyData[day].expense += tx.amount;
            }
        });

        // Get previous month for comparison
        const prevStartDate = new Date(targetYear, targetMonth - 2, 1);
        const prevEndDate = new Date(targetYear, targetMonth - 1, 0, 23, 59, 59);

        const prevTransactions = await Transaction.find({
            user_id: new mongoose.Types.ObjectId(userId),
            date: { $gte: prevStartDate, $lte: prevEndDate },
        });

        let prevIncome = 0;
        let prevExpenses = 0;
        prevTransactions.forEach((tx) => {
            if (tx.type === "income") prevIncome += tx.amount;
            else prevExpenses += tx.amount;
        });

        // Calculate changes
        const incomeChange = prevIncome > 0 ? ((totalIncome - prevIncome) / prevIncome) * 100 : 0;
        const expenseChange =
            prevExpenses > 0 ? ((totalExpenses - prevExpenses) / prevExpenses) * 100 : 0;

        return {
            month: targetMonth,
            year: targetYear,
            summary: {
                totalIncome,
                totalExpenses,
                netSavings: totalIncome - totalExpenses,
                transactionCount: transactions.length,
                incomeChange: Math.round(incomeChange),
                expenseChange: Math.round(expenseChange),
            },
            categoryBreakdown: Object.values(categoryBreakdown).sort((a, b) => b.amount - a.amount),
            dailyData: Object.values(dailyData).sort((a, b) => a.day - b.day),
            topExpenses: transactions
                .filter((tx) => tx.type !== "income")
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 5)
                .map((tx) => ({
                    description: tx.description,
                    amount: tx.amount,
                    category: categoryMap[tx.category_id?.toString()]?.label || "Unknown",
                    date: tx.date,
                })),
        };
    }

    /**
     * Generate yearly report
     * @param {String} userId - User ID
     * @param {Number} year - Target year
     * @returns {Object} Yearly report data
     */
    async getYearlyReport(userId, year) {
        const targetYear = parseInt(year) || new Date().getFullYear();

        const startDate = new Date(targetYear, 0, 1);
        const endDate = new Date(targetYear, 11, 31, 23, 59, 59);

        // Get user categories
        const user = await User.findById(userId);
        const categoryMap = {};
        user.categories.forEach((cat) => {
            categoryMap[cat._id.toString()] = cat;
        });

        // Aggregate by month
        const monthlyData = await Transaction.aggregate([
            {
                $match: {
                    user_id: new mongoose.Types.ObjectId(userId),
                    date: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $group: {
                    _id: { month: { $month: "$date" } },
                    income: {
                        $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
                    },
                    expense: {
                        $sum: { $cond: [{ $ne: ["$type", "income"] }, "$amount", 0] },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { "_id.month": 1 } },
        ]);

        // Fill in missing months
        const months = [];
        for (let i = 1; i <= 12; i++) {
            const found = monthlyData.find((m) => m._id.month === i);
            months.push({
                month: i,
                monthName: new Date(2000, i - 1, 1).toLocaleString("default", { month: "short" }),
                income: found?.income || 0,
                expense: found?.expense || 0,
                count: found?.count || 0,
            });
        }

        // Category totals for the year
        const categoryTotals = await Transaction.aggregate([
            {
                $match: {
                    user_id: new mongoose.Types.ObjectId(userId),
                    date: { $gte: startDate, $lte: endDate },
                    type: { $ne: "income" },
                },
            },
            {
                $group: {
                    _id: "$category_id",
                    total: { $sum: "$amount" },
                    count: { $sum: 1 },
                },
            },
            { $sort: { total: -1 } },
        ]);

        const categoryBreakdown = categoryTotals.map((ct) => ({
            category: categoryMap[ct._id?.toString()]?.label || "Unknown",
            icon: categoryMap[ct._id?.toString()]?.icon || "",
            amount: ct.total,
            count: ct.count,
        }));

        // Calculate totals
        const totalIncome = months.reduce((sum, m) => sum + m.income, 0);
        const totalExpenses = months.reduce((sum, m) => sum + m.expense, 0);
        const totalTransactions = months.reduce((sum, m) => sum + m.count, 0);

        // Best and worst months
        const bestMonth = [...months].sort(
            (a, b) => b.income - b.expense - (a.income - a.expense)
        )[0];
        const worstMonth = [...months].sort(
            (a, b) => a.income - a.expense - (b.income - b.expense)
        )[0];

        return {
            year: targetYear,
            summary: {
                totalIncome,
                totalExpenses,
                netSavings: totalIncome - totalExpenses,
                transactionCount: totalTransactions,
                averageMonthlyExpense: Math.round(totalExpenses / 12),
                averageMonthlyIncome: Math.round(totalIncome / 12),
            },
            monthlyData: months,
            categoryBreakdown,
            insights: {
                bestMonth: bestMonth.monthName,
                bestMonthSavings: bestMonth.income - bestMonth.expense,
                worstMonth: worstMonth.monthName,
                worstMonthDeficit: worstMonth.income - worstMonth.expense,
                topCategory: categoryBreakdown[0]?.category || "None",
                topCategoryAmount: categoryBreakdown[0]?.amount || 0,
            },
        };
    }
}

export default new ReportsService();
