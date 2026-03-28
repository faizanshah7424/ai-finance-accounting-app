const Transaction = require('../models/Transaction');
const axios = require('axios');

// FastAPI Analysis Service URL
const ANALYSIS_API_URL = process.env.ANALYSIS_API_URL || 'http://127.0.0.1:8000';

/**
 * Call FastAPI AI service to analyze transaction
 * @param {string} description - Transaction description
 * @param {number} amount - Transaction amount
 * @param {string|Date} date - Transaction date (ISO string or Date object)
 * @returns {Promise<Object>} AI analysis result
 */
const analyzeTransaction = async (description, amount, date) => {
  const endpoint = `${ANALYSIS_API_URL}/analyze`;
  
  try {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🤖 AI SERVICE CALL');
    console.log('   Endpoint:', endpoint);
    console.log('   Method: POST');
    console.log('   Payload:', JSON.stringify({ description, amount, date }, null, 2));
    console.log('═══════════════════════════════════════════════════════');

    const response = await axios.post(endpoint, {
      description,
      amount,
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 20000, // 20 seconds timeout
    });

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ AI RESPONSE RECEIVED');
    console.log('   Status:', response.status);
    console.log('   Data:', JSON.stringify(response.data, null, 2));
    console.log('═══════════════════════════════════════════════════════');

    return response.data;
  } catch (error) {
    console.log('═══════════════════════════════════════════════════════');
    console.error('❌ AI SERVICE ERROR');
    console.error('   Endpoint:', endpoint);
    console.error('   Error Type:', error.code || error.name);
    console.error('   Message:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Response Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('   No response received - check if AI service is running');
      console.error('   Request:', error.request);
    }
    console.error('═══════════════════════════════════════════════════════');

    // Return default values if AI service is unavailable
    return {
      success: false,
      predicted_category: {
        category: 'General',
        confidence: 0,
        matched_keywords: [],
      },
      anomaly: {
        is_anomaly: false,
        reason: `AI service unavailable - ${error.message}`,
        severity: 'low',
      },
      error: error.message,
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

    const transactionAmount = parseFloat(amount);
    const transactionDate = date || new Date();

    console.log('📥 ADD TRANSACTION REQUEST');
    console.log('   Description:', description);
    console.log('   Amount:', transactionAmount);
    console.log('   Date:', transactionDate);
    console.log('   Type:', type || 'expense');

    // Call AI service to analyze transaction
    const analysisResult = await analyzeTransaction(description, transactionAmount, transactionDate);

    // Extract AI analysis data with safe optional chaining
    const predictedCategory = analysisResult?.predicted_category?.category || 'General';
    const confidence = analysisResult?.predicted_category?.confidence || 0;
    const isAnomaly = analysisResult?.anomaly?.is_anomaly || false;
    const anomalySeverity = analysisResult?.anomaly?.severity || 'low';
    const matchedKeywords = analysisResult?.predicted_category?.matched_keywords || [];

    console.log('📊 AI ANALYSIS RESULT');
    console.log('   Category:', predictedCategory);
    console.log('   Confidence:', confidence);
    console.log('   Matched Keywords:', matchedKeywords.join(', ') || 'none');
    console.log('   Is Anomaly:', isAnomaly);

    // Prepare transaction data with AI-enriched fields
    const transactionData = {
      description: description.trim(),
      amount: transactionAmount,
      date: transactionDate,
      type: type || 'expense',
      category: predictedCategory,
      accountId: accountId || null,
      metadata: {
        analysisConfidence: confidence,
        matchedKeywords,
        isAnomaly,
        anomalyReason: analysisResult?.anomaly?.reason || '',
        anomalySeverity,
        analyzedAt: new Date().toISOString(),
      },
    };

    // Create transaction
    const transaction = await Transaction.create(transactionData);

    // Populate account if exists
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('accountId', 'accountName accountNumber');

    console.log('✅ TRANSACTION CREATED');
    console.log('   ID:', transaction._id);
    console.log('   Category Assigned:', predictedCategory);

    return res.status(201).json({
      success: true,
      message: 'Transaction added successfully with AI analysis',
      data: populatedTransaction,
      analysis: {
        predictedCategory,
        confidence,
        isAnomaly,
        anomalySeverity,
        matchedKeywords,
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
      const date = req.body.date || transaction.date;

      const analysisResult = await analyzeTransaction(description, parseFloat(amount), date);

      req.body.category = analysisResult?.predicted_category?.category || transaction.category;
      req.body.metadata = {
        ...transaction.metadata,
        analysisConfidence: analysisResult?.predicted_category?.confidence || 0,
        matchedKeywords: analysisResult?.predicted_category?.matched_keywords || [],
        isAnomaly: analysisResult?.anomaly?.is_anomaly || false,
        anomalyReason: analysisResult?.anomaly?.reason || '',
        anomalySeverity: analysisResult?.anomaly?.severity || 'low',
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
