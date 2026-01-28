// Import necessary modules and libraries
import { Router } from "express";
import passport from "passport";
import AuthApi from "./AuthApi.js";
import BudgetApi from "./BudgetApi.js";
import CategoryApi from "./CategoryApi.js";
import DashboardApi from "./DashboardApi.js";
import RecurringTransactionApi from "./RecurringTransactionApi.js";
import ReportsApi from "./ReportsApi.js";
import TransactionApi from "./TransactionApi.js";
import UserApi from "./UserApi.js";
import StatsApi from "./StatsApi.js";

// Create an instance of an Express router
const router = Router();

// Configure passport for authentication using JWT (JSON Web Tokens)
const auth = passport.authenticate("jwt", { session: false });

// Define routes and associate them with their respective APIs/controllers

// Dashboard routes require authentication (JWT)
router.use("/dashboard", auth, DashboardApi);

// Budget routes require authentication (JWT)
router.use("/budget", auth, BudgetApi);

// Recurring transaction routes require authentication (JWT)
router.use("/recurring", auth, RecurringTransactionApi);

// Reports routes require authentication (JWT)
router.use("/reports", auth, ReportsApi);

// Transaction-related routes require authentication (JWT)
router.use("/transaction", auth, TransactionApi);

// Routes related to authentication (e.g., login, registration)
router.use("/auth", AuthApi);

// Routes related to user management
router.use("/user", UserApi);

// Category-related routes require authentication (JWT)
router.use("/category", auth, CategoryApi);

// Routes related to statistics
router.use("/stats", StatsApi);

// Export the configured router for use in your Express application
export default router;




