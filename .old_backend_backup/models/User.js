// Import Mongoose library
import mongoose from "mongoose";

// Extract the 'Schema' class from Mongoose
const { Schema } = mongoose;

// Define the user schema using the Schema class
const userSchema = new Schema(
  {
    // Define the schema fields for the 'User' model
    firstName: { type: String, required: ["First name field is required"] },
    lastName: { type: String, required: ["Last name field is required"] },
    email: { type: String, required: ["Email field is required"] },
    password: { type: String, required: ["Password field is required"] },
    categories: [{ label: String, icon: String }], // An array of categories with 'label' and 'icon' fields
  },
  { timestamps: true } // Enable timestamps for 'createdAt' and 'updatedAt'
);

// Create and export the 'User' model using the defined schema
export default new mongoose.model("User", userSchema);
