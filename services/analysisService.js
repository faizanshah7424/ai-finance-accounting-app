const axios = require('axios');

// Configuration
const ANALYSIS_API_URL = process.env.ANALYSIS_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const analysisClient = axios.create({
  baseURL: ANALYSIS_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

/**
 * Analyze a single transaction using the FastAPI analysis service
 * @param {Object} transaction - Transaction data
 * @param {string} transaction.description - Transaction description
 * @param {number} transaction.amount - Transaction amount
 * @param {string} [transaction.date] - Transaction date (optional)
 * @returns {Promise<Object>} Analysis result with category and anomaly detection
 */
const analyzeTransaction = async (transaction) => {
  try {
    const response = await analysisClient.post('/analyze', {
      description: transaction.description,
      amount: transaction.amount,
      date: transaction.date || null,
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return handleError(error, 'analyzeTransaction');
  }
};

/**
 * Analyze multiple transactions in batch
 * @param {Array<Object>} transactions - Array of transaction objects
 * @returns {Promise<Object>} Batch analysis results
 */
const analyzeTransactionsBatch = async (transactions) => {
  try {
    const response = await analysisClient.post('/analyze/batch', transactions);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return handleError(error, 'analyzeTransactionsBatch');
  }
};

/**
 * Get available categories and thresholds from the analysis API
 * @returns {Promise<Object>} Categories and thresholds configuration
 */
const getAnalysisCategories = async () => {
  try {
    const response = await analysisClient.get('/categories');

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return handleError(error, 'getAnalysisCategories');
  }
};

/**
 * Check if the analysis API is healthy
 * @returns {Promise<Object>} Health status
 */
const checkAnalysisHealth = async () => {
  try {
    const response = await analysisClient.get('/health');

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return handleError(error, 'checkAnalysisHealth');
  }
};

/**
 * Auto-categorize and enrich a transaction before saving
 * @param {Object} transactionData - Transaction data to enrich
 * @returns {Promise<Object>} Enriched transaction data
 */
const enrichTransaction = async (transactionData) => {
  try {
    const analysis = await analyzeTransaction({
      description: transactionData.description || '',
      amount: transactionData.amount || 0,
    });

    if (!analysis.success) {
      // Return original data if analysis fails
      return {
        success: true,
        data: transactionData,
        analysisFailed: true,
      };
    }

    // Enrich transaction with analysis results
    const enrichedData = {
      ...transactionData,
      category: analysis.data.predicted_category.category,
      analysisConfidence: analysis.data.predicted_category.confidence,
      matchedKeywords: analysis.data.predicted_category.matched_keywords,
      isAnomaly: analysis.data.anomaly.is_anomaly,
      anomalyReason: analysis.data.anomaly.reason,
      anomalySeverity: analysis.data.anomaly.severity,
    };

    return {
      success: true,
      data: enrichedData,
    };
  } catch (error) {
    return handleError(error, 'enrichTransaction');
  }
};

/**
 * Auto-categorize and enrich multiple transactions before saving
 * @param {Array<Object>} transactionsData - Array of transaction data to enrich
 * @returns {Promise<Object>} Array of enriched transaction data
 */
const enrichTransactionsBatch = async (transactionsData) => {
  try {
    const analysis = await analyzeTransactionsBatch(transactionsData);

    if (!analysis.success) {
      return {
        success: true,
        data: transactionsData,
        analysisFailed: true,
      };
    }

    // Merge original data with analysis results
    const enrichedData = analysis.data.results.map((result, index) => ({
      ...transactionsData[index],
      category: result.predicted_category.category,
      analysisConfidence: result.predicted_category.confidence,
      matchedKeywords: result.predicted_category.matched_keywords,
      isAnomaly: result.anomaly.is_anomaly,
      anomalyReason: result.anomaly.reason,
      anomalySeverity: result.anomaly.severity,
    }));

    return {
      success: true,
      data: enrichedData,
      anomaliesDetected: analysis.data.anomalies_detected,
    };
  } catch (error) {
    return handleError(error, 'enrichTransactionsBatch');
  }
};

/**
 * Handle axios errors
 * @param {Error} error - Axios error
 * @param {string} context - Function context
 * @returns {Object} Error response object
 */
const handleError = (error, context) => {
  console.error(`[AnalysisAPI] Error in ${context}:`, error.message);

  if (error.response) {
    // Server responded with error status
    return {
      success: false,
      error: {
        message: error.response.data.detail || error.response.data.message || 'Analysis API error',
        status: error.response.status,
        data: error.response.data,
      },
    };
  }

  if (error.request) {
    // Request made but no response
    return {
      success: false,
      error: {
        message: 'No response from Analysis API. Ensure the service is running.',
        status: null,
        code: error.code,
      },
    };
  }

  // Other errors
  return {
    success: false,
    error: {
      message: error.message || 'Unknown error',
      status: null,
    },
  };
};

module.exports = {
  analyzeTransaction,
  analyzeTransactionsBatch,
  getAnalysisCategories,
  checkAnalysisHealth,
  enrichTransaction,
  enrichTransactionsBatch,
};
