// Import Mongoose library
import mongoose from "mongoose";

// Extract the 'Schema' class from Mongoose
const { Schema } = mongoose;

// Define the recurring transaction schema
const recurringTransactionSchema = new Schema({
    // Reference to the user who created this recurring transaction
    user_id: {
        type: mongoose.Types.ObjectId,
        required: true,
        index: true
    },
    // Transaction amount
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    // Transaction description
    description: {
        type: String,
        required: true
    },
    // Transaction type (income or expense)
    type: {
        type: String,
        enum: ["income", "expense"],
        default: "expense"
    },
    // Reference to the category
    category_id: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    // Recurrence frequency
    frequency: {
        type: String,
        enum: ["daily", "weekly", "biweekly", "monthly", "yearly"],
        required: true
    },
    // Day of week for weekly recurrence (0 = Sunday, 6 = Saturday)
    dayOfWeek: {
        type: Number,
        min: 0,
        max: 6
    },
    // Day of month for monthly recurrence (1-31)
    dayOfMonth: {
        type: Number,
        min: 1,
        max: 31
    },
    // Start date for the recurring transaction
    startDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    // End date (optional) - if not set, recurs indefinitely
    endDate: {
        type: Date
    },
    // Last execution date
    lastExecuted: {
        type: Date
    },
    // Next scheduled execution date
    nextExecution: {
        type: Date,
        required: true
    },
    // Whether the recurring transaction is active
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for efficient queries
recurringTransactionSchema.index({ nextExecution: 1, isActive: 1 });

// Calculate next execution date based on frequency
recurringTransactionSchema.methods.calculateNextExecution = function () {
    const now = new Date();
    let next = this.lastExecuted ? new Date(this.lastExecuted) : new Date(this.startDate);

    switch (this.frequency) {
        case "daily":
            next.setDate(next.getDate() + 1);
            break;
        case "weekly":
            next.setDate(next.getDate() + 7);
            break;
        case "biweekly":
            next.setDate(next.getDate() + 14);
            break;
        case "monthly":
            next.setMonth(next.getMonth() + 1);
            if (this.dayOfMonth) {
                next.setDate(Math.min(this.dayOfMonth, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()));
            }
            break;
        case "yearly":
            next.setFullYear(next.getFullYear() + 1);
            break;
        default:
            next.setMonth(next.getMonth() + 1);
    }

    // Make sure next execution is in the future
    while (next <= now) {
        switch (this.frequency) {
            case "daily":
                next.setDate(next.getDate() + 1);
                break;
            case "weekly":
                next.setDate(next.getDate() + 7);
                break;
            case "biweekly":
                next.setDate(next.getDate() + 14);
                break;
            case "monthly":
                next.setMonth(next.getMonth() + 1);
                break;
            case "yearly":
                next.setFullYear(next.getFullYear() + 1);
                break;
            default:
                next.setMonth(next.getMonth() + 1);
        }
    }

    return next;
};

// Create and export the model
export default mongoose.model("RecurringTransaction", recurringTransactionSchema);
