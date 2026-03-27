const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');

const {
  addTransactionWithAnalysis,
  previewTransactionAnalysis,
} = require('../controllers/aiTransactionController');

// Validation middleware
const aiTransactionValidator = [
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('type')
    .optional()
    .isIn(['income', 'expense'])
    .withMessage('Type must be income or expense'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  body('accountId')
    .optional()
    .isMongoId()
    .withMessage('Invalid account ID'),
];

// Routes
router.post('/analyze', aiTransactionValidator, previewTransactionAnalysis);
router.post('/', aiTransactionValidator, addTransactionWithAnalysis);

module.exports = router;
