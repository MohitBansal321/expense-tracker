// Import necessary modules
import { Router } from "express";
import {
    index,
    create,
    update,
    destroy,
    toggleActive,
    processDueTransactions,
    executeNow
} from "../controller/RecurringTransactionController.js";

// Create an instance of Express router
const router = Router();

// Recurring transaction routes
router.get("/", index);                    // Get all recurring transactions
router.post("/", create);                  // Create a new recurring transaction
router.patch("/:id", update);              // Update a recurring transaction
router.delete("/:id", destroy);            // Delete a recurring transaction
router.post("/:id/toggle", toggleActive);  // Toggle active status
router.post("/:id/execute", executeNow);   // Execute now (manual trigger)
router.post("/process", processDueTransactions); // Process all due transactions

// Export the router
export default router;
