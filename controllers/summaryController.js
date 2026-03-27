const Transaction = require('../models/Transaction');

// @desc    Get financial summary (total income, expense, balance)
// @route   GET /api/v1/transactions/summary/financial
// @access  Public
const getFinancialSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
    }

    // If date filter exists, add it to the query
    const query = Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {};

    // Aggregate income and expense totals
    const summary = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Extract income and expense from aggregation result
    const incomeData = summary.find((item) => item._id === 'income') || { total: 0, count: 0 };
    const expenseData = summary.find((item) => item._id === 'expense') || { total: 0, count: 0 };

    const totalIncome = incomeData.total;
    const totalExpense = expenseData.total;
    const balance = totalIncome - totalExpense;

    res.status(200).json({
      success: true,
      message: 'Financial summary calculated successfully',
      data: {
        totalIncome,
        totalExpense,
        balance,
        transactionCounts: {
          income: incomeData.count,
          expense: expenseData.count,
        },
        period: {
          startDate: startDate || null,
          endDate: endDate || null,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get balance overview with percentages
// @route   GET /api/v1/transactions/summary/overview
// @access  Public
const getBalanceOverview = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
    }

    const query = Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {};

    const summary = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    const incomeData = summary.find((item) => item._id === 'income') || { total: 0 };
    const expenseData = summary.find((item) => item._id === 'expense') || { total: 0 };

    const totalIncome = incomeData.total;
    const totalExpense = expenseData.total;
    const balance = totalIncome - totalExpense;

    // Calculate percentages
    const totalFlow = totalIncome + totalExpense;
    const incomePercentage = totalFlow > 0 ? ((totalIncome / totalFlow) * 100).toFixed(2) : 0;
    const expensePercentage = totalFlow > 0 ? ((totalExpense / totalFlow) * 100).toFixed(2) : 0;

    // Determine financial health
    let financialHealth = 'stable';
    if (balance > 0) {
      financialHealth = 'positive';
    } else if (balance < 0) {
      financialHealth = 'negative';
    }

    res.status(200).json({
      success: true,
      message: 'Balance overview calculated successfully',
      data: {
        totalIncome,
        totalExpense,
        balance,
        percentages: {
          income: parseFloat(incomePercentage),
          expense: parseFloat(expensePercentage),
        },
        financialHealth,
        period: {
          startDate: startDate || null,
          endDate: endDate || null,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFinancialSummary,
  getBalanceOverview,
};
