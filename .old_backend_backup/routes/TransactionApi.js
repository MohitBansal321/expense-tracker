import { Router } from "express";
import * as TransactionController from "../controller/TransactionController.js";
const router = Router();

// sending json response to /transaction when http GET request to given URL
router.get("/", TransactionController.index);

// Search transactions with filters
router.get("/search", TransactionController.search);

// Export transactions as CSV
router.get("/export", TransactionController.exportCSV);

// Find duplicate transactions
router.get("/duplicates", TransactionController.findDuplicates);

// Get category patterns for analytics
router.get("/patterns", TransactionController.getCategoryPatterns);

// Check if a transaction is a potential duplicate
router.post("/check-duplicate", TransactionController.checkDuplicate);

// AI suggest category based on description
router.post("/suggest-category", TransactionController.suggestCategory);

// Filter by category
router.get("/:id", TransactionController.filter);

// create transaction using /transaction url
router.post("/", TransactionController.create);

// Delete transaction using /transaction/:id
router.delete("/:id", TransactionController.destroy);

// Update transaction using /transaction/:id
router.patch("/:id", TransactionController.update);

export default router;
