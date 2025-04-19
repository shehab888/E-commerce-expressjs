// models/Payment.js
const mongoose = require('mongoose');

// Payment Schema
const paymentSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  paymentIntentId: { 
    type: String, 
    required: true 
  }, // Payment intent ID from Stripe
  amount: { 
    type: Number, 
    required: true 
  }, // Amount paid
  status: { 
    type: String, 
    required: true 
  }, // Payment status (e.g., succeeded, failed)
  orderIds: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order' 
  }], // Linking payment with orders
  createdAt: { 
    type: Date, 
    default: Date.now 
  }, // Timestamp of payment creation
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
