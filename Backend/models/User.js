const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: function() { return !this.isGoogleUser; } }, // Only required for non-Google users
  role: { type: String, enum: ['customer', 'artisan', 'admin'], default: 'customer' },
  userType: { type: String, enum: ['customer', 'provider'], default: 'customer' }, // Frontend-facing user type
  isApproved: { type: Boolean, default: false },
  profilePicture: { type: String }, // For Google OAuth
  isGoogleUser: { type: Boolean, default: false }, // Flag for Google OAuth users
  resetPasswordToken: String,
  resetPasswordExpires: Date
});

module.exports = mongoose.model('User', userSchema);
