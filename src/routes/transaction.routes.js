import { Router } from "express";
import * as transactionController from "../controllers/transaction.controller.js";

const router = Router();

// Get all transactions
router.get("/", transactionController.index);

// Search transactions with filters
router.get("/search", transactionController.search);

// Export transactions as CSV
router.get("/export", transactionController.exportCSV);

// Find duplicate transactions
router.get("/duplicates", transactionController.findDuplicates);

// Get category patterns for analytics
router.get("/patterns", transactionController.getCategoryPatterns);

// Check if a transaction is a potential duplicate
router.post("/check-duplicate", transactionController.checkDuplicate);

// AI suggest category based on description
router.post("/suggest-category", transactionController.suggestCategory);

// Filter by category
router.get("/:id", transactionController.filter);

// Create transaction
router.post("/", transactionController.create);

// Delete transaction
router.delete("/:id", transactionController.destroy);

// Update transaction
router.patch("/:id", transactionController.update);

export default router;
