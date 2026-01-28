// Import necessary modules
import { Router } from "express";
import { getMonthlyReport, getYearlyReport } from "../controller/ReportsController.js";

// Create an instance of Express router
const router = Router();

// Reports routes
router.get("/monthly", getMonthlyReport);  // Get monthly report
router.get("/yearly", getYearlyReport);    // Get yearly report

// Export the router
export default router;
