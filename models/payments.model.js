const mongoose = require('mongoose');

const payments = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'Order ID is required'],
    unique: true, // Ensures one payment per order (optional, depending on your needs)
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Amount cannot be negative'],
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    enum: ['USD', 'EUR', 'EGP'], 
    default: 'USD',
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: ['credit_card', 'paypal', 'cash_on_delivery', 'bank_transfer'], 
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true, // Allows null values while enforcing uniqueness for non-null values
  },
  paymentGateway: {
    type: String,
    enum: ['stripe', 'paypal', 'manual', null], // Null for cash on delivery, etc.
    default: null,
  },
 
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }, 
});



const Payment = mongoose.model('Payment', payments);

module.exports = Payment;