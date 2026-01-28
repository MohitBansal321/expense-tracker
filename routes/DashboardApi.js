// Import necessary modules
import { Router } from "express";
import { getDashboardData } from "../controller/DashboardController.js";

// Create an instance of Express router
const router = Router();

// Dashboard analytics route
router.get("/", getDashboardData);

// Export the router
export default router;
