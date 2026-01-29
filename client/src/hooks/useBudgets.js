import { useState, useCallback } from "react";
import * as budgetService from "../services/budget.service.js";

/**
 * Custom hook for budget operations
 * @returns {Object} Budget state and methods
 */
export const useBudgets = () => {
    const [budgets, setBudgets] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Fetch all budgets
     */
    const fetchBudgets = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await budgetService.fetchBudgets();
            setBudgets(response.data || []);
            setIsLoading(false);
            return response.data;
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
            return [];
        }
    }, []);

    /**
     * Get budgets with status
     */
    const getBudgetsWithStatus = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await budgetService.getBudgetsWithStatus();
            setBudgets(response.data || []);
            setIsLoading(false);
            return response.data;
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
            return [];
        }
    }, []);

    /**
     * Create new budget
     */
    const createBudget = useCallback(async (data) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await budgetService.createBudget(data);
            setIsLoading(false);
            return response;
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
            throw err;
        }
    }, []);

    /**
     * Update existing budget
     */
    const updateBudget = useCallback(async (id, data) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await budgetService.updateBudget(id, data);
            setIsLoading(false);
            return response;
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
            throw err;
        }
    }, []);

    /**
     * Delete budget
     */
    const deleteBudget = useCallback(async (id) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await budgetService.deleteBudget(id);
            setIsLoading(false);
            return response;
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
            throw err;
        }
    }, []);

    /**
     * Get budget alerts
     */
    const getBudgetAlerts = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await budgetService.getBudgetAlerts();
            setIsLoading(false);
            return response.data;
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
            return [];
        }
    }, []);

    return {
        budgets,
        isLoading,
        error,
        fetchBudgets,
        getBudgetsWithStatus,
        createBudget,
        updateBudget,
        deleteBudget,
        getBudgetAlerts,
        setBudgets,
    };
};
