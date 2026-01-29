import { useState, useCallback } from "react";
import * as transactionService from "../services/transaction.service.js";

/**
 * Custom hook for transaction operations
 * @returns {Object} Transaction state and methods
 */
export const useTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Fetch all transactions
     */
    const fetchTransactions = useCallback(async (categoryFilter = "") => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await transactionService.fetchTransactions(categoryFilter);
            setTransactions(response.data || []);
            setIsLoading(false);
            return response.data;
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
            return [];
        }
    }, []);

    /**
     * Search transactions
     */
    const searchTransactions = useCallback(async (params) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await transactionService.searchTransactions(params);

            // Convert flat list to grouped format for compatibility
            const grouped = {};
            if (response.data) {
                response.data.forEach((tx) => {
                    const date = new Date(tx.date);
                    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
                    if (!grouped[key]) {
                        grouped[key] = {
                            _id: { year: date.getFullYear(), month: date.getMonth() + 1 },
                            transactions: [],
                            totalExpenses: 0,
                        };
                    }
                    grouped[key].transactions.push(tx);
                    grouped[key].totalExpenses += tx.amount || 0;
                });
            }

            const groupedTransactions = Object.values(grouped).sort((a, b) => {
                if (a._id.year !== b._id.year) return b._id.year - a._id.year;
                return b._id.month - a._id.month;
            });

            setTransactions(groupedTransactions);
            setIsLoading(false);
            return groupedTransactions;
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
            return [];
        }
    }, []);

    /**
     * Create new transaction
     */
    const createTransaction = useCallback(async (data) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await transactionService.createTransaction(data);
            setIsLoading(false);
            return response;
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
            throw err;
        }
    }, []);

    /**
     * Update existing transaction
     */
    const updateTransaction = useCallback(async (id, data) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await transactionService.updateTransaction(id, data);
            setIsLoading(false);
            return response;
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
            throw err;
        }
    }, []);

    /**
     * Delete transaction
     */
    const deleteTransaction = useCallback(async (id) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await transactionService.deleteTransaction(id);
            setIsLoading(false);
            return response;
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
            throw err;
        }
    }, []);

    /**
     * Export transactions
     */
    const exportTransactions = useCallback(async (params) => {
        setIsLoading(true);
        setError(null);

        try {
            const blob = await transactionService.exportTransactions(params);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            setIsLoading(false);
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
            throw err;
        }
    }, []);

    return {
        transactions,
        isLoading,
        error,
        fetchTransactions,
        searchTransactions,
        createTransaction,
        updateTransaction,
        deleteTransaction,
        exportTransactions,
        setTransactions,
    };
};
