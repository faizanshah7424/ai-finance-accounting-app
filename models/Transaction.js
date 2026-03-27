const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, 'Transaction description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Transaction amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    type: {
      type: String,
      required: [true, 'Transaction type is required'],
      enum: ['income', 'expense'],
      default: 'expense',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      maxlength: [50, 'Category cannot exceed 50 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Transaction date is required'],
      default: Date.now,
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      default: null,
    },
    // AI Analysis Metadata
    metadata: {
      analysisConfidence: {
        type: Number,
        default: 0,
        min: 0,
        max: 1,
      },
      matchedKeywords: {
        type: [String],
        default: [],
      },
      isAnomaly: {
        type: Boolean,
        default: false,
      },
      anomalyReason: {
        type: String,
        default: '',
        maxlength: [500, 'Reason cannot exceed 500 characters'],
      },
      anomalySeverity: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low',
      },
      analyzedAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
transactionSchema.index({ type: 1 });
transactionSchema.index({ category: 1 });
transactionSchema.index({ date: -1 });
transactionSchema.index({ accountId: 1 });
transactionSchema.index({ 'metadata.isAnomaly': 1 });

// Compound index for common queries
transactionSchema.index({ type: 1, date: -1 });
transactionSchema.index({ category: 1, date: -1 });

// Pre-save middleware
transactionSchema.pre('save', async function() {
  // Ensure category is always set
  if (!this.category) {
    this.category = 'Uncategorized';
  }

  // Trim description
  if (this.isModified('description')) {
    this.description = this.description.trim();
  }
});

// Static method to find by type
transactionSchema.statics.findByType = function (type) {
  return this.find({ type });
};

// Static method to get total by type
transactionSchema.statics.getTotalByType = async function (type, startDate, endDate) {
  const query = { type };
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  const result = await this.aggregate([
    { $match: query },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  return result.length > 0 ? result[0].total : 0;
};

// Instance method to check if transaction can be modified
transactionSchema.methods.canBeModified = function () {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return this.date >= thirtyDaysAgo;
};

// Instance method to check if transaction is anomalous
transactionSchema.methods.isAnomalous = function () {
  return this.metadata?.isAnomaly || false;
};

module.exports = mongoose.model('Transaction', transactionSchema);
