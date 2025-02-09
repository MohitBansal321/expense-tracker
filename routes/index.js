// Import necessary modules and libraries
import { Router } from "express";
import passport from "passport";
import AuthApi from "./AuthApi.js";
import CategoryApi from "./CategoryApi.js";
import TransactionApi from "./TransactionApi.js";
import UserApi from "./UserApi.js";
import StatsApi from "./StatsApi.js";

// Create an instance of an Express router
const router = Router();

// Configure passport for authentication using JWT (JSON Web Tokens)
const auth = passport.authenticate("jwt", { session: false });

// Define routes and associate them with their respective APIs/controllers

// Transaction-related routes require authentication (JWT)
router.use("/transaction", auth, TransactionApi);

// Routes related to authentication (e.g., login, registration)
router.use("/auth", AuthApi);

// Routes related to user management
router.use("/user", UserApi);

// Category-related routes require authentication (JWT)
router.use("/category", auth, CategoryApi);

// routes related to statistics
router.use("/stats",StatsApi);

// Export the configured router for use in your Express application
export default router;
