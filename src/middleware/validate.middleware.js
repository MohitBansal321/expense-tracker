/**
 * Validation middleware
 * Generic middleware for validating request data against schemas
 */

/**
 * Validate request data
 * @param {Function} schema - Validation schema function
 * @returns {Function} Express middleware
 */
export const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema(req.body);

        if (error) {
            const errors = error.details.map((detail) => detail.message);
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors,
            });
        }

        // Replace req.body with validated and sanitized data
        req.body = value;
        next();
    };
};

export default validate;
