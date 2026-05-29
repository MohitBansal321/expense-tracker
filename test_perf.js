import mongoose from "mongoose";

// Setup mocks
const mockBudgets = Array.from({ length: 50 }).map((_, i) => ({
    _id: new mongoose.Types.ObjectId(),
    category_id: new mongoose.Types.ObjectId(),
    amount: 1000,
    period: i % 3 === 0 ? "yearly" : i % 2 === 0 ? "monthly" : "weekly",
    alertThreshold: 80,
    createdAt: new Date()
}));

const mockUser = {
    _id: new mongoose.Types.ObjectId(),
    categories: mockBudgets.map(b => ({
        _id: b.category_id,
        label: "Cat",
        icon: "Icon"
    }))
};

const mockTransactions = [];
const now = new Date();
const startOfYear = new Date(now.getFullYear(), 0, 1);
for (const b of mockBudgets) {
    for (let i = 0; i < 20; i++) {
        mockTransactions.push({
            user_id: mockUser._id,
            category_id: b.category_id,
            type: "expense",
            amount: 10,
            date: new Date(startOfYear.getTime() + Math.random() * (now.getTime() - startOfYear.getTime()))
        });
    }
}

let queryCount = 0;

const Budget = {
    find: async () => { queryCount++; return mockBudgets; }
};

const User = {
    findById: async () => { queryCount++; return mockUser; }
};

const Transaction = {
    aggregate: async (pipeline) => {
        queryCount++;
        // fake latency
        await new Promise(r => setTimeout(r, 2));

        // very basic mock implementation of aggregate for calculateSpending
        if (pipeline[0].$match.category_id) {
            const catId = pipeline[0].$match.category_id;
            const start = pipeline[0].$match.date.$gte;
            let sum = 0;
            for (const t of mockTransactions) {
                if (t.category_id.toString() === catId.toString() && t.date >= start) {
                    sum += t.amount;
                }
            }
            return [{ total: sum }];
        }
        return [];
    },
    find: async (query) => {
        queryCount++;
        await new Promise(r => setTimeout(r, 2));
        const start = query.date.$gte;
        return mockTransactions.filter(t => t.date >= start);
    }
};

const BudgetService = {
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
            periodStart = new Date(currentDate.getFullYear(), 0, 1);
        }
        return periodStart;
    },
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
    },
    async getAllBudgetsOld(userId) {
        const now = new Date();
        const budgets = await Budget.find({ user_id: userId, isActive: true });
        const user = await User.findById(userId);
        const categoryMap = {};
        user.categories.forEach((cat) => {
            categoryMap[cat._id.toString()] = cat;
        });

        const budgetsWithSpending = await Promise.all(
            budgets.map(async (budget) => {
                const periodStart = this.calculatePeriodStart(budget.period, now);
                const currentSpending = await this.calculateSpending(
                    userId,
                    budget.category_id,
                    periodStart,
                    now
                );
                return { currentSpending };
            })
        );
        return budgetsWithSpending;
    },
    async getAllBudgetsNew(userId) {
        const now = new Date();
        const budgets = await Budget.find({ user_id: userId, isActive: true });
        if (!budgets || budgets.length === 0) return [];

        const user = await User.findById(userId);
        const categoryMap = {};
        if (user && user.categories) {
            user.categories.forEach((cat) => {
                categoryMap[cat._id.toString()] = cat;
            });
        }

        const budgetsWithPeriods = budgets.map(budget => ({
            budget,
            periodStart: this.calculatePeriodStart(budget.period, now)
        }));

        const earliestPeriodStart = new Date(Math.min(...budgetsWithPeriods.map(b => b.periodStart.getTime())));

        const transactions = await Transaction.find({
            user_id: userId,
            type: { $ne: "income" },
            date: { $gte: earliestPeriodStart, $lte: now }
        });

        const budgetsWithSpending = budgetsWithPeriods.map(({ budget, periodStart }) => {
            let currentSpending = 0;
            const catIdStr = budget.category_id.toString();
            for (const t of transactions) {
                if (t.category_id.toString() === catIdStr && t.date >= periodStart) {
                    currentSpending += t.amount;
                }
            }
            return { currentSpending };
        });
        return budgetsWithSpending;
    }
};

async function run() {
    console.log("Warming up...");
    await BudgetService.getAllBudgetsOld(mockUser._id);

    queryCount = 0;
    const startOld = Date.now();
    await BudgetService.getAllBudgetsOld(mockUser._id);
    const endOld = Date.now();
    console.log(`Old method took ${endOld - startOld}ms with ${queryCount} queries`);

    queryCount = 0;
    const startNew = Date.now();
    await BudgetService.getAllBudgetsNew(mockUser._id);
    const endNew = Date.now();
    console.log(`New method took ${endNew - startNew}ms with ${queryCount} queries`);
}

run();
