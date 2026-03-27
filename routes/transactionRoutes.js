const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');

const {
  addTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  getCategories,
} = require('../controllers/transactionController');

// Validation error handler middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

// Validation middleware for creating transactions
const addTransactionValidator = [
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
  body('date')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Invalid date format'),
  body('type')
    .optional({ nullable: true })
    .isIn(['income', 'expense'])
    .withMessage('Type must be income or expense'),
  body('accountId')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid account ID'),
];

// Validation middleware for updating transactions
const updateTransactionValidator = [
  param('id').isMongoId().withMessage('Invalid transaction ID'),
  body('amount')
    .optional({ nullable: true })
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('type')
    .optional({ nullable: true })
    .isIn(['income', 'expense'])
    .withMessage('Type must be income or expense'),
  body('date')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Invalid date format'),
  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
];

// Validation middleware for ID parameter
const idValidator = [
  param('id').isMongoId().withMessage('Invalid transaction ID'),
];

// Validation middleware for query parameters
const getTransactionsValidator = [
  query('type')
    .optional({ nullable: true })
    .isIn(['income', 'expense'])
    .withMessage('Type must be income or expense'),
  query('page')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional({ nullable: true })
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

// Routes
router.route('/categories').get(getCategories);

router
  .route('/')
  .get(getTransactionsValidator, handleValidationErrors, getTransactions)
  .post(addTransactionValidator, handleValidationErrors, addTransaction);

router
  .route('/:id')
  .get(idValidator, handleValidationErrors, getTransaction)
  .put(updateTransactionValidator, handleValidationErrors, updateTransaction)
  .delete(idValidator, handleValidationErrors, deleteTransaction);

module.exports = router;
