/**
 * API Request/Response Interceptors
 * Handle common request modifications and response transformations
 */

/**
 * Request interceptor
 * Modify requests before they are sent
 */
export const requestInterceptor = (config) => {
    // Add timestamp to prevent caching
    if (config.method === "GET") {
        const url = new URL(config.url);
        url.searchParams.append("_t", Date.now());
        config.url = url.toString();
    }

    return config;
};

/**
 * Response interceptor
 * Handle responses before they are processed
 */
export const responseInterceptor = (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
        console.log("API Response:", response);
    }

    return response;
};

/**
 * Error interceptor
 * Handle errors globally
 */
export const errorInterceptor = (error) => {
    // Log error in development
    if (import.meta.env.DEV) {
        console.error("API Error:", error);
    }

    // Handle specific error cases
    if (error.response?.status === 401) {
        // Handle unauthorized - could redirect to login
        console.warn("Unauthorized access - please login");
    }

    if (error.response?.status === 403) {
        // Handle forbidden
        console.warn("Forbidden access");
    }

    if (error.response?.status === 500) {
        // Handle server error
        console.error("Server error occurred");
    }

    throw error;
};
