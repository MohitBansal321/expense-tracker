import passport from "passport";
import { AppError } from "./error.middleware.js";

/**
 * Authentication middleware using JWT
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const authenticate = (req, res, next) => {
    passport.authenticate("jwt", { session: false }, (err, user, info) => {
        if (err) {
            return next(err);
        }

        if (!user) {
            return next(new AppError("Unauthorized access", 401));
        }

        req.user = user;
        next();
    })(req, res, next);
};

export default authenticate;
