const Transaction = require('../models/Transaction');
const {
  analyzeTransaction,
  enrichTransaction,
} = require('../services/analysisService');

// @desc    Add transaction with AI-powered categorization
// @route   POST /api/v1/transactions/ai
// @access  Public
const addTransactionWithAnalysis = async (req, res, next) => {
  try {
    const { description, amount, type, date, accountId } = req.body;

    // Validate required fields
    if (!description || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Description and amount are required',
      });
    }

    // Enrich transaction with AI analysis
    const analysisResult = await enrichTransaction({
      description,
      amount,
      date,
    });

    if (!analysisResult.success) {
      return res.status(503).json({
        success: false,
        message: 'Failed to analyze transaction',
        error: analysisResult.error,
      });
    }

    // Create transaction with AI-enriched data
    const transactionData = {
      amount,
      type: type || 'expense',
      category: analysisResult.data.category || 'Uncategorized',
      date: date || new Date(),
      description,
      accountId: accountId || null,
      // Store analysis metadata
      metadata: {
        analysisConfidence: analysisResult.data.analysisConfidence,
        matchedKeywords: analysisResult.data.matchedKeywords,
        isAnomaly: analysisResult.data.isAnomaly,
        anomalyReason: analysisResult.data.anomalyReason,
        anomalySeverity: analysisResult.data.anomalySeverity,
        analyzedAt: new Date().toISOString(),
      },
    };

    const transaction = await Transaction.create(transactionData);

    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('accountId', 'accountName accountNumber');

    res.status(201).json({
      success: true,
      message: 'Transaction added with AI analysis',
      data: populatedTransaction,
      analysis: {
        predictedCategory: analysisResult.data.category,
        confidence: analysisResult.data.analysisConfidence,
        isAnomaly: analysisResult.data.isAnomaly,
        anomalySeverity: analysisResult.data.anomalySeverity,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Analyze transaction without saving
// @route   POST /api/v1/transactions/analyze
// @access  Public
const previewTransactionAnalysis = async (req, res, next) => {
  try {
    const { description, amount, date } = req.body;

    if (!description || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Description and amount are required',
      });
    }

    const analysisResult = await analyzeTransaction({
      description,
      amount,
      date,
    });

    if (!analysisResult.success) {
      return res.status(503).json({
        success: false,
        message: 'Failed to analyze transaction',
        error: analysisResult.error,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Transaction analyzed successfully',
      data: analysisResult.data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addTransactionWithAnalysis,
  previewTransactionAnalysis,
};
