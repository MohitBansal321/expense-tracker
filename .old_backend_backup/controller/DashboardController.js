import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

// Controller function for dashboard analytics
export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Get first and last day of current month
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    // Get first day of previous month for comparison
    const firstDayOfPrevMonth = new Date(currentYear, currentMonth - 1, 1);
    const lastDayOfPrevMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    // Aggregate current month's data
    const currentMonthStats = await Transaction.aggregate([
      {
        $match: {
          user_id: userId,
          date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
        }
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      }
    ]);

    // Aggregate previous month's data for comparison
    const prevMonthStats = await Transaction.aggregate([
      {
        $match: {
          user_id: userId,
          date: { $gte: firstDayOfPrevMonth, $lte: lastDayOfPrevMonth }
        }
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" }
        }
      }
    ]);

    // Get spending by category for current month
    const categorySpending = await Transaction.aggregate([
      {
        $match: {
          user_id: userId,
          type: "expense",
          date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
        }
      },
      {
        $group: {
          _id: "$category_id",
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Get last 6 months trend data
    const sixMonthsAgo = new Date(currentYear, currentMonth - 5, 1);
    const monthlyTrend = await Transaction.aggregate([
      {
        $match: {
          user_id: userId,
          date: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            type: "$type"
          },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Get recent transactions (last 5)
    const recentTransactions = await Transaction.find({ user_id: userId })
      .sort({ date: -1, createdAt: -1 })
      .limit(5);

    // Process current month stats
    let currentIncome = 0;
    let currentExpenses = 0;
    let transactionCount = 0;

    currentMonthStats.forEach(stat => {
      if (stat._id === "income") {
        currentIncome = stat.total;
      } else {
        currentExpenses += stat.total;
      }
      transactionCount += stat.count;
    });

    // Process previous month stats
    let prevIncome = 0;
    let prevExpenses = 0;

    prevMonthStats.forEach(stat => {
      if (stat._id === "income") {
        prevIncome = stat.total;
      } else {
        prevExpenses += stat.total;
      }
    });

    // Calculate changes
    const incomeChange = prevIncome > 0 
      ? ((currentIncome - prevIncome) / prevIncome * 100).toFixed(1)
      : currentIncome > 0 ? 100 : 0;
    
    const expenseChange = prevExpenses > 0 
      ? ((currentExpenses - prevExpenses) / prevExpenses * 100).toFixed(1)
      : currentExpenses > 0 ? 100 : 0;

    // Map category spending with category names
    const user = await User.findById(userId);
    const categoryMap = {};
    user.categories.forEach(cat => {
      categoryMap[cat._id.toString()] = cat.label;
    });

    const categoryBreakdown = categorySpending.map(item => ({
      categoryId: item._id,
      categoryName: categoryMap[item._id?.toString()] || "Uncategorized",
      amount: item.total,
      count: item.count
    }));

    // Process monthly trend for chart
    const trendData = {};
    monthlyTrend.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      if (!trendData[key]) {
        trendData[key] = { year: item._id.year, month: item._id.month, income: 0, expense: 0 };
      }
      if (item._id.type === "income") {
        trendData[key].income = item.total;
      } else {
        trendData[key].expense += item.total;
      }
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalIncome: currentIncome,
          totalExpenses: currentExpenses,
          netSavings: currentIncome - currentExpenses,
          transactionCount,
          incomeChange: parseFloat(incomeChange),
          expenseChange: parseFloat(expenseChange)
        },
        categoryBreakdown,
        monthlyTrend: Object.values(trendData),
        recentTransactions
      }
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch dashboard data" });
  }
};
