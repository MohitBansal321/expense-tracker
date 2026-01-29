import { Router } from "express";
import authenticate from "../middleware/auth.middleware.js";
import authRoutes from "./auth.routes.js";
import budgetRoutes from "./budget.routes.js";
import categoryRoutes from "./category.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import recurringTransactionRoutes from "./recurring-transaction.routes.js";
import reportsRoutes from "./reports.routes.js";
import statsRoutes from "./stats.routes.js";
import transactionRoutes from "./transaction.routes.js";
import userRoutes from "./user.routes.js";

const router = Router();

// Public routes
router.use("/auth", authRoutes);
router.use("/stats", statsRoutes);
router.use("/user", userRoutes);

// Protected routes (require authentication)
router.use("/dashboard", authenticate, dashboardRoutes);
router.use("/budget", authenticate, budgetRoutes);
router.use("/recurring", authenticate, recurringTransactionRoutes);
router.use("/reports", authenticate, reportsRoutes);
router.use("/transaction", authenticate, transactionRoutes);
router.use("/category", authenticate, categoryRoutes);

export default router;
