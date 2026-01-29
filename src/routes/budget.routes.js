import { Router } from "express";
import * as budgetController from "../controllers/budget.controller.js";

const router = Router();

// Get budget alerts
router.get("/alerts", budgetController.getAlerts);

// Get all budgets
router.get("/", budgetController.index);

// Create budget
router.post("/", budgetController.create);

// Update budget
router.patch("/:id", budgetController.update);

// Delete budget
router.delete("/:id", budgetController.destroy);

export default router;
