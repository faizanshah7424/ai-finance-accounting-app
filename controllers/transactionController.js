const Transaction = require('../models/Transaction');
const axios = require('axios');

// FastAPI Analysis Service URL
const ANALYSIS_API_URL = process.env.ANALYSIS_API_URL || 'http://127.0.0.1:8000';

/**
 * Call FastAPI AI service to analyze transaction
 * @param {string} description - Transaction description
 * @param {number} amount - Transaction amount
 * @returns {Promise<Object>} AI analysis result
 */
const analyzeTransaction = async (description, amount) => {
  try {
    console.log('🤖 Calling AI service:', `${ANALYSIS_API_URL}/analyze`);
    console.log('📝 Data:', { description, amount });
    
    const response = await axios.post(`${ANALYSIS_API_URL}/analyze`, {
      description,
      amount,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    });

    console.log('✅ AI Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ AI Analysis Service Error:', error.message);
    console.error('Response:', error.response?.data);
    
    // Return default values if AI service is unavailable
    return {
      predicted_category: {
        category: 'Uncategorized',
        confidence: 0,
        matched_keywords: [],
      },
      anomaly: {
        is_anomaly: false,
        reason: 'AI service unavailable - ' + error.message,
        severity: 'low',
      },
    };
  }
};

// @desc    Add new transaction with AI analysis
// @route   POST /api/transactions
// @access  Public
const addTransaction = async (req, res, next) => {
  try {
    const { description, amount, date, type, accountId } = req.body;

    // Validate required fields
    if (!description || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Description and amount are required',
      });
    }

    // Call AI service to analyze transaction
    const analysisResult = await analyzeTransaction(description, parseFloat(amount));

    // Extract AI analysis data
    const predictedCategory = analysisResult.predicted_category?.category || 'Uncategorized';
    const confidence = analysisResult.predicted_category?.confidence || 0;
    const isAnomaly = analysisResult.anomaly?.is_anomaly || false;
    const anomalySeverity = analysisResult.anomaly?.severity || 'low';

    // Prepare transaction data with AI-enriched fields
    const transactionData = {
      description: description.trim(),
      amount: parseFloat(amount),
      date: date || new Date(),
      type: type || 'expense',
      category: predictedCategory,
      accountId: accountId || null,
      metadata: {
        analysisConfidence: confidence,
        matchedKeywords: analysisResult.predicted_category?.matched_keywords || [],
        isAnomaly: isAnomaly,
        anomalyReason: analysisResult.anomaly?.reason || '',
        anomalySeverity: anomalySeverity,
        analyzedAt: new Date().toISOString(),
      },
    };

    // Create transaction
    const transaction = await Transaction.create(transactionData);

    // Populate account if exists
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('accountId', 'accountName accountNumber');

    return res.status(201).json({
      success: true,
      message: 'Transaction added successfully with AI analysis',
      data: populatedTransaction,
      analysis: {
        predictedCategory,
        confidence,
        isAnomaly,
        anomalySeverity,
      },
    });
  } catch (error) {
    console.error('Add Transaction Error:', error);
    next(error);
  }
};

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Public
const getTransactions = async (req, res, next) => {
  try {
    const { type, category, startDate, endDate, page = 1, limit = 20, sort = 'date' } = req.query;

    const query = {};

    if (type) query.type = type;
    if (category) query.category = { $regex: category, $options: 'i' };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sort]: -1 },
    };

    const transactions = await Transaction.find(query)
      .populate('accountId', 'accountName accountNumber')
      .sort(options.sort)
      .limit(options.limit)
      .skip((options.page - 1) * options.limit);

    const total = await Transaction.countDocuments(query);

    // Calculate totals for income and expense
    const incomeTotal = await Transaction.getTotalByType('income', startDate, endDate);
    const expenseTotal = await Transaction.getTotalByType('expense', startDate, endDate);

    return res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      page: options.page,
      pages: Math.ceil(total / options.limit),
      summary: {
        incomeTotal,
        expenseTotal,
        netTotal: incomeTotal - expenseTotal,
      },
      data: transactions,
    });
  } catch (error) {
    console.error('Get Transactions Error:', error);
    next(error);
  }
};

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Public
const getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('accountId', 'accountName accountNumber');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: `Transaction not found with id: ${req.params.id}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error('Get Transaction Error:', error);
    next(error);
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Public
const updateTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: `Transaction not found with id: ${req.params.id}`,
      });
    }

    // Check if transaction can be modified (within 30 days)
    if (!transaction.canBeModified()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify transactions older than 30 days',
      });
    }

    // If description or amount is being updated, re-analyze with AI
    if (req.body.description || req.body.amount) {
      const description = req.body.description || transaction.description;
      const amount = req.body.amount || transaction.amount;

      const analysisResult = await analyzeTransaction(description, parseFloat(amount));

      req.body.category = analysisResult.predicted_category?.category || transaction.category;
      req.body.metadata = {
        ...transaction.metadata,
        analysisConfidence: analysisResult.predicted_category?.confidence || 0,
        matchedKeywords: analysisResult.predicted_category?.matched_keywords || [],
        isAnomaly: analysisResult.anomaly?.is_anomaly || false,
        anomalyReason: analysisResult.anomaly?.reason || '',
        anomalySeverity: analysisResult.anomaly?.severity || 'low',
        analyzedAt: new Date().toISOString(),
      };
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate('accountId', 'accountName accountNumber');

    return res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      data: updatedTransaction,
    });
  } catch (error) {
    console.error('Update Transaction Error:', error);
    next(error);
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Public
const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: `Transaction not found with id: ${req.params.id}`,
      });
    }

    // Check if transaction can be modified (within 30 days)
    if (!transaction.canBeModified()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete transactions older than 30 days',
      });
    }

    await transaction.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
      data: {},
    });
  } catch (error) {
    console.error('Delete Transaction Error:', error);
    next(error);
  }
};

// @desc    Get transactions by category
// @route   GET /api/transactions/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const { type } = req.query;

    const query = type ? { type } : {};

    const categories = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error('Get Categories Error:', error);
    next(error);
  }
};

module.exports = {
  addTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  getCategories,
};
