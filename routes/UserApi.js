// Import necessary modules and libraries
import { Router } from "express";
import passport from "passport";
import * as UserController from "../controller/UserController.js";

// Create an instance of an Express router
const router = Router();

// Define a route and associate it with the UserController function

// Route to retrieve user information, protected by JWT authentication
router.get("/", passport.authenticate("jwt", { session: false }), UserController.index);

// Route to update user profile
router.patch("/", passport.authenticate("jwt", { session: false }), UserController.update);

// Export the configured router for use in your Express application
export default router;
