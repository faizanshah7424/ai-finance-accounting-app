const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');

const {
  getAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
  getAccountSummary,
} = require('../controllers/accountController');

// Validation middleware
const createAccountValidator = [
  body('accountName')
    .trim()
    .notEmpty()
    .withMessage('Account name is required')
    .isLength({ max: 100 })
    .withMessage('Account name cannot exceed 100 characters'),
  body('accountType')
    .notEmpty()
    .withMessage('Account type is required')
    .isIn(['asset', 'liability', 'equity', 'income', 'expense'])
    .withMessage('Invalid account type'),
  body('accountNumber')
    .trim()
    .notEmpty()
    .withMessage('Account number is required'),
  body('balance')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Balance cannot be negative'),
  body('currency')
    .optional()
    .isLength({ max: 3 })
    .withMessage('Currency must be 3 characters'),
];

const updateAccountValidator = [
  param('id').isMongoId().withMessage('Invalid account ID'),
  body('accountName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Account name cannot exceed 100 characters'),
  body('accountType')
    .optional()
    .isIn(['asset', 'liability', 'equity', 'income', 'expense'])
    .withMessage('Invalid account type'),
  body('balance')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Balance cannot be negative'),
];

const idValidator = [
  param('id').isMongoId().withMessage('Invalid account ID'),
];

// Routes
router.route('/summary').get(getAccountSummary);

router
  .route('/')
  .get(getAccounts)
  .post(createAccountValidator, createAccount);

router
  .route('/:id')
  .get(idValidator, getAccount)
  .put(updateAccountValidator, updateAccount)
  .delete(idValidator, deleteAccount);

module.exports = router;
