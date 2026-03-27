const Account = require('../models/Account');

// @desc    Get all accounts
// @route   GET /api/v1/accounts
// @access  Public
const getAccounts = async (req, res, next) => {
  try {
    const { accountType, isActive, page = 1, limit = 10, sort = 'createdAt' } = req.query;

    const query = {};
    if (accountType) query.accountType = accountType;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sort]: -1 },
    };

    const accounts = await Account.find(query)
      .populate('parentAccount', 'accountName accountNumber')
      .sort(options.sort)
      .limit(options.limit)
      .skip((options.page - 1) * options.limit);

    const total = await Account.countDocuments(query);

    res.status(200).json({
      success: true,
      count: accounts.length,
      total,
      page: options.page,
      pages: Math.ceil(total / options.limit),
      data: accounts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single account
// @route   GET /api/v1/accounts/:id
// @access  Public
const getAccount = async (req, res, next) => {
  try {
    const account = await Account.findById(req.params.id).populate('childAccounts');

    if (!account) {
      return res.status(404).json({
        success: false,
        message: `Account not found with id: ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new account
// @route   POST /api/v1/accounts
// @access  Public
const createAccount = async (req, res, next) => {
  try {
    const account = await Account.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: account,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Account number already exists',
      });
    }
    next(error);
  }
};

// @desc    Update account
// @route   PUT /api/v1/accounts/:id
// @access  Public
const updateAccount = async (req, res, next) => {
  try {
    const account = await Account.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: `Account not found with id: ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Account updated successfully',
      data: account,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Account number already exists',
      });
    }
    next(error);
  }
};

// @desc    Delete account
// @route   DELETE /api/v1/accounts/:id
// @access  Public
const deleteAccount = async (req, res, next) => {
  try {
    const account = await Account.findById(req.params.id);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: `Account not found with id: ${req.params.id}`,
      });
    }

    const canDelete = await account.canBeDeleted();
    if (!canDelete) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete account with child accounts',
      });
    }

    await account.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get account balance summary
// @route   GET /api/v1/accounts/summary
// @access  Public
const getAccountSummary = async (req, res, next) => {
  try {
    const summary = await Account.aggregate([
      {
        $match: { isActive: true },
      },
      {
        $group: {
          _id: '$accountType',
          totalBalance: { $sum: '$balance' },
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      count: summary.length,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
  getAccountSummary,
};
