import Cookies from "js-cookie";

/**
 * Base API client configuration
 */
const BASE_URL = import.meta.env.VITE_BASE_URL;

/**
 * Get authorization headers
 */
const getAuthHeaders = () => {
    const token = Cookies.get("token");
    return {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
    };
};

/**
 * API Client - Centralized fetch wrapper
 */
class ApiClient {
    /**
     * Make a GET request
     */
    async get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: "GET" });
    }

    /**
     * Make a POST request
     */
    async post(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    /**
     * Make a PUT request
     */
    async put(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: "PUT",
            body: JSON.stringify(data),
        });
    }

    /**
     * Make a DELETE request
     */
    async delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: "DELETE" });
    }

    /**
     * Make a PATCH request
     */
    async patch(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: "PATCH",
            body: JSON.stringify(data),
        });
    }

    /**
     * Core request method
     */
    async request(endpoint, options = {}) {
        const url = `${BASE_URL}${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...getAuthHeaders(),
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);

            // Handle different response types
            const contentType = response.headers.get("content-type");

            // For blob responses (file downloads)
            if (contentType && contentType.includes("application/octet-stream")) {
                return response.blob();
            }

            // For JSON responses
            if (contentType && contentType.includes("application/json")) {
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Request failed");
                }

                return data;
            }

            // For other responses
            if (!response.ok) {
                throw new Error("Request failed");
            }

            return response;
        } catch (error) {
            console.error("API Error:", error);
            throw error;
        }
    }
}

// Export singleton instance
export default new ApiClient();
