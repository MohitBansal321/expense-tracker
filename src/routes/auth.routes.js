import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";

const router = Router();

// Register new user
router.post("/register", authController.register);

// Login user
router.post("/login", authController.login);

export default router;
