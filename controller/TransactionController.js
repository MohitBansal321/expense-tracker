import Transaction from "../models/Transaction.js";
import mongoose from "mongoose";
// Controller function for retrieving transactions
export const index = async (req, res) => {
  // Use the aggregation framework to query the database
  const demo = await Transaction.aggregate([
    {
      // Match transactions belonging to the authenticated user
      $match: { user_id: req.user._id },
    },
    {
      // Group transactions by month
      $group: {
        _id: { 
          year: { $year: "$date" },  
          month: { $month: "$date" } 
        }, // Group by year,month extracted from the 'date' field
        transactions: {
          $push: {
            amount: "$amount",
            description: "$description",
            date: "$date",
            type: "$type",
            _id: "$_id",
            category_id: "$category_id",
          },
        },
        totalExpenses: { $sum: "$amount" }, // Calculate the total expenses for each month
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 }  }, // Sort the results by month
  ]);

  // Respond with the aggregated transaction data in JSON format
  res.json({ data: demo });
};
export const filter = async (req, res) => {

  let category_id=mongoose.Types.ObjectId(req.params.id);

  // Use the aggregation framework to query the database
  const demo = await Transaction.aggregate([
    {
      // Match transactions belonging to the authenticated user and category id
      $match:{ user_id: req.user._id, category_id: category_id },

    },
    {
      // Group transactions by month
      $group: {
        _id: { 
          year: { $year: "$date" },  
          month: { $month: "$date" } 
        }, // Group by year,month extracted from the 'date' field
        transactions: {
          $push: {
            amount: "$amount",
            description: "$description",
            date: "$date",
            type: "$type",
            _id: "$_id",
            category_id: "$category_id",
          },
        },
        totalExpenses: { $sum: "$amount" }, // Calculate the total expenses for each month
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 }  }, // Sort the results by month
  ]);

  // Respond with the aggregated transaction data in JSON format
  res.json({ data: demo });
};

// Controller function for creating a new transaction
export const create = async (req, res) => {
  // Extract transaction details from the request body
  const { amount, description, date, category_id } = req.body;

  // Create a new Transaction instance with the provided data
  const transaction = new Transaction({
    amount,
    description,
    date,
    user_id: req.user._id, // Set the user_id based on the authenticated user
    category_id,
  });

  // Save the new transaction to the database
  await transaction.save();

  // Respond with a success message in JSON format
  res.json({ message: "Success" });
};

// Controller function for deleting a transaction
export const destroy = async (req, res) => {
  // Delete a transaction by its unique identifier (_id)
  await Transaction.deleteOne({ _id: req.params.id });

  // Delete a transaction by its unique identifier (_id)
  res.json({ message: "success" });
};

// Controller function for updating a transaction
export const update = async (req, res) => {
  // Update a transaction by its unique identifier (_id)
  await Transaction.updateOne({ _id: req.params.id }, { $set: req.body });

  // Update a transaction by its unique identifier (_id)
  res.json({ message: "success" });
};
