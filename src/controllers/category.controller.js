import categoryService from "../services/category.service.js";
import asyncHandler from "../middleware/async-handler.middleware.js";
import { sendSuccess, sendCreated } from "../utils/response.util.js";

/**
 * Category Controller
 * Handles HTTP requests for categories
 */

/**
 * Create a new category
 * POST /category
 */
export const create = asyncHandler(async (req, res) => {
    const result = await categoryService.createCategory(req.body, req.user);
    sendCreated(res, result, "Category created successfully");
});

/**
 * Update a category
 * PATCH /category/:id
 */
export const update = asyncHandler(async (req, res) => {
    const response = await categoryService.updateCategory(req.params.id, req.body, req.user);
    sendSuccess(res, response, "Category updated successfully");
});

/**
 * Delete a category
 * DELETE /category/:id
 */
export const destroy = asyncHandler(async (req, res) => {
    const user = await categoryService.deleteCategory(req.params.id, req.user);
    sendSuccess(res, user, "Category deleted successfully");
});
