// Import Mongoose library
import mongoose from "mongoose";

// Define an asynchronous function to establish a MongoDB connection
async function connect() {
  // Retrieve MongoDB connection details from environment variables
  const username = process.env.MONGO_DB_USERNAME; // MongoDB username
  const password = process.env.MONGO_DB_PASSWORD; // MongoDB password
  const url = process.env.MONGO_DB_URL; // MongoDB URL

  // Construct the MongoDB connection URI with username and password
  const mongoURI = `mongodb+srv://${username}:${password}@${url}/?retryWrites=true&w=majority`;

  // Attempt to connect to the MongoDB database using Mongoose
  await mongoose.connect(mongoURI);

  // Log a success message if the connection is established
  console.log("MongoDB connection is successful");
}

// Export the 'connect' function for use in your application
export default connect;
