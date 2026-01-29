import { useState, useCallback } from "react";
import * as categoryService from "../services/category.service.js";

/**
 * Custom hook for category operations
 * @returns {Object} Category state and methods
 */
export const useCategories = () => {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Fetch all categories
     */
    const fetchCategories = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await categoryService.fetchCategories();
            setCategories(response.data || []);
            setIsLoading(false);
            return response.data;
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
            return [];
        }
    }, []);

    /**
     * Get category by ID
     */
    const getCategoryById = useCallback((id) => {
        return categories.find(cat => cat._id === id);
    }, [categories]);

    /**
     * Get category name by ID
     */
    const getCategoryNameById = useCallback((id) => {
        const category = categories.find(cat => cat._id === id);
        return category?.name || "Unknown";
    }, [categories]);

    /**
     * Create new category
     */
    const createCategory = useCallback(async (data) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await categoryService.createCategory(data);
            setIsLoading(false);
            return response;
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
            throw err;
        }
    }, []);

    /**
     * Update existing category
     */
    const updateCategory = useCallback(async (id, data) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await categoryService.updateCategory(id, data);
            setIsLoading(false);
            return response;
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
            throw err;
        }
    }, []);

    /**
     * Delete category
     */
    const deleteCategory = useCallback(async (id) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await categoryService.deleteCategory(id);
            setIsLoading(false);
            return response;
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
            throw err;
        }
    }, []);

    /**
     * Get categories by type
     */
    const getCategoriesByType = useCallback((type) => {
        return categories.filter(cat => cat.type === type);
    }, [categories]);

    return {
        categories,
        isLoading,
        error,
        fetchCategories,
        getCategoryById,
        getCategoryNameById,
        createCategory,
        updateCategory,
        deleteCategory,
        getCategoriesByType,
        setCategories,
    };
};
