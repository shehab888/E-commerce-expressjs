const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity cannot be less than 1'],
    },
    price: { 
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
  }],
  total: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total cannot be negative'],
  },
  shippingAddresse: {
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      minlength: [3, 'Country name must be at least 3 characters'],
      maxlength: [50, 'Country name cannot exceed 50 characters'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      minlength: [3, 'City name must be at least 3 characters'],
      maxlength: [50, 'City name cannot exceed 50 characters'],
    },
    street: { 
      type: String,
      required: [true, 'Street is required'],
      trim: true,
    },
    zipCode: { // Optional but useful
      type: String,
      trim: true,
    },
  },
  status: {
    type: String,
    enum: ['created', 'paid','cancelled'], 
    default: 'created',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }, 
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;