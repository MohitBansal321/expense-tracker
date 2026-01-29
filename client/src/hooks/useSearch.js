import { useState, useCallback, useEffect, useRef } from "react";

/**
 * Custom hook for search functionality with debouncing
 * @param {Function} searchFunction - Function to execute for search
 * @param {number} delay - Debounce delay in milliseconds
 * @returns {Object} Search state and methods
 */
export const useSearch = (searchFunction, delay = 500) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [error, setError] = useState(null);
    const debounceTimer = useRef(null);

    /**
     * Execute search with current query
     */
    const executeSearch = useCallback(async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        setError(null);

        try {
            const results = await searchFunction(query);
            setSearchResults(results);
            setIsSearching(false);
        } catch (err) {
            setError(err.message);
            setIsSearching(false);
            setSearchResults([]);
        }
    }, [searchFunction]);

    /**
     * Handle search query change with debouncing
     */
    const handleSearchChange = useCallback((query) => {
        setSearchQuery(query);

        // Clear previous timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // Set new timer
        debounceTimer.current = setTimeout(() => {
            executeSearch(query);
        }, delay);
    }, [delay, executeSearch]);

    /**
     * Clear search
     */
    const clearSearch = useCallback(() => {
        setSearchQuery("");
        setSearchResults([]);
        setError(null);

        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
    }, []);

    /**
     * Immediate search (no debounce)
     */
    const searchNow = useCallback(() => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        executeSearch(searchQuery);
    }, [executeSearch, searchQuery]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, []);

    return {
        searchQuery,
        isSearching,
        searchResults,
        error,
        handleSearchChange,
        clearSearch,
        searchNow,
        setSearchQuery,
    };
};
