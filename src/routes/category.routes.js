import { Router } from "express";
import * as categoryController from "../controllers/category.controller.js";

const router = Router();

// Create category
router.post("/", categoryController.create);

// Update category
router.patch("/:id", categoryController.update);

// Delete category
router.delete("/:id", categoryController.destroy);

export default router;
