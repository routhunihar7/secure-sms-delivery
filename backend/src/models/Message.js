const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    recipientPhone: {
      type: String,
      required: [true, 'Recipient phone number is required'],
      trim: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
      default: 'Confidential Secure Message',
    },
    message: {
      type: String,
      required: [true, 'Message content is required'],
      maxlength: [5000, 'Message cannot exceed 5000 characters'],
    },
    imageUrl: {
      type: String,
      trim: true,
      default: '',
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration date is required'],
      index: true,
    },
    openedAt: {
      type: Date,
      default: null,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    isOneTime: {
      type: Boolean,
      default: true,
    },
    smsSentAt: {
      type: Date,
      default: null,
    },
    smsStatus: {
      type: String,
      enum: ['not_sent', 'pending', 'sent', 'mock_sent', 'failed'],
      default: 'not_sent',
    },
    smsSid: {
      type: String,
      default: '',
    },
    smsError: {
      type: String,
      default: '',
    },
    consentGiven: {
      type: Boolean,
      required: [true, 'Recipient consent confirmation is required'],
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    openedMeta: {
      ip: String,
      userAgent: String,
    },
  },
  {
    timestamps: true,
  }
);

// Helper to mask phone numbers for safe display: e.g., "+1 (***) ***-1234" or "+91 ********56"
messageSchema.methods.getMaskedPhone = function () {
  if (!this.recipientPhone) return '';
  const digits = this.recipientPhone.replace(/\D/g, '');
  if (digits.length <= 4) return '***' + digits;
  const lastFour = digits.slice(-4);
  const prefix = this.recipientPhone.startsWith('+') ? '+' + digits.slice(0, 2) : '';
  return `${prefix} •••• •••• ${lastFour}`;
};

// Check if message is currently accessible
messageSchema.methods.isAccessible = function () {
  if (!this.isActive) return { valid: false, reason: 'revoked' };
  if (new Date() > this.expiresAt) return { valid: false, reason: 'expired' };
  if (this.isOneTime && this.openedAt && this.viewCount >= 1) {
    return { valid: false, reason: 'already_viewed' };
  }
  return { valid: true };
};

module.exports = mongoose.model('Message', messageSchema);
