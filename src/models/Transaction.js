// Import Mongoose library
import mongoose from "mongoose";

// Extract the 'Schema' class from Mongoose
const { Schema } = mongoose;

// Define the transaction schema using the Schema class
const transactionSchema = new Schema({
  // Define the schema fields for the 'Transaction' model
  amount: Number, // Transaction amount
  description: String, // Description of the transaction
  type: {
    type: String,
    enum: ["expense", "income", "transfer"], // Transaction type can be 'expense', 'income', or 'transfer'
    default: "expense", // Default type is 'expense'
  },
  user_id: mongoose.Types.ObjectId, // Reference to the user who made the transaction
  category_id: mongoose.Types.ObjectId, // Reference to the category of the transaction
  date: { type: Date, default: new Date() }, // Transaction date, default is the current date
  createdAt: { type: Date, default: Date.now }, // Timestamp for when the transaction was created
});

// Create and export the 'Transaction' model using the defined schema
export default new mongoose.model("Transaction", transactionSchema);
