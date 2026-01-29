// Import necessary modules and libraries
import { Router } from "express";
import { login, register } from "../controller/AuthController.js";

// Create an instance of an Express router
const router = Router();

// Define routes and associate them with the AuthController functions

// Route to handle user registration
router.post("/register", register);

// Route to handle user login
router.post("/login", login);

// Export the configured router for use in your Express application
export default router;
