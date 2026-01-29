import bcrypt from "bcrypt";
import User from "../../models/User.js";
import { DEFAULT_CATEGORIES, ERROR_MESSAGES } from "../constants/index.js";
import { generateToken, createUserPayload } from "../utils/jwt.util.js";
import { AppError } from "../middleware/error.middleware.js";

/**
 * Authentication Service
 * Handles user registration and login logic
 */

class AuthService {
    /**
     * Register a new user
     * @param {Object} userData - User registration data
     * @param {String} userData.email - User email
     * @param {String} userData.password - User password
     * @param {String} userData.firstName - User first name
     * @param {String} userData.lastName - User last name
     * @returns {Object} Success message
     */
    async register({ email, password, firstName, lastName }) {
        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            throw new AppError(ERROR_MESSAGES.USER_ALREADY_EXISTS, 406);
        }

        // Hash password
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user with default categories
        const user = new User({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            categories: DEFAULT_CATEGORIES,
        });

        await user.save();

        return {
            message: ERROR_MESSAGES.USER_CREATED,
        };
    }

    /**
     * Login user
     * @param {Object} credentials - Login credentials
     * @param {String} credentials.email - User email
     * @param {String} credentials.password - User password
     * @returns {Object} Token and user data
     */
    async login({ email, password }) {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            throw new AppError(ERROR_MESSAGES.CREDENTIALS_NOT_FOUND, 401);
        }

        // Verify password
        const matched = await bcrypt.compare(password, user.password);
        if (!matched) {
            throw new AppError(ERROR_MESSAGES.CREDENTIALS_NOT_FOUND, 401);
        }

        // Generate JWT token
        const payload = createUserPayload(user);
        const token = generateToken(payload);

        return {
            message: ERROR_MESSAGES.LOGIN_SUCCESS,
            token,
            user: {
                _id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                categories: user.categories,
            },
        };
    }
}

export default new AuthService();
