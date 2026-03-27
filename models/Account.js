const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
  {
    accountName: {
      type: String,
      required: [true, 'Account name is required'],
      trim: true,
      maxlength: [100, 'Account name cannot exceed 100 characters'],
    },
    accountType: {
      type: String,
      required: [true, 'Account type is required'],
      enum: ['asset', 'liability', 'equity', 'income', 'expense'],
      default: 'asset',
    },
    accountNumber: {
      type: String,
      required: [true, 'Account number is required'],
      unique: true,
      trim: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: [0, 'Balance cannot be negative'],
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    parentAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for better query performance
accountSchema.index({ accountNumber: 1 });
accountSchema.index({ accountType: 1 });
accountSchema.index({ isActive: 1 });

// Virtual for child accounts
accountSchema.virtual('childAccounts', {
  ref: 'Account',
  localField: '_id',
  foreignField: 'parentAccount',
});

// Pre-save middleware
accountSchema.pre('save', function (next) {
  if (this.isModified('accountName')) {
    this.accountName = this.accountName.trim();
  }
  next();
});

// Static method to find by type
accountSchema.statics.findByType = function (type) {
  return this.find({ accountType: type, isActive: true });
};

// Instance method to check if account can be deleted
accountSchema.methods.canBeDeleted = async function () {
  const childCount = await this.constructor.countDocuments({
    parentAccount: this._id,
  });
  return childCount === 0;
};

module.exports = mongoose.model('Account', accountSchema);
