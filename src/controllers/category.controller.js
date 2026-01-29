import categoryService from "../services/category.service.js";
import asyncHandler from "../middleware/async-handler.middleware.js";

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
    res.json(result);
});

/**
 * Update a category
 * PATCH /category/:id
 */
export const update = asyncHandler(async (req, res) => {
    const response = await categoryService.updateCategory(req.params.id, req.body, req.user);
    res.json({ response });
});

/**
 * Delete a category
 * DELETE /category/:id
 */
export const destroy = asyncHandler(async (req, res) => {
    const user = await categoryService.deleteCategory(req.params.id, req.user);
    res.json({ user });
});
