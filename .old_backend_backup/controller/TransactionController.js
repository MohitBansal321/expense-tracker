import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
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
    { $sort: { "_id.year": -1, "_id.month": -1 } }, // Sort the results by month
  ]);

  // Respond with the aggregated transaction data in JSON format
  res.json({ data: demo });
};

export const filter = async (req, res) => {

  let category_id = mongoose.Types.ObjectId(req.params.id);

  // Use the aggregation framework to query the database
  const demo = await Transaction.aggregate([
    {
      // Match transactions belonging to the authenticated user and category id
      $match: { user_id: req.user._id, category_id: category_id },

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
    { $sort: { "_id.year": -1, "_id.month": -1 } }, // Sort the results by month
  ]);

  // Respond with the aggregated transaction data in JSON format
  res.json({ data: demo });
};

// Controller function for searching transactions
export const search = async (req, res) => {
  try {
    const { query, startDate, endDate, type, minAmount, maxAmount } = req.query;
    const userId = req.user._id;

    // Build match conditions
    const matchConditions = { user_id: userId };

    // Search by description
    if (query) {
      matchConditions.description = { $regex: query, $options: "i" };
    }

    // Filter by date range
    if (startDate || endDate) {
      matchConditions.date = {};
      if (startDate) {
        matchConditions.date.$gte = new Date(startDate);
      }
      if (endDate) {
        matchConditions.date.$lte = new Date(endDate);
      }
    }

    // Filter by category
    if (req.query.category_id) {
      matchConditions.category_id = mongoose.Types.ObjectId(req.query.category_id);
    }

    // Filter by type
    if (type && ["income", "expense"].includes(type)) {
      matchConditions.type = type;
    }

    // Filter by amount range
    if (minAmount || maxAmount) {
      matchConditions.amount = {};
      if (minAmount) {
        matchConditions.amount.$gte = parseFloat(minAmount);
      }
      if (maxAmount) {
        matchConditions.amount.$lte = parseFloat(maxAmount);
      }
    }

    const transactions = await Transaction.find(matchConditions)
      .sort({ date: -1 })
      .limit(100);

    res.json({ success: true, data: transactions });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ success: false, message: "Search failed" });
  }
};

// Controller function for exporting transactions as CSV
export const exportCSV = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user._id;

    // Build match conditions
    const matchConditions = { user_id: userId };

    if (startDate || endDate) {
      matchConditions.date = {};
      if (startDate) {
        matchConditions.date.$gte = new Date(startDate);
      }
      if (endDate) {
        matchConditions.date.$lte = new Date(endDate);
      }
    }

    // Get transactions
    const transactions = await Transaction.find(matchConditions).sort({ date: -1 });

    // Get user categories for mapping
    const user = await User.findById(userId);
    const categoryMap = {};
    user.categories.forEach(cat => {
      categoryMap[cat._id.toString()] = cat.label;
    });

    // Build CSV content
    const headers = ["Date", "Type", "Description", "Category", "Amount"];
    const rows = transactions.map(tx => {
      const date = new Date(tx.date).toLocaleDateString();
      const type = tx.type || "expense";
      const description = `"${(tx.description || "").replace(/"/g, '""')}"`;
      const category = categoryMap[tx.category_id?.toString()] || "Uncategorized";
      const amount = tx.amount || 0;
      return [date, type, description, category, amount].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    // Set headers for CSV download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=transactions_${Date.now()}.csv`);
    res.send(csvContent);
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ success: false, message: "Export failed" });
  }
};

// Controller function for creating a new transaction
export const create = async (req, res) => {
  // Extract transaction details from the request body
  const { amount, description, date, category_id, type } = req.body;

  // Create a new Transaction instance with the provided data
  const transaction = new Transaction({
    amount,
    description,
    date,
    user_id: req.user._id, // Set the user_id based on the authenticated user
    category_id,
    type: type || "expense", // Default to expense if not provided
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

// Controller function for finding duplicate transactions
export const findDuplicates = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all transactions for the user
    const transactions = await Transaction.find({ user_id: userId })
      .sort({ date: -1 })
      .limit(500);

    const duplicates = [];
    const seen = new Map();

    for (const tx of transactions) {
      // Create a key based on amount and approximate date (within 3 days)
      const dateKey = new Date(tx.date);
      dateKey.setHours(0, 0, 0, 0);

      // Check for similar transactions
      for (const [key, existingTx] of seen) {
        const [existingAmount, existingDate, existingDesc] = key.split('|');
        const daysDiff = Math.abs(dateKey - new Date(existingDate)) / (1000 * 60 * 60 * 24);

        // Same amount, within 3 days, and similar description
        if (
          Math.abs(tx.amount - parseFloat(existingAmount)) < 0.01 &&
          daysDiff <= 3 &&
          tx._id.toString() !== existingTx._id.toString()
        ) {
          // Check description similarity
          const descSimilarity = calculateSimilarity(
            tx.description?.toLowerCase() || '',
            existingTx.description?.toLowerCase() || ''
          );

          if (descSimilarity > 0.6 || tx.amount === parseFloat(existingAmount)) {
            duplicates.push({
              original: existingTx,
              duplicate: tx,
              similarity: descSimilarity,
              daysDiff: Math.round(daysDiff)
            });
          }
        }
      }

      const key = `${tx.amount}|${dateKey.toISOString()}|${tx.description}`;
      seen.set(key, tx);
    }

    res.json({ success: true, duplicates, count: duplicates.length });
  } catch (error) {
    console.error("Find duplicates error:", error);
    res.status(500).json({ success: false, message: "Failed to find duplicates" });
  }
};

// Controller function for checking if a new transaction is a potential duplicate
export const checkDuplicate = async (req, res) => {
  try {
    const { amount, description, date } = req.body;
    const userId = req.user._id;

    const targetDate = new Date(date);
    const startDate = new Date(targetDate);
    startDate.setDate(startDate.getDate() - 3);
    const endDate = new Date(targetDate);
    endDate.setDate(endDate.getDate() + 3);

    // Find similar transactions
    const similar = await Transaction.find({
      user_id: userId,
      amount: { $gte: amount * 0.99, $lte: amount * 1.01 },
      date: { $gte: startDate, $lte: endDate }
    }).limit(5);

    const matches = similar.filter(tx => {
      const similarity = calculateSimilarity(
        description?.toLowerCase() || '',
        tx.description?.toLowerCase() || ''
      );
      return similarity > 0.5;
    });

    res.json({
      success: true,
      isDuplicate: matches.length > 0,
      matches: matches.map(m => ({
        _id: m._id,
        amount: m.amount,
        description: m.description,
        date: m.date
      }))
    });
  } catch (error) {
    console.error("Check duplicate error:", error);
    res.status(500).json({ success: false, message: "Failed to check duplicate" });
  }
};

// Helper function to calculate string similarity (Dice coefficient)
function calculateSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  if (str1 === str2) return 1;

  const bigrams1 = new Set();
  const bigrams2 = new Set();

  for (let i = 0; i < str1.length - 1; i++) {
    bigrams1.add(str1.substring(i, i + 2));
  }
  for (let i = 0; i < str2.length - 1; i++) {
    bigrams2.add(str2.substring(i, i + 2));
  }

  let intersection = 0;
  for (const bigram of bigrams1) {
    if (bigrams2.has(bigram)) intersection++;
  }

  return (2 * intersection) / (bigrams1.size + bigrams2.size);
}

// AI Auto-categorization: Suggest category based on past transactions
export const suggestCategory = async (req, res) => {
  try {
    const { description } = req.body;
    const userId = req.user._id;

    if (!description || description.trim().length < 2) {
      return res.json({ success: true, suggestion: null, confidence: 0 });
    }

    const descLower = description.toLowerCase().trim();

    // Get user's past transactions with categories
    const pastTransactions = await Transaction.find({
      user_id: userId,
      description: { $exists: true, $ne: "" }
    })
      .select("description category_id")
      .limit(500);

    // Build category frequency map based on similar descriptions
    const categoryScores = new Map();

    for (const tx of pastTransactions) {
      if (!tx.description || !tx.category_id) continue;

      const txDescLower = tx.description.toLowerCase();
      const similarity = calculateSimilarity(descLower, txDescLower);

      // Also check for keyword matching
      const words = descLower.split(/\s+/);
      const txWords = txDescLower.split(/\s+/);
      let keywordMatch = 0;
      for (const word of words) {
        if (word.length > 2 && txWords.some(tw => tw.includes(word) || word.includes(tw))) {
          keywordMatch += 0.3;
        }
      }

      const totalScore = Math.min(similarity + keywordMatch, 1);

      if (totalScore > 0.3) {
        const catId = tx.category_id.toString();
        const existing = categoryScores.get(catId) || { score: 0, count: 0 };
        categoryScores.set(catId, {
          score: existing.score + totalScore,
          count: existing.count + 1,
          category_id: tx.category_id
        });
      }
    }

    // Find best matching category
    let bestMatch = null;
    let bestScore = 0;

    for (const [catId, data] of categoryScores) {
      const avgScore = data.score / data.count;
      const confidenceBoost = Math.min(data.count * 0.1, 0.3); // More occurrences = higher confidence
      const finalScore = avgScore + confidenceBoost;

      if (finalScore > bestScore) {
        bestScore = finalScore;
        bestMatch = {
          category_id: data.category_id,
          confidence: Math.min(finalScore, 1),
          matchCount: data.count
        };
      }
    }

    res.json({
      success: true,
      suggestion: bestMatch?.category_id || null,
      confidence: bestMatch?.confidence || 0,
      matchCount: bestMatch?.matchCount || 0
    });
  } catch (error) {
    console.error("Suggest category error:", error);
    res.status(500).json({ success: false, message: "Failed to suggest category" });
  }
};

// Get category patterns for a user (for analytics)
export const getCategoryPatterns = async (req, res) => {
  try {
    const userId = req.user._id;

    // Aggregate transactions to find common keywords per category
    const patterns = await Transaction.aggregate([
      { $match: { user_id: userId, description: { $exists: true, $ne: "" } } },
      {
        $group: {
          _id: "$category_id",
          descriptions: { $push: "$description" },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Extract common keywords per category
    const categoryPatterns = patterns.map(p => {
      const allWords = p.descriptions
        .join(" ")
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 3);

      // Count word frequency
      const wordCount = {};
      for (const word of allWords) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }

      // Get top keywords
      const topKeywords = Object.entries(wordCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([word]) => word);

      return {
        category_id: p._id,
        transactionCount: p.count,
        topKeywords
      };
    });

    res.json({ success: true, patterns: categoryPatterns });
  } catch (error) {
    console.error("Get patterns error:", error);
    res.status(500).json({ success: false, message: "Failed to get patterns" });
  }
};
