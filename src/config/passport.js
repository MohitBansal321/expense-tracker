// Import necessary modules and libraries
import * as dotenv from "dotenv";
import pkg from "passport-jwt";
import User from "../models/User.js";

// Extract JWT components from 'passport-jwt' package
const JwtStrategy = pkg.Strategy;
const ExtractJwt = pkg.ExtractJwt;

// Load environment variables from a .env file
dotenv.config();

// Create options for the JWT strategy
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract JWT from Authorization header
  secretOrKey: process.env.JWT_SECRET, // Use the JWT secret from environment variables
};

// Configure Passport to use JWT strategy with async/await
export default (passport) => {
  passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
      try {
        // Find a user in the database by their ID contained in the JWT payload
        const user = await User.findById(jwt_payload._id);

        if (user) {
          // If a user is found, authentication is successful
          return done(null, user);
        } else {
          // If no user is found, authentication fails
          return done(null, false);
        }
      } catch (err) {
        return done(err, false);
      }
    })
  );
};
