// Import necessary modules and libraries
import { Router } from "express";
import * as CategoryController from "../controller/CategoryController.js";

// Create an instance of an Express router
const router = Router();

// Define routes and associate them with the CategoryController functions

// Route to delete a category by ID
router.delete("/:id", CategoryController.destroy);

// Route to update a category by ID
router.patch("/:id", CategoryController.update);

// Route to create a new category
router.post("/", CategoryController.create);

// Export the configured router for use in your Express application
export default router;
