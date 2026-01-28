// Import Mongoose library
import mongoose from "mongoose";

// Extract the 'Schema' class from Mongoose
const { Schema } = mongoose;

// Define the budget schema using the Schema class
const budgetSchema = new Schema({
    // Reference to the user who created the budget
    user_id: {
        type: mongoose.Types.ObjectId,
        required: true,
        index: true
    },
    // Reference to the category for this budget
    category_id: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    // Budget amount limit
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    // Budget period type
    period: {
        type: String,
        enum: ["monthly", "weekly", "yearly"],
        default: "monthly"
    },
    // Alert threshold percentage (notify when spending reaches this %)
    alertThreshold: {
        type: Number,
        default: 80,
        min: 0,
        max: 100
    },
    // Whether the budget is active
    isActive: {
        type: Boolean,
        default: true
    },
    // Start date for the budget
    startDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound index for efficient queries
budgetSchema.index({ user_id: 1, category_id: 1 }, { unique: true });

// Create and export the 'Budget' model using the defined schema
export default mongoose.model("Budget", budgetSchema);
