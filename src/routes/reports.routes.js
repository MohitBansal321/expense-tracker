import { Router } from "express";
import * as reportsController from "../controllers/reports.controller.js";

const router = Router();

// Get monthly report
router.get("/monthly", reportsController.getMonthlyReport);

// Get yearly report
router.get("/yearly", reportsController.getYearlyReport);

export default router;
