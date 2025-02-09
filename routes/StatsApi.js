import { Router } from "express";
import * as statsController from "../controller/StatsController.js";
const router = Router();

// sending json response to /count  when http GET request to given URL
router.get("/count", statsController.index);

export default router;
