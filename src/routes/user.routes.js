import { Router } from "express";
import * as userController from "../controllers/user.controller.js";

const router = Router();

// Get user information
router.get("/", userController.index);

// Update user profile
router.patch("/", userController.update);

export default router;
