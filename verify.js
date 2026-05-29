import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import BudgetService from "./src/services/budget.service.js";
import Budget from "./src/models/Budget.js";
import Transaction from "./src/models/Transaction.js";
import User from "./src/models/User.js";

async function runBenchmark() {
    console.log("Starting MongoMemoryServer...");
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    const userId = new mongoose.Types.ObjectId();

    // Create user
    const user = new User({
        _id: userId,
        email: "test@test.com",
        password: "password",
        name: "Test User",
        categories: []
    });

    console.log("Creating mock data...");
    // Create 50 budgets and 500 transactions
    for (let i = 0; i < 50; i++) {
        const categoryId = new mongoose.Types.ObjectId();
        user.categories.push({
            _id: categoryId,
            label: `Cat ${i}`,
            icon: "icon"
        });

        await Budget.create({
            user_id: userId,
            category_id: categoryId,
            amount: 1000,
            period: "monthly",
            alertThreshold: 80
        });

        // 10 transactions per category
        for (let j = 0; j < 10; j++) {
            await Transaction.create({
                user_id: userId,
                category_id: categoryId,
                amount: 100,
                type: "expense",
                date: new Date()
            });
        }
    }

    await user.save();

    console.log("Starting benchmark...");

    const start = Date.now();
    for (let i = 0; i < 10; i++) {
        await BudgetService.getAllBudgets(userId);
    }
    const end = Date.now();

    console.log(`getAllBudgets 10 times took ${end - start} ms`);

    const startAlerts = Date.now();
    for (let i = 0; i < 10; i++) {
        await BudgetService.getBudgetAlerts(userId);
    }
    const endAlerts = Date.now();

    console.log(`getBudgetAlerts 10 times took ${endAlerts - startAlerts} ms`);

    await mongoose.disconnect();
    await mongoServer.stop();
}

runBenchmark().catch(console.error);
