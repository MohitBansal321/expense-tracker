import { useState, useCallback, useEffect } from "react";
import * as statsService from "../services/stats.service.js";

/**
 * Custom hook for dashboard data
 * @returns {Object} Dashboard state and methods
 */
export const useDashboard = () => {
    const [stats, setStats] = useState(null);
    const [categoryBreakdown, setCategoryBreakdown] = useState([]);
    const [monthlyTrends, setMonthlyTrends] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Fetch all dashboard data
     */
    const fetchDashboardData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const [
                statsResponse,
                breakdownResponse,
                trendsResponse,
                recentResponse,
            ] = await Promise.all([
                statsService.getDashboardStats(),
                statsService.getCategoryBreakdown(),
                statsService.getMonthlyTrends(),
                statsService.getRecentTransactions(),
            ]);

            setStats(statsResponse.data);
            setCategoryBreakdown(breakdownResponse.data || []);
            setMonthlyTrends(trendsResponse.data || []);
            setRecentTransactions(recentResponse.data || []);
            setIsLoading(false);
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    }, []);

    /**
     * Fetch dashboard stats only
     */
    const fetchStats = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await statsService.getDashboardStats();
            setStats(response.data);
            setIsLoading(false);
            return response.data;
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
            return null;
        }
    }, []);

    /**
     * Fetch category breakdown
     */
    const fetchCategoryBreakdown = useCallback(async (params) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await statsService.getCategoryBreakdown(params);
            setCategoryBreakdown(response.data || []);
            setIsLoading(false);
            return response.data;
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
            return [];
        }
    }, []);

    /**
     * Fetch monthly trends
     */
    const fetchMonthlyTrends = useCallback(async (months = 6) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await statsService.getMonthlyTrends(months);
            setMonthlyTrends(response.data || []);
            setIsLoading(false);
            return response.data;
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
            return [];
        }
    }, []);

    /**
     * Fetch recent transactions
     */
    const fetchRecentTransactions = useCallback(async (limit = 5) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await statsService.getRecentTransactions(limit);
            setRecentTransactions(response.data || []);
            setIsLoading(false);
            return response.data;
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
            return [];
        }
    }, []);

    /**
     * Refresh all data
     */
    const refresh = useCallback(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    return {
        stats,
        categoryBreakdown,
        monthlyTrends,
        recentTransactions,
        isLoading,
        error,
        fetchDashboardData,
        fetchStats,
        fetchCategoryBreakdown,
        fetchMonthlyTrends,
        fetchRecentTransactions,
        refresh,
    };
};
