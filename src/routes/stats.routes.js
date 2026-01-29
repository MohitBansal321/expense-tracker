import { Router } from "express";
import * as statsController from "../controllers/stats.controller.js";

const router = Router();

// Get stats
router.get("/", statsController.index);

export default router;
