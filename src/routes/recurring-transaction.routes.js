import { Router } from "express";
import * as recurringController from "../controllers/recurring-transaction.controller.js";

const router = Router();

// Get all recurring transactions
router.get("/", recurringController.index);

// Create recurring transaction
router.post("/", recurringController.create);

// Process due transactions (scheduler endpoint)
router.post("/process", recurringController.processDueTransactions);

// Manually execute a recurring transaction
router.post("/:id/execute", recurringController.executeNow);

// Toggle active status
router.patch("/:id/toggle", recurringController.toggleActive);

// Update recurring transaction
router.patch("/:id", recurringController.update);

// Delete recurring transaction
router.delete("/:id", recurringController.destroy);

export default router;
