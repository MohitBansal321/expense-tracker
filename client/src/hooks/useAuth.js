import { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";
import * as authService from "../services/auth.service.js";
import { setUser } from "../store/auth.js";

/**
 * Custom hook for authentication operations
 * @returns {Object} Auth state and methods
 */
export const useAuth = () => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Fetch current user
     */
    const fetchUser = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        const token = Cookies.get("token");
        if (!token) {
            setIsLoading(false);
            return null;
        }

        try {
            const userData = await authService.getCurrentUser();
            dispatch(setUser(userData));
            setIsLoading(false);
            return userData;
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
            return null;
        }
    }, [dispatch]);

    /**
     * Login user
     */
    const login = useCallback(async (credentials) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await authService.login(credentials);

            if (response.data?.token) {
                Cookies.set("token", response.data.token);
                dispatch(setUser(response.data.user));
            }

            setIsLoading(false);
            return response;
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
            throw err;
        }
    }, [dispatch]);

    /**
     * Register new user
     */
    const register = useCallback(async (userData) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await authService.register(userData);

            if (response.data?.token) {
                Cookies.set("token", response.data.token);
                dispatch(setUser(response.data.user));
            }

            setIsLoading(false);
            return response;
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
            throw err;
        }
    }, [dispatch]);

    /**
     * Logout user
     */
    const logout = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            await authService.logout();
            Cookies.remove("token");
            dispatch(setUser(null));
            setIsLoading(false);
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
            // Still remove token even if API call fails
            Cookies.remove("token");
            dispatch(setUser(null));
        }
    }, [dispatch]);

    /**
     * Update user profile
     */
    const updateProfile = useCallback(async (data) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await authService.updateProfile(data);
            dispatch(setUser(response.data));
            setIsLoading(false);
            return response;
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
            throw err;
        }
    }, [dispatch]);

    /**
     * Check if user is authenticated
     */
    const isAuthenticated = useCallback(() => {
        return !!Cookies.get("token") && !!user;
    }, [user]);

    return {
        user,
        isLoading,
        error,
        fetchUser,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated,
    };
};
