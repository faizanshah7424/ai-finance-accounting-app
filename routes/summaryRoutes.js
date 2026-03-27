const express = require('express');
const router = express.Router();
const { query } = require('express-validator');

const {
  getFinancialSummary,
  getBalanceOverview,
} = require('../controllers/summaryController');

// Validation middleware
const summaryValidator = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format'),
];

// Routes
router.get('/financial', summaryValidator, getFinancialSummary);
router.get('/overview', summaryValidator, getBalanceOverview);

module.exports = router;
