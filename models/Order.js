const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product_id: { type: String, required: true },
  name: { type: String, required: true },
  size: { type: String, required: true },
  color: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
});

const orderSchema = new mongoose.Schema({
  user_email: { type: String, required: true },
  user_full_name: { type: String, required: true },
  items: { type: [orderItemSchema], required: true },
  total_amount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  shipping_address: { type: String, required: true },
  phone: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);
