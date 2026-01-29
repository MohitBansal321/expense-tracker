// Import necessary libraries and modules
import bodyParser from "body-parser";
import cors from "cors";
import * as dotenv from "dotenv";
import express from "express";
import passport from "passport";
import path from "path";

// Import configurations and middleware
import passportConfig from "./src/config/passport.js";
import connect from "./src/config/database.js";
import routes from "./src/routes/index.js";
import { errorHandler, notFoundHandler } from "./src/middleware/error.middleware.js";

// Load environment variables from a .env file
dotenv.config();

// Set the server's port, defaulting to 4000 if not specified in the environment
const PORT = process.env.PORT || 4000;

// Create an Express application
const app = express();

// Middleware: Enable CORS for cross-origin requests
app.use(cors());

// Middleware: Parse incoming JSON requests
app.use(bodyParser.json());

// Middleware: Initialize Passport for authentication
app.use(passport.initialize());
passportConfig(passport);

// Use the defined routes for routing
app.use("/", routes);

// Deployment configuration
const __dirname1 = path.resolve();
if (process.env.NODE_ENV === "production") {
  // Serve static files from the 'client/build' directory
  app.use(express.static(path.join(__dirname1, "./client/build")));

  // Handle all other routes by serving the 'index.html' file
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "./client", "build", "index.html"))
  );
} else {
  // In development mode, respond with a simple message for the root route
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Connect to the MongoDB database
await connect();

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
});
