/**
 * Async handler middleware
 * Wraps async route handlers to catch errors automatically
 */

/**
 * Async handler wrapper
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

export default asyncHandler;
