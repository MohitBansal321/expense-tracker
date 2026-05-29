class MockModel {
    constructor() {}
    static find() { return this; }
    static aggregate() { return this; }
}

const mockTransactions = [];

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
        // Mock aggregate that actually does work similar to the DB for benchmark purposes
        // Or we can just sleep to simulate DB latency
        await new Promise(resolve => setTimeout(resolve, 2)); // 2ms db latency
        let total = 0;
        for (const t of mockTransactions) {
            if (t.user_id === userId && t.category_id === categoryId && t.type !== "income" && t.date >= periodStart && t.date <= periodEnd) {
                total += t.amount;
            }
        }
        return total;
    },

    async getAllBudgets(userId) {
        const now = new Date();

        // Mock budgets
        const budgets = [];
        for (let i = 0; i < 50; i++) {
            budgets.push({
                _id: "b" + i,
                category_id: "c" + i,
                amount: 1000,
                period: "monthly",
                alertThreshold: 80
            });
        }

        const categoryMap = {};
        for (let i = 0; i < 50; i++) {
            categoryMap["c" + i] = { label: "Cat " + i, icon: "icon" };
        }

        const budgetsWithSpending = await Promise.all(
            budgets.map(async (budget) => {
                const periodStart = this.calculatePeriodStart(budget.period, now);
                const currentSpending = await this.calculateSpending(
                    userId,
                    budget.category_id,
                    periodStart,
                    now
                );

                return {
                    currentSpending
                };
            })
        );
        return budgetsWithSpending;
    }
};

async function run() {
    const userId = "u1";
    // Setup mock transactions
    for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 10; j++) {
            mockTransactions.push({
                user_id: userId,
                category_id: "c" + i,
                type: "expense",
                amount: 10,
                date: new Date()
            });
        }
    }

    console.log("Running baseline...");
    const start = Date.now();
    for (let i = 0; i < 10; i++) {
        await BudgetService.getAllBudgets(userId);
    }
    const end = Date.now();
    console.log(`Baseline took ${end - start}ms`);
}
run();
