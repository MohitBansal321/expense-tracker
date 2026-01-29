import User from "../../models/User.js";
import bcrypt from "bcrypt";
import { AppError } from "../middleware/error.middleware.js";

/**
 * User Service
 * Handles user-related business logic
 */

class UserService {
    /**
     * Get user information
     * @param {String} userId - User ID
     * @returns {Object} User data
     */
    async getUserById(userId) {
        const user = await User.findById(userId);

        if (!user) {
            throw new AppError("User not found", 404);
        }

        return user;
    }

    /**
     * Update user profile
     * @param {String} userId - User ID
     * @param {Object} updateData - Update data
     * @returns {Object} Updated user
     */
    async updateUserProfile(userId, updateData) {
        const { firstName, lastName, password } = updateData;

        const updates = {};
        if (firstName) updates.firstName = firstName;
        if (lastName) updates.lastName = lastName;

        if (password) {
            const saltRounds = 10;
            const salt = await bcrypt.genSalt(saltRounds);
            updates.password = await bcrypt.hash(password, salt);
        }

        const user = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true });

        if (!user) {
            throw new AppError("User not found", 404);
        }

        return user;
    }
}

export default new UserService();
