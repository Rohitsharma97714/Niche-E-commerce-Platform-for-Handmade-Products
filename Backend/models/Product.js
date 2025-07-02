const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  image: { type: String, required: true },
  category: String,
  artisanId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  isApproved: { type: Boolean, default: false },
});

module.exports = mongoose.model('Product', productSchema);