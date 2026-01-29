/**
 * Centralized error handling middleware
 */

/**
 * Custom error class
 */
export class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal server error";

    // Log error for debugging
    console.error("Error:", {
        message: err.message,
        stack: err.stack,
        statusCode,
        path: req.path,
        method: req.method,
    });

    // Mongoose validation error
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = "Validation error";
        const errors = Object.values(err.errors).map((e) => e.message);

        return res.status(statusCode).json({
            success: false,
            message,
            errors,
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        statusCode = 409;
        message = "Duplicate resource";
        const field = Object.keys(err.keyValue)[0];

        return res.status(statusCode).json({
            success: false,
            message: `${field} already exists`,
        });
    }

    // Mongoose cast error (invalid ObjectId)
    if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid resource ID";
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token";
    }

    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Token expired";
    }

    // Send error response
    const response = {
        success: false,
        message,
    };

    // Include stack trace in development
    if (process.env.NODE_ENV === "development") {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};

/**
 * 404 Not Found handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
    });
};
