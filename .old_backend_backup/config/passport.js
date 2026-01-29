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
let opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken(); // Extract JWT from Authorization header
opts.secretOrKey = process.env.JWT_SECRET; // Use the JWT secret from environment variables

// Configure Passport to use JWT strategy
export default (passport) => {
  passport.use(
    new JwtStrategy(opts, function (jwt_payload, done) {
      // Find a user in the database by their ID contained in the JWT payload
      User.findById(jwt_payload._id, function (err, user) {
        if (err) {
          return done(err, false);
        }
        if (user) {
          // If a user is found, authentication is successful
          return done(null, user);
        } else {
          // If no user is found, authentication fails
          return done(null, false);
          // Alternatively, you could create a new account here
        }
      });
    })
  );
};
