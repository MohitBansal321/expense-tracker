import jwt from "jsonwebtoken";

/**
 * JWT utility functions for token generation and verification
 */

/**
 * Generate JWT token
 * @param {Object} payload - Token payload
 * @param {String} expiresIn - Token expiration time (default: 1h)
 * @returns {String} JWT token
 */
export const generateToken = (payload, expiresIn = "1h") => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }

    return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Verify JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid
 */
export const verifyToken = (token) => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }

    try {
        return jwt.verify(token, secret);
    } catch (error) {
        throw new Error("Invalid or expired token");
    }
};

/**
 * Create user payload for JWT
 * @param {Object} user - User object
 * @returns {Object} JWT payload
 */
export const createUserPayload = (user) => {
    return {
        _id: user._id,
        username: user.email,
    };
};
