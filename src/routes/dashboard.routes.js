import { Router } from "express";
import * as dashboardController from "../controllers/dashboard.controller.js";

const router = Router();

// Get dashboard data
router.get("/", dashboardController.getDashboardData);

export default router;
