// Import necessary modules
import { Router } from "express";
import {
    index,
    create,
    update,
    destroy,
    getAlerts
} from "../controller/BudgetController.js";

// Create an instance of Express router
const router = Router();

// Budget routes
router.get("/", index);           // Get all budgets with spending data
router.post("/", create);         // Create a new budget
router.patch("/:id", update);     // Update a budget
router.delete("/:id", destroy);   // Delete a budget
router.get("/alerts", getAlerts); // Get budget alerts

// Export the router
export default router;
