import User from "../../models/User.js";
import { AppError } from "../middleware/error.middleware.js";

/**
 * Category Service
 * Handles category-related business logic
 */

class CategoryService {
    /**
     * Create a new category for a user
     * @param {Object} categoryData - Category data (label, icon)
     * @param {Object} user - User object
     * @returns {Object} Created category
     */
    async createCategory(categoryData, user) {
        const { label, icon } = categoryData;

        const newCategory = { label, icon };

        // Add the new category to the user's categories list
        const response = await User.updateOne(
            { _id: user._id },
            { $set: { categories: [...user.categories, newCategory] } }
        );

        return { response, category: newCategory };
    }

    /**
     * Update a category
     * @param {String} categoryId - Category ID
     * @param {Object} categoryData - Updated category data
     * @param {Object} user - User object
     * @returns {Object} Update result
     */
    async updateCategory(categoryId, categoryData, user) {
        const { label, icon } = categoryData;

        const response = await User.updateOne(
            { _id: user._id },
            {
                $set: {
                    categories: user.categories.map((category) => {
                        if (category._id == categoryId) {
                            return { label, icon, _id: category._id };
                        }
                        return category;
                    }),
                },
            }
        );

        return response;
    }

    /**
     * Delete a category
     * @param {String} categoryId - Category ID
     * @param {Object} user - User object
     * @returns {Object} Update result
     */
    async deleteCategory(categoryId, user) {
        // Filter out the category to be deleted
        const newCategories = user.categories.filter((category) => category._id != categoryId);

        const response = await User.updateOne(
            { _id: user._id },
            { $set: { categories: newCategories } }
        );

        return response;
    }
}

export default new CategoryService();
