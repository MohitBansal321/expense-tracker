/**
 * Standardized response utilities
 * Provides consistent response formatting across all endpoints
 */

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {String} message - Success message
 * @param {Number} statusCode - HTTP status code (default: 200)
 */
export const sendSuccess = (res, data = null, message = "Success", statusCode = 200) => {
    const response = {
        success: true,
        message,
    };

    if (data !== null) {
        response.data = data;
    }

    return res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {Number} statusCode - HTTP status code (default: 500)
 * @param {*} error - Error details (optional, only in development)
 */
export const sendError = (res, message = "Internal server error", statusCode = 500, error = null) => {
    const response = {
        success: false,
        message,
    };

    // Include error details only in development mode
    if (process.env.NODE_ENV === "development" && error) {
        response.error = error;
    }

    return res.status(statusCode).json(response);
};

/**
 * Send created response
 * @param {Object} res - Express response object
 * @param {*} data - Created resource data
 * @param {String} message - Success message
 */
export const sendCreated = (res, data, message = "Resource created successfully") => {
    return sendSuccess(res, data, message, 201);
};

/**
 * Send not found response
 * @param {Object} res - Express response object
 * @param {String} message - Not found message
 */
export const sendNotFound = (res, message = "Resource not found") => {
    return sendError(res, message, 404);
};

/**
 * Send unauthorized response
 * @param {Object} res - Express response object
 * @param {String} message - Unauthorized message
 */
export const sendUnauthorized = (res, message = "Unauthorized access") => {
    return sendError(res, message, 401);
};

/**
 * Send validation error response
 * @param {Object} res - Express response object
 * @param {String} message - Validation error message
 * @param {*} errors - Validation errors details
 */
export const sendValidationError = (res, message = "Validation error", errors = null) => {
    const response = {
        success: false,
        message,
    };

    if (errors) {
        response.errors = errors;
    }

    return res.status(400).json(response);
};
