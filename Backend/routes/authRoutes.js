const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const nodemailer = require('nodemailer');

// 🔒 Update Password (authenticated)
// Update the route to use authMiddleware and get user from token
// In your backend (authRoutes.js)
// Update the route to use authMiddleware and get user from token
router.put('/update-password', authMiddleware, async (req, res) => {
  const { oldPassword, newPassword } = req.body; // Remove email from destructuring

  try {
    // Get user from token (authMiddleware adds req.user)
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Old password is incorrect' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Update password error:', err);
    res.status(500).json({ error: 'Password update failed' });
  }
});

// 📩 Forgot Password (send email with reset link)
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(200).json({ message: 'If this email exists, a reset link has been sent.' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '10m' });

    // From your React/Vite dev server output ("On Your Network:")
    const resetLink = `http://192.168.20.1:3000/reset-password/${token}`;

    // Setup email service
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: 'Desi-Etsy Password Reset',
      html: `<p>Click below to reset your password:</p>
             <a href="${resetLink}">${resetLink}</a>
             <p>This link expires in 10 minutes.</p>`,
    });

    res.status(200).json({ message: 'Reset link sent' });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: 'Could not send reset link' });
  }
});
// Reset Password Endpoint
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by ID from token
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Reset link has expired' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: 'Invalid reset link' });
    }
    
    res.status(500).json({ message: 'Password reset failed' });
  }
});

router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (role === 'admin') {
      return res.status(403).json({ error: 'Unauthorized to register as admin' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      isApproved: role === 'artisan' ? false : true
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: err.message });
  }
});



router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // ✅ Generate a JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    // ✅ Return both user and token
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});


// 📋 Get User Profile (authenticated)
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user);
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// ✏️ Update User Profile (authenticated)
router.put('/profile', authMiddleware, async (req, res) => {
  const { name, email } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
